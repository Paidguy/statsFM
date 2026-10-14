import type { LastFmAlbum, LastFmTrack, LastFmArtist, LastFmRecentTrack, DecadeCount, VelocityStats } from '../types/lastfm';

const ARTIST_ERA_MAP: Record<string, string> = {
  // 60s
  'the beatles': '60s',
  'the rolling stones': '60s',
  'the beach boys': '60s',
  'bob dylan': '60s',
  'jimi hendrix': '60s',
  'the velvet underground': '60s',
  'the doors': '60s',
  'simon & garfunkel': '60s',
  'john coltrane': '60s',
  'miles davis': '60s',

  // 70s
  'pink floyd': '70s',
  'led zeppelin': '70s',
  'david bowie': '70s',
  'fleetwood mac': '70s',
  'queen': '70s',
  'the clash': '70s',
  'steely dan': '70s',
  'black sabbath': '70s',
  'joy division': '70s',
  'ac/dc': '70s',
  'stevie wonder': '70s',
  'elton john': '70s',

  // 80s
  'michael jackson': '80s',
  'madonna': '80s',
  'prince': '80s',
  'the smiths': '80s',
  'new order': '80s',
  'metallica': '80s',
  'the cure': '80s',
  'u2': '80s',
  'depeche mode': '80s',
  'iron maiden': '80s',
  'talking heads': '80s',
  'sonic youth': '80s',
  'kate bush': '80s',
  'george michael': '80s',
  'wham!': '80s',

  // 90s
  'nirvana': '90s',
  'radiohead': '90s',
  'oasis': '90s',
  'blur': '90s',
  '2pac': '90s',
  'the notorious b.i.g.': '90s',
  'snoop dogg': '90s',
  'dr. dre': '90s',
  'nas': '90s',
  'wu-tang clan': '90s',
  'aphex twin': '90s',
  'pearl jam': '90s',
  'green day': '90s',
  'weezer': '90s',
  'smashing pumpkins': '90s',
  'red hot chili peppers': '90s',
  'daft punk': '90s',
  'björk': '90s',
  'portishead': '90s',
  'massive attack': '90s',
  'fiona apple': '90s',
  'elliott smith': '90s',

  // 00s
  'kanye west': '00s',
  'the strokes': '00s',
  'the white stripes': '00s',
  'coldplay': '00s',
  'eminem': '00s',
  'arcade fire': '00s',
  'arctic monkeys': '00s',
  'interpol': '00s',
  'gorillaz': '00s',
  'outkast': '00s',
  'jay-z': '00s',
  'linkin park': '00s',
  'the killers': '00s',
  'lcd soundsystem': '00s',
  'system of a down': '00s',
  'muse': '00s',
  'modest mouse': '00s',
  'amy winehouse': '00s',
  'mgmt': '00s',
  'animal collective': '00s',
  'vampire weekend': '00s',
  'bon iver': '00s',

  // 10s
  'drake': '10s',
  'kendrick lamar': '10s',
  'taylor swift': '10s',
  'frank ocean': '10s',
  'lana del rey': '10s',
  'the weeknd': '10s',
  'tyler, the creator': '10s',
  'mac miller': '10s',
  'tame impala': '10s',
  'beyoncé': '10s',
  'lorde': '10s',
  'travis scott': '10s',
  'chance the rapper': '10s',
  'sufjan stevens': '10s',
  'beach house': '10s',
  'childish gambino': '10s',
  'florence + the machine': '10s',
  'future': '10s',
  'asap rocky': '10s',
  'post malone': '10s',

  // 20s
  'billie eilish': '20s',
  'olivia rodrigo': '20s',
  'charli xcx': '20s',
  'sabrina carpenter': '20s',
  'chappell roan': '20s',
  'boygenius': '20s',
  'phoebe bridgers': '20s',
  'fontaines d.c.': '20s',
  'wet leg': '20s',
  'fred again..': '20s',
  'bicep': '20s',
  'ice spice': '20s',
  'newjeans': '20s',
  'dua lipa': '20s',
};

const DECADE_CONFIG: { decade: string; label: string; eraName: string }[] = [
  { decade: '60s', label: '1960s', eraName: 'Psychedelic Rock & Motown' },
  { decade: '70s', label: '1970s', eraName: 'Classic Vinyl, Punk & Disco' },
  { decade: '80s', label: '1980s', eraName: 'New Wave, Post-Punk & Synth' },
  { decade: '90s', label: '1990s', eraName: 'Alternative, Grunge & Golden Rap' },
  { decade: '00s', label: '2000s', eraName: 'Indie Revival & Blog Era' },
  { decade: '10s', label: '2010s', eraName: 'Streaming Era & Trap' },
  { decade: '20s', label: '2020s', eraName: 'Modern Hyperpop & Current Scene' },
];

