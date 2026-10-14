import type {
  Period,
  LastFmUser,
  LastFmArtist,
  LastFmTrack,
  LastFmAlbum,
  LastFmRecentTrack,
  HourCount,
  DayCount,
  UserStatsPayload,
} from '../types/lastfm';
import { estimateDecades, calculateVelocity } from '../utils/decadeEstimator';
import {
  calculateObscurity,
  calculateRepeatObsession,
  calculateCatalogDiversity,
  determineSonicPersona,
  buildTasteRatings,
} from '../utils/insightsEngine';

export class LastFmError extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.name = 'LastFmError';
    this.code = code;
  }
}

const FALLBACK_LASTFM_API_KEY = 'aa72a3b1161d33d0eba36f986fa1fb43';
const clientMemoryCache = new Map<string, { data: any; timestamp: number }>();
const CLIENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchFromProxy(method: string, user: string, period?: Period, limit?: number) {
  const cacheKey = `${method}:${user}:${period || ''}:${limit || ''}`;
  const cached = clientMemoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
    return cached.data;
  }

  const params = new URLSearchParams({
    method,
    user,
  });
  if (period) params.set('period', period);
  if (limit) params.set('limit', limit.toString());

  let json: any = null;
  let usedProxy = false;

  // 1. Try local /api/lastfm proxy first (used in development and fullstack Node deployment)
  try {
    const proxyRes = await fetch(`/api/lastfm?${params.toString()}`);
    if (proxyRes.ok) {
      json = await proxyRes.json();
      usedProxy = true;
    }
  } catch {
    // If proxy is not available (e.g. static host), proceed to direct API call
  }

  // 2. Fallback to direct Last.fm public API (enables static hosting on GitHub Pages with CORS)
  if (!usedProxy) {
    const apiKey = (import.meta as any).env?.VITE_LASTFM_API_KEY || FALLBACK_LASTFM_API_KEY;
    const directUrl = `https://ws.audioscrobbler.com/2.0/?${params.toString()}&api_key=${apiKey}&format=json`;
    try {
      const directRes = await fetch(directUrl);
      json = await directRes.json();
    } catch {
      throw new LastFmError('Could not reach Last.fm. Try again in a minute.');
    }
  }

  if (!json) {
    throw new LastFmError('Could not reach Last.fm. Try again in a minute.');
  }

  if (json.error) {
    if (json.error === 6) {
      throw new LastFmError(`There is no Last.fm user called "${user}". Check the spelling.`, 6);
    }
    if (json.error === 17) {
      throw new LastFmError(`The profile "${user}" is private, so its history can't be read.`, 17);
    }
    throw new LastFmError('Could not reach Last.fm. Try again in a minute.', json.error);
  }

  clientMemoryCache.set(cacheKey, { data: json, timestamp: Date.now() });
  return json;
}

