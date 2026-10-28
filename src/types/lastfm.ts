export type Period = '12month' | 'overall' | '6month' | '1month';

export interface LastFmImage {
  size: 'small' | 'medium' | 'large' | 'extralarge' | 'mega' | '';
  '#text': string;
}

export interface LastFmUser {
  name: string;
  realname?: string;
  url: string;
  image?: LastFmImage[];
  country?: string;
  playcount: string;
  artist_count?: string;
  track_count?: string;
  album_count?: string;
  registered?: {
    unixtime: string;
    '#text': number;
  };
}

export interface LastFmArtist {
  name: string;
  playcount: string;
  url: string;
  image?: LastFmImage[];
}

export interface LastFmTrack {
  name: string;
  playcount: string;
  duration?: string;
  url: string;
  artist: {
    name: string;
    '#text'?: string;
    url?: string;
  };
  image?: LastFmImage[];
}

export interface LastFmAlbum {
  name: string;
  playcount: string;
  url: string;
  artist: {
    name: string;
    '#text'?: string;
    url?: string;
  };
  image?: LastFmImage[];
}

export interface LastFmRecentTrack {
  name: string;
  artist: {
    '#text': string;
  };
  album?: {
    '#text': string;
  };
  date?: {
    uts: string;
    '#text': string;
  };
  image?: LastFmImage[];
  '@attr'?: {
    nowplaying?: string;
  };
}

export interface ArtistEnrichedMeta {
  name: string;
  globalListeners: number;
  globalPlaycount: number;
  tags: string[];
  bioSummary: string;
}

export interface HourCount {
  hour: number; // 0-23
  count: number;
  isNight: boolean; // 10pm (22) to 5am (5)
}

export interface DayCount {
  dayIndex: number; // 0 = Mon, ..., 6 = Sun
  dayName: string; // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  fullName: string;
  count: number;
  isWeekend: boolean;
}

export interface DecadeCount {
  decade: string; // '60s', '70s', '80s', '90s', '00s', '10s', '20s'
  label: string;
  eraName: string;
  count: number;
  percentage: number;
}

export interface VelocityStats {
  lifetimeDailyAverage: number;
  recentDailyVelocity: number;
  paceRatio: number;
  paceDeltaPercent: number;
  status: 'accelerating' | 'consistent' | 'laidback';
  statusText: string;
  plainText: string;
}

export interface SonicPersona {
  archetype: string;
  tagline: string;
  description: string;
  trait1: string;
  trait2: string;
  badgeCode: string;
}

export interface ObscurityStats {
  score: number; // 0 to 100
  tierName: string;
  description: string;
  plainExplanation: string;
  longTailRatio: number;
}

export interface RepeatObsessionStats {
  obsessionScore: number; // 0 to 100
  tierName: string;
  plainExplanation: string;
  mostRepeatedTrack: {
    name: string;
    artist: string;
    playcount: number;
    shareOfTopTracks: number;
  };
  top5TrackConcentration: number;
}

export interface CatalogDiversityStats {
  diversityScore: number; // 0 to 100
  archetype: 'Deep Loyalist' | 'Balanced Regular' | 'Eclectic Explorer';
  top5ArtistShare: number;
  description: string;
  plainExplanation: string;
}

// Easy-to-understand consolidated ratings
export interface TasteRatingItem {
  id: string;
  title: string;
  score: number; // 0 to 100
  spectrumPosition?: number; // 0 to 100 position between leftLabel and rightLabel
  letterGrade: string; // e.g. 'A+', 'S', 'A', 'B'
  grade: string; // friendly title, e.g. 'Underground Explorer'
  tagline: string;
  plainMeaning: string; // simple plain English
  highlight: string; // exact easy stat
  leftLabel: string; // spectrum start label
  rightLabel: string; // spectrum end label
  whyThisRating: string; // explanation of how the score was calculated
}

export interface TasteRatingsSummary {
  overallScore: number;
  overallGrade: string;
  rarity: TasteRatingItem;
  loyalty: TasteRatingItem;
  looping: TasteRatingItem;
  clock: TasteRatingItem;
  era: TasteRatingItem;
  appetite: TasteRatingItem;
}

export interface AggregatedStats {
  totalPlays: number;
  lifetimePlays: number;
  registeredYear: number;
  daysOfMusic: number;
  hoursOfMusic: number;
  avgTrackSeconds: number;
  playsPerDay: number;
  totalArtists: number;
  lifetimeArtists: number;
  totalUniqueTracks: number;
  totalUniqueAlbums: number;
  peakHour: number;
  peakHourCount: number;
  nightOwlPercentage: number;
  topArtistShareOfTopTen: number;
  peakDayName: string;
  peakDayCount: number;
  topDecade: DecadeCount;
  velocity: VelocityStats;
  sonicPersona: SonicPersona;
  obscurity: ObscurityStats;
  repeatObsession: RepeatObsessionStats;
  diversity: CatalogDiversityStats;
  tasteRatings: TasteRatingsSummary;
}

export interface UserStatsPayload {
  username: string;
  user: LastFmUser;
  artists: LastFmArtist[];
  tracks: LastFmTrack[];
  albums: LastFmAlbum[];
  recentTracks: LastFmRecentTrack[];
  nowPlayingTrack: LastFmRecentTrack | null;
  hours: HourCount[];
  days: DayCount[];
  decades: DecadeCount[];
  stats: AggregatedStats;
}