export function estimateDecades(
  artists: LastFmArtist[],
  albums: LastFmAlbum[],
  tracks: LastFmTrack[],
  registeredYear: number
): DecadeCount[] {
  const counts: Record<string, number> = {
    '60s': 0,
    '70s': 0,
    '80s': 0,
    '90s': 0,
    '00s': 0,
    '10s': 0,
    '20s': 0,
  };

  // 1. Analyze albums titles for years (e.g. "1989", "2001", "1999", "'77")
  albums.forEach((alb) => {
    const plays = parseInt(alb.playcount, 10) || 1;
    const title = alb.name.toLowerCase();
    const artist = (alb.artist?.name || (alb.artist as any)?.['#text'] || '').toLowerCase();

    // Check year regex
    const matchYear = title.match(/\b(19[6-9]\d|20[0-2]\d)\b/);
    if (matchYear) {
      const year = parseInt(matchYear[1], 10);
      if (year >= 1960 && year < 1970) counts['60s'] += plays;
      else if (year >= 1970 && year < 1980) counts['70s'] += plays;
      else if (year >= 1980 && year < 1990) counts['80s'] += plays;
      else if (year >= 1990 && year < 2000) counts['90s'] += plays;
      else if (year >= 2000 && year < 2010) counts['00s'] += plays;
      else if (year >= 2010 && year < 2020) counts['10s'] += plays;
      else if (year >= 2020) counts['20s'] += plays;
      return;
    }

    // Check known artist map
    if (ARTIST_ERA_MAP[artist]) {
      counts[ARTIST_ERA_MAP[artist]] += plays;
      return;
    }
  });

  // 2. Check top artists
  artists.forEach((art) => {
    const name = art.name.trim().toLowerCase();
    const plays = parseInt(art.playcount, 10) || 1;
    if (ARTIST_ERA_MAP[name]) {
      counts[ARTIST_ERA_MAP[name]] += plays * 1.5;
    } else {
      // Heuristic fallback: if registered before 2010, distribute slightly earlier
      if (registeredYear < 2010) {
        counts['00s'] += plays * 0.4;
        counts['10s'] += plays * 0.4;
        counts['20s'] += plays * 0.2;
      } else {
        counts['10s'] += plays * 0.4;
        counts['20s'] += plays * 0.5;
        counts['00s'] += plays * 0.1;
      }
    }
  });

  // Ensure every decade has at least a baseline if total is small
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  return DECADE_CONFIG.map((cfg) => {
    const c = counts[cfg.decade] || 0;
    const percentage = Math.round((c / total) * 100);
    return {
      decade: cfg.decade,
      label: cfg.label,
      eraName: cfg.eraName,
      count: Math.round(c),
      percentage,
    };
  });
}

export function calculateVelocity(
  lifetimeDailyAverage: number,
  recentTracks: LastFmRecentTrack[]
): VelocityStats {
  if (!recentTracks || recentTracks.length < 5) {
    return {
      lifetimeDailyAverage,
      recentDailyVelocity: lifetimeDailyAverage,
      paceRatio: 1.0,
      paceDeltaPercent: 0,
      status: 'consistent',
      statusText: 'Steady listening routine',
      plainText: `Listening at your usual steady pace of about ${lifetimeDailyAverage} songs a day.`,
    };
  }

  // Find time delta across available recent plays
  const datedTracks = recentTracks.filter((t) => t.date?.uts);
  if (datedTracks.length < 5) {
    return {
      lifetimeDailyAverage,
      recentDailyVelocity: lifetimeDailyAverage,
      paceRatio: 1.0,
      paceDeltaPercent: 0,
      status: 'consistent',
      statusText: 'Steady listening routine',
      plainText: `Listening at your usual steady pace of about ${lifetimeDailyAverage} songs a day.`,
    };
  }

  const newestUts = parseInt(datedTracks[0].date!.uts, 10);
  const oldestUts = parseInt(datedTracks[datedTracks.length - 1].date!.uts, 10);
  const elapsedDays = Math.max(0.5, (newestUts - oldestUts) / 86400);

  const recentDailyVelocity = Math.max(1, Math.round(datedTracks.length / elapsedDays));
  const paceRatio = lifetimeDailyAverage > 0 ? recentDailyVelocity / lifetimeDailyAverage : 1.0;
  const paceDeltaPercent = Math.round((paceRatio - 1) * 100);

  let status: 'accelerating' | 'consistent' | 'laidback' = 'consistent';
  let statusText = 'Cruising at steady historical pace';
  let plainText = `Listening at your usual steady pace (about ${recentDailyVelocity} plays a day).`;

  if (paceDeltaPercent >= 20) {
    status = 'accelerating';
    statusText = `+${paceDeltaPercent}% High Rotation (Accelerating)`;
    plainText = `You are listening faster than your usual average (${recentDailyVelocity} plays a day vs ${lifetimeDailyAverage} average).`;
  } else if (paceDeltaPercent <= -20) {
    status = 'laidback';
    statusText = `${paceDeltaPercent}% Deep Listening (Laid-Back)`;
    plainText = `You are listening at a slower, relaxed pace (${recentDailyVelocity} plays a day vs ${lifetimeDailyAverage} average).`;
  } else {
    status = 'consistent';
    statusText = `±${Math.abs(paceDeltaPercent)}% Steady Rotation`;
    plainText = `You are listening at your normal steady daily speed (about ${recentDailyVelocity} plays a day).`;
  }

  return {
    lifetimeDailyAverage,
    recentDailyVelocity,
    paceRatio: Number(paceRatio.toFixed(2)),
    paceDeltaPercent,
    status,
    statusText,
    plainText,
  };
}