export async function fetchUserFullStats(username: string, period: Period = '12month'): Promise<UserStatsPayload> {
  const cleanUser = username.trim();

  // Run in parallel with higher limits for richer artist drilldown
  const [infoRes, artistsRes, tracksRes, albumsRes, recentRes] = await Promise.all([
    fetchFromProxy('user.getinfo', cleanUser),
    fetchFromProxy('user.gettopartists', cleanUser, period, 50),
    fetchFromProxy('user.gettoptracks', cleanUser, period, 50),
    fetchFromProxy('user.gettopalbums', cleanUser, period, 30),
    fetchFromProxy('user.getrecenttracks', cleanUser, undefined, 200),
  ]);

  const user: LastFmUser = infoRes.user;
  const artists: LastFmArtist[] = artistsRes?.topartists?.artist || [];
  const tracks: LastFmTrack[] = tracksRes?.toptracks?.track || [];
  const albums: LastFmAlbum[] = albumsRes?.topalbums?.album || [];
  const rawRecent = recentRes?.recenttracks?.track || [];
  const recentTracks: LastFmRecentTrack[] = Array.isArray(rawRecent) ? rawRecent : [rawRecent];

  // Now Playing detection
  const activeNowPlaying = recentTracks.find((t) => t['@attr']?.nowplaying === 'true') || null;

  // Total tracks & days calculation
  const totalPlays = parseInt(user.playcount || '0', 10);
  const regUnixtime = user.registered?.unixtime ? parseInt(user.registered.unixtime, 10) : 0;
  const regDate = regUnixtime ? new Date(regUnixtime * 1000) : new Date();
  const registeredYear = regDate.getFullYear();

  // Music days estimate (average track ~ 3.5 minutes = 210 seconds)
  const daysOfMusic = Math.max(1, Math.round((totalPlays * 3.5) / 1440));

  const daysSinceReg = Math.max(1, (Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24));
  const playsPerDay = Math.max(1, Math.round(totalPlays / daysSinceReg));
  const totalArtists = parseInt(user.artist_count || '0', 10) || artists.length;

  // 24-hour distribution from last 200 plays
  const hourBins: number[] = new Array(24).fill(0);
  // 7-day weekday distribution (Mon = 0, ..., Sun = 6)
  const dayBins: number[] = new Array(7).fill(0);

  recentTracks.forEach((t) => {
    if (t.date?.uts) {
      const uts = parseInt(t.date.uts, 10);
      if (!isNaN(uts)) {
        const date = new Date(uts * 1000);
        const h = date.getHours();
        if (h >= 0 && h < 24) {
          hourBins[h]++;
        }
        // getDay: 0 is Sun, 1 is Mon... convert to 0 = Mon, 6 = Sun
        const dayIdx = (date.getDay() + 6) % 7;
        dayBins[dayIdx]++;
      }
    }
  });

  const hours: HourCount[] = hourBins.map((count, hour) => ({
    hour,
    count,
    isNight: hour >= 22 || hour <= 5,
  }));

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayFullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const days: DayCount[] = dayBins.map((count, dayIndex) => ({
    dayIndex,
    dayName: dayNames[dayIndex],
    fullName: dayFullNames[dayIndex],
    count,
    isWeekend: dayIndex >= 5, // Sat, Sun
  }));

  // Peak hour
  let peakHour = 0;
  let peakHourCount = 0;
  hours.forEach((h) => {
    if (h.count > peakHourCount) {
      peakHourCount = h.count;
      peakHour = h.hour;
    }
  });

  // Peak day
  let peakDayName = 'Monday';
  let peakDayCount = 0;
  days.forEach((d) => {
    if (d.count > peakDayCount) {
      peakDayCount = d.count;
      peakDayName = d.fullName;
    }
  });

  // Night owl scrobble percentage
  const totalRecentDated = hours.reduce((acc, h) => acc + h.count, 0) || 1;
  const nightCount = hours.filter((h) => h.isNight).reduce((acc, h) => acc + h.count, 0);
  const nightOwlPercentage = Math.round((nightCount / totalRecentDated) * 100);

  // Top artist share of top ten
  const topTenArtists = artists.slice(0, 10);
  const topTenPlays = topTenArtists.reduce((sum, a) => sum + (parseInt(a.playcount, 10) || 0), 0);
  const topArtistPlays = topTenArtists[0] ? parseInt(topTenArtists[0].playcount, 10) || 0 : 0;
  const topArtistShareOfTopTen = topTenPlays > 0 ? Math.round((topArtistPlays / topTenPlays) * 100) : 0;

  // Decades breakdown
  const decades = estimateDecades(artists, albums, tracks, registeredYear);
  let topDecade = decades[0];
  decades.forEach((dec) => {
    if (dec.count > topDecade.count) {
      topDecade = dec;
    }
  });

  // Velocity calculation
  const velocity = calculateVelocity(playsPerDay, recentTracks);

  // New Recap-Exclusive Insights & Deep Analytics
  const obscurity = calculateObscurity(artists);
  const repeatObsession = calculateRepeatObsession(tracks);
  const diversity = calculateCatalogDiversity(artists, totalArtists);
  const sonicPersona = determineSonicPersona(
    nightOwlPercentage,
    obscurity,
    repeatObsession,
    diversity,
    topDecade,
    velocity
  );

  const tasteRatings = buildTasteRatings(
    obscurity,
    diversity,
    repeatObsession,
    nightOwlPercentage,
    peakHour,
    topDecade,
    velocity
  );

  return {
    username: user.name || cleanUser,
    user,
    artists,
    tracks,
    albums,
    recentTracks,
    nowPlayingTrack: activeNowPlaying,
    hours,
    days,
    decades,
    stats: {
      totalPlays,
      registeredYear,
      daysOfMusic,
      playsPerDay,
      totalArtists,
      peakHour,
      peakHourCount,
      nightOwlPercentage,
      topArtistShareOfTopTen,
      peakDayName,
      peakDayCount,
      topDecade,
      velocity,
      sonicPersona,
      obscurity,
      repeatObsession,
      diversity,
      tasteRatings,
    },
  };
}
