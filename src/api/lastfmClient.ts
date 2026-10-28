import type {
  Period,
  LastFmUser,
  LastFmArtist,
  LastFmTrack,
  LastFmAlbum,
  LastFmRecentTrack,
  ArtistEnrichedMeta,
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
const artistMetaCache = new Map<string, { data: ArtistEnrichedMeta; timestamp: number }>();
const CLIENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const ARTIST_META_TTL = 60 * 60 * 1000; // 60 minutes

interface FetchParams {
  user?: string;
  artist?: string;
  period?: Period;
  limit?: number;
  page?: number;
  from?: number;
  to?: number;
  autocorrect?: string;
}

async function fetchFromProxy(method: string, options: FetchParams, timeoutMs?: number) {
  const params = new URLSearchParams({ method });
  if (options.user) params.set('user', options.user);
  if (options.artist) params.set('artist', options.artist);
  if (options.period) params.set('period', options.period);
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.page) params.set('page', options.page.toString());
  if (options.from) params.set('from', options.from.toString());
  if (options.to) params.set('to', options.to.toString());
  if (options.autocorrect) params.set('autocorrect', options.autocorrect);

  const cacheKey = params.toString().toLowerCase();
  const cached = clientMemoryCache.get(cacheKey);
  const ttl = method.startsWith('artist.') ? ARTIST_META_TTL : CLIENT_CACHE_TTL;
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const fetchWithOptionalTimeout = async (url: string) => {
    if (!timeoutMs) {
      return fetch(url);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };

  let json: any = null;
  let usedProxy = false;

  // 1. Try local /api/lastfm proxy first (used in development and fullstack Node deployment)
  try {
    const proxyRes = await fetchWithOptionalTimeout(`/api/lastfm?${params.toString()}`);
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
      const directRes = await fetchWithOptionalTimeout(directUrl);
      json = await directRes.json();
    } catch {
      throw new LastFmError('Could not reach Last.fm. Try again in a minute.');
    }
  }

  if (!json) {
    throw new LastFmError('Could not reach Last.fm. Try again in a minute.');
  }

  if (json.error) {
    if (json.error === 6 && options.user) {
      throw new LastFmError(`There is no Last.fm user called "${options.user}". Check the spelling.`, 6);
    }
    if (json.error === 17 && options.user) {
      throw new LastFmError(`The profile "${options.user}" is private, so its history can't be read.`, 17);
    }
    throw new LastFmError('Could not reach Last.fm. Try again in a minute.', json.error);
  }

  clientMemoryCache.set(cacheKey, { data: json, timestamp: Date.now() });
  return json;
}

async function fetchEnrichedArtistMeta(artistName: string): Promise<ArtistEnrichedMeta | null> {
  const cleanKey = artistName.trim().toLowerCase();
  if (!cleanKey) return null;

  const cached = artistMetaCache.get(cleanKey);
  if (cached && Date.now() - cached.timestamp < ARTIST_META_TTL) {
    return cached.data;
  }

  try {
    const res = await fetchFromProxy(
      'artist.getinfo',
      { artist: artistName.trim(), autocorrect: '1' },
      2800
    );
    const art = res?.artist;
    if (!art) return null;

    const globalListeners = parseInt(art.stats?.listeners || '0', 10) || 0;
    const globalPlaycount = parseInt(art.stats?.playcount || '0', 10) || 0;
    const rawTags = art.tags?.tag;
    const tagList = Array.isArray(rawTags) ? rawTags : rawTags ? [rawTags] : [];
    const tags = tagList
      .map((t: any) => (typeof t?.name === 'string' ? t.name.toLowerCase() : ''))
      .filter(Boolean);
    const bioSummary = typeof art.bio?.summary === 'string' ? art.bio.summary : '';

    const meta: ArtistEnrichedMeta = {
      name: art.name || artistName,
      globalListeners,
      globalPlaycount,
      tags,
      bioSummary,
    };

    artistMetaCache.set(cleanKey, { data: meta, timestamp: Date.now() });
    return meta;
  } catch {
    return null;
  }
}

export async function fetchUserFullStats(
  username: string,
  period: Period = '12month'
): Promise<UserStatsPayload> {
  const cleanUser = username.trim();
  const nowSec = Math.floor(Date.now() / 1000);
  const thirtyDaysAgoUts = nowSec - 30 * 86400;

  let periodFromUts: number | undefined;
  if (period === '1month') {
    periodFromUts = thirtyDaysAgoUts;
  } else if (period === '6month') {
    periodFromUts = nowSec - 182 * 86400;
  } else if (period === '12month') {
    periodFromUts = nowSec - 365 * 86400;
  }

  // Run primary user queries in parallel
  const [
    infoRes,
    artistsRes,
    tracksRes,
    albumsRes,
    recentPage1Res,
    recentPage2Res,
    last30DayCountRes,
    periodCountRes,
  ] = await Promise.all([
    fetchFromProxy('user.getinfo', { user: cleanUser }),
    fetchFromProxy('user.gettopartists', { user: cleanUser, period, limit: 50 }),
    fetchFromProxy('user.gettoptracks', { user: cleanUser, period, limit: 50 }),
    fetchFromProxy('user.gettopalbums', { user: cleanUser, period, limit: 30 }),
    fetchFromProxy('user.getrecenttracks', { user: cleanUser, limit: 200, page: 1 }),
    fetchFromProxy('user.getrecenttracks', { user: cleanUser, limit: 200, page: 2 }).catch(
      () => null
    ),
    fetchFromProxy('user.getrecenttracks', {
      user: cleanUser,
      limit: 1,
      from: thirtyDaysAgoUts,
    }).catch(() => null),
    periodFromUts && periodFromUts !== thirtyDaysAgoUts
      ? fetchFromProxy('user.getrecenttracks', {
          user: cleanUser,
          limit: 1,
          from: periodFromUts,
        }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const user: LastFmUser = infoRes.user;
  const rawArtists = artistsRes?.topartists?.artist || [];
  const artists: LastFmArtist[] = Array.isArray(rawArtists) ? rawArtists : [rawArtists];

  const rawTracks = tracksRes?.toptracks?.track || [];
  const tracks: LastFmTrack[] = Array.isArray(rawTracks) ? rawTracks : [rawTracks];

  const rawAlbums = albumsRes?.topalbums?.album || [];
  const albums: LastFmAlbum[] = Array.isArray(rawAlbums) ? rawAlbums : [rawAlbums];

  const rawRecent1 = recentPage1Res?.recenttracks?.track || [];
  const recent1: LastFmRecentTrack[] = Array.isArray(rawRecent1) ? rawRecent1 : [rawRecent1];

  const rawRecent2 = recentPage2Res?.recenttracks?.track || [];
  const recent2: LastFmRecentTrack[] = Array.isArray(rawRecent2) ? rawRecent2 : [rawRecent2];

  // Combine and deduplicate recent tracks by timestamp (preserving any active nowplaying track)
  const seenUts = new Set<string>();
  const combinedRecent: LastFmRecentTrack[] = [];
  for (const t of [...recent1, ...recent2]) {
    if (!t) continue;
    if (t['@attr']?.nowplaying === 'true') {
      if (!combinedRecent.some((x) => x['@attr']?.nowplaying === 'true')) {
        combinedRecent.push(t);
      }
      continue;
    }
    const uts = t.date?.uts;
    if (uts) {
      const key = `${uts}:${t.name}`;
      if (!seenUts.has(key)) {
        seenUts.add(key);
        combinedRecent.push(t);
      }
    }
  }

  const recentTracks = combinedRecent.slice(0, 400);

  // Enrich top 15 artists with global Last.fm listener counts, decade tags, and bio years in parallel
  const artistMetaMap = new Map<string, ArtistEnrichedMeta>();
  const topArtistsToEnrich = artists.slice(0, 15);
  if (topArtistsToEnrich.length > 0) {
    const metaResults = await Promise.all(
      topArtistsToEnrich.map((a) => fetchEnrichedArtistMeta(a.name))
    );
    metaResults.forEach((meta, idx) => {
      if (meta) {
        artistMetaMap.set(topArtistsToEnrich[idx].name.trim().toLowerCase(), meta);
      }
    });
  }

  // Now Playing detection
  const activeNowPlaying = recentTracks.find((t) => t['@attr']?.nowplaying === 'true') || null;

  // Lifetime vs. Period-Specific Totals
  const lifetimePlays =
    parseInt(user.playcount || '0', 10) ||
    parseInt(recentPage1Res?.recenttracks?.['@attr']?.total || '0', 10) ||
    0;

  const regUnixtime = user.registered?.unixtime ? parseInt(user.registered.unixtime, 10) : 0;
  const regDate = regUnixtime ? new Date(regUnixtime * 1000) : new Date();
  const registeredYear = regDate.getFullYear();

  const daysSinceReg = Math.max(1, (Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24));
  const lifetimeDailyAverage = Math.max(1, Math.round(lifetimePlays / daysSinceReg));

  // Sum of plays in top 50 artists & top 50 tracks for this period
  const topArtistsPlaySum = artists.reduce((sum, a) => sum + (parseInt(a.playcount, 10) || 0), 0);
  const topTracksPlaySum = tracks.reduce((sum, t) => sum + (parseInt(t.playcount, 10) || 0), 0);

  const last30DaysPlays =
    parseInt(last30DayCountRes?.recenttracks?.['@attr']?.total || '0', 10) || 0;

  let exactPeriodPlays = lifetimePlays;
  if (period === '1month') {
    exactPeriodPlays = last30DaysPlays;
  } else if (period === '6month' || period === '12month') {
    exactPeriodPlays = parseInt(periodCountRes?.recenttracks?.['@attr']?.total || '0', 10) || 0;
  }

  // Total plays for the selected period (never smaller than the sum of top artists/tracks in that period)
  const totalPlays =
    period === 'overall'
      ? Math.max(lifetimePlays, topArtistsPlaySum, topTracksPlaySum)
      : Math.max(exactPeriodPlays, topArtistsPlaySum, topTracksPlaySum);

  // Unique artists, tracks, and albums in the selected period from Last.fm @attr.total
  const periodArtistTotal = parseInt(artistsRes?.topartists?.['@attr']?.total || '0', 10);
  const lifetimeArtists =
    parseInt(user.artist_count || '0', 10) || periodArtistTotal || artists.length;
  const totalArtists =
    period === 'overall'
      ? Math.max(lifetimeArtists, periodArtistTotal, artists.length)
      : Math.max(periodArtistTotal, artists.length);

  const totalUniqueTracks =
    parseInt(tracksRes?.toptracks?.['@attr']?.total || '0', 10) ||
    (period === 'overall' ? parseInt(user.track_count || '0', 10) : 0) ||
    tracks.length;

  const totalUniqueAlbums =
    parseInt(albumsRes?.topalbums?.['@attr']?.total || '0', 10) ||
    (period === 'overall' ? parseInt(user.album_count || '0', 10) : 0) ||
    albums.length;

  // Playcount-weighted average track duration from actual track durations (in seconds)
  let weightedDurationSum = 0;
  let validDurationPlays = 0;
  tracks.forEach((t) => {
    const dur = parseInt(t.duration || '0', 10);
    const plays = parseInt(t.playcount || '0', 10) || 1;
    if (dur >= 45 && dur <= 1500) {
      weightedDurationSum += dur * plays;
      validDurationPlays += plays;
    }
  });
  const avgTrackSeconds =
    validDurationPlays > 0 ? Math.round(weightedDurationSum / validDurationPlays) : 215;

  const totalMusicSeconds = totalPlays * avgTrackSeconds;
  const hoursOfMusic = Math.max(1, Math.round(totalMusicSeconds / 3600));
  const rawDaysOfMusic = totalMusicSeconds / 86400;
  const daysOfMusic =
    rawDaysOfMusic >= 10
      ? Math.round(rawDaysOfMusic)
      : Number(Math.max(0.1, rawDaysOfMusic).toFixed(1));

  // Period-specific daily average
  let playsPerDay = lifetimeDailyAverage;
  if (period === '1month') {
    playsPerDay = Math.max(1, Math.round(totalPlays / 30));
  } else if (period === '6month') {
    playsPerDay = Math.max(1, Math.round(totalPlays / 182.5));
  } else if (period === '12month') {
    playsPerDay = Math.max(1, Math.round(totalPlays / 365));
  }

  // Filter recent tracks to selected period if at least 25 tracks fall within the period window
  const datedRecentTracks = recentTracks.filter((t) => t.date?.uts);
  const periodDatedTracks = periodFromUts
    ? datedRecentTracks.filter((t) => parseInt(t.date!.uts, 10) >= periodFromUts!)
    : datedRecentTracks;
  const tracksForTimeCharts =
    periodDatedTracks.length >= 25 ? periodDatedTracks : datedRecentTracks;

  // 24-hour distribution & 7-day weekday distribution
  const hourBins: number[] = new Array(24).fill(0);
  const dayBins: number[] = new Array(7).fill(0);

  tracksForTimeCharts.forEach((t) => {
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
  const dayFullNames = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const days: DayCount[] = dayBins.map((count, dayIndex) => ({
    dayIndex,
    dayName: dayNames[dayIndex],
    fullName: dayFullNames[dayIndex],
    count,
    isWeekend: dayIndex >= 5, // Sat, Sun
  }));

  // Peak hour (default to 12pm if no dated plays)
  let peakHour = 12;
  let peakHourCount = 0;
  hours.forEach((h) => {
    if (h.count > peakHourCount) {
      peakHourCount = h.count;
      peakHour = h.hour;
    }
  });

  // Peak day
  let peakDayName = 'Friday';
  let peakDayCount = 0;
  days.forEach((d) => {
    if (d.count > peakDayCount) {
      peakDayCount = d.count;
      peakDayName = d.fullName;
    }
  });

  // Night owl scrobble percentage (10pm to 5am)
  const totalRecentDated = hours.reduce((acc, h) => acc + h.count, 0) || 1;
  const nightCount = hours.filter((h) => h.isNight).reduce((acc, h) => acc + h.count, 0);
  const nightOwlPercentage = Math.round((nightCount / totalRecentDated) * 100);

  // Top artist share of top ten
  const topTenArtists = artists.slice(0, 10);
  const topTenPlays = topTenArtists.reduce((sum, a) => sum + (parseInt(a.playcount, 10) || 0), 0);
  const topArtistPlays = topTenArtists[0] ? parseInt(topTenArtists[0].playcount, 10) || 0 : 0;
  const topArtistShareOfTopTen =
    topTenPlays > 0 ? Math.round((topArtistPlays / topTenPlays) * 100) : 0;

  // Decades breakdown using enriched artist tags/bios + curated artist era map + album years
  const decades = estimateDecades(artists, albums, tracks, registeredYear, artistMetaMap);
  let topDecade = decades[0];
  decades.forEach((dec) => {
    if (dec.count > topDecade.count || (dec.count === topDecade.count && dec.percentage > topDecade.percentage)) {
      topDecade = dec;
    }
  });

  // Velocity calculation
  const velocity = calculateVelocity(
    lifetimeDailyAverage,
    recentTracks,
    period,
    totalPlays,
    last30DaysPlays
  );

  // Deep Analytics & Taste Ratings
  const obscurity = calculateObscurity(artists, artistMetaMap);
  const repeatObsession = calculateRepeatObsession(
    tracks,
    totalPlays,
    totalUniqueTracks,
    period
  );
  const diversity = calculateCatalogDiversity(artists, totalArtists, totalPlays);
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
    velocity,
    totalArtists
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
      lifetimePlays,
      registeredYear,
      daysOfMusic,
      hoursOfMusic,
      avgTrackSeconds,
      playsPerDay,
      totalArtists,
      lifetimeArtists,
      totalUniqueTracks,
      totalUniqueAlbums,
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
