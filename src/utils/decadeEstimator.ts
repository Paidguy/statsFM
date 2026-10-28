import type {
  Period,
  LastFmAlbum,
  LastFmTrack,
  LastFmArtist,
  LastFmRecentTrack,
  ArtistEnrichedMeta,
  DecadeCount,
  VelocityStats,
} from '../types/lastfm';

const ARTIST_ERA_MAP: Record<string, string> = {
  // 1960s
  'the beatles': '60s',
  'the rolling stones': '60s',
  'the beach boys': '60s',
  'bob dylan': '60s',
  'jimi hendrix': '60s',
  'the jimi hendrix experience': '60s',
  'the velvet underground': '60s',
  'the doors': '60s',
  'simon & garfunkel': '60s',
  'john coltrane': '60s',
  'miles davis': '60s',
  'the kinks': '60s',
  'the who': '60s',
  'cream': '60s',
  'aretha franklin': '60s',
  'otis redding': '60s',
  'marvin gaye': '60s',
  'the supremes': '60s',
  'the temptations': '60s',
  'smokey robinson': '60s',
  'james brown': '60s',
  'nina simone': '60s',
  'johnny cash': '60s',
  'leonard cohen': '60s',
  'jefferson airplane': '60s',
  'creedence clearwater revival': '60s',
  'the byrds': '60s',
  'the zombies': '60s',
  'love': '60s',
  'nick drake': '60s',
  'frank sinatra': '60s',
  'elvis presley': '60s',
  'ray charles': '60s',
  'sam cooke': '60s',
  'dusty springfield': '60s',
  'the animals': '60s',
  'the mamas & the papas': '60s',
  'janis joplin': '60s',
  'sly & the family stone': '60s',
  'grateful dead': '60s',

  // 1970s
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
  'abba': '70s',
  'bee gees': '70s',
  'eagles': '70s',
  'neil young': '70s',
  'joni mitchell': '70s',
  'bruce springsteen': '70s',
  'billy joel': '70s',
  'ramones': '70s',
  'sex pistols': '70s',
  'buzzcocks': '70s',
  'television': '70s',
  'wire': '70s',
  'iggy pop': '70s',
  'the stooges': '70s',
  'lou reed': '70s',
  'brian eno': '70s',
  'kraftwerk': '70s',
  'can': '70s',
  'neu!': '70s',
  'king crimson': '70s',
  'yes': '70s',
  'genesis': '70s',
  'rush': '70s',
  'deep purple': '70s',
  'kiss': '70s',
  'aerosmith': '70s',
  'van halen': '70s',
  'blondie': '70s',
  'talking heads': '70s',
  'patti smith': '70s',
  'bob marley & the wailers': '70s',
  'bob marley': '70s',
  'earth, wind & fire': '70s',
  'chic': '70s',
  'donna summer': '70s',
  'funkadelic': '70s',
  'parliament': '70s',
  'curtis mayfield': '70s',
  'al green': '70s',
  'bill withers': '70s',
  'carole king': '70s',
  'cat stevens': '70s',
  'electric light orchestra': '70s',
  'supertramp': '70s',
  'thin lizzy': '70s',
  'dire straits': '70s',

  // 1980s
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
  'sonic youth': '80s',
  'kate bush': '80s',
  'george michael': '80s',
  'wham!': '80s',
  'roxette': '80s',
  'tears for fears': '80s',
  'duran duran': '80s',
  'a-ha': '80s',
  'pet shop boys': '80s',
  'erasure': '80s',
  'soft cell': '80s',
  'the human league': '80s',
  'orchestral manoeuvres in the dark': '80s',
  'cocteau twins': '80s',
  'siouxsie and the banshees': '80s',
  'bauhaus': '80s',
  'echo & the bunnymen': '80s',
  'the jesus and mary chain': '80s',
  'pixies': '80s',
  'r.e.m.': '80s',
  'the replacements': '80s',
  'hüsker dü': '80s',
  'fugazi': '80s',
  'minor threat': '80s',
  'bad brains': '80s',
  'dead kennedys': '80s',
  'misfits': '80s',
  'black flag': '80s',
  'descendents': '80s',
  'bad religion': '80s',
  'slayer': '80s',
  'megadeth': '80s',
  'anthrax': '80s',
  'judas priest': '80s',
  'motörhead': '80s',
  'ozzy osbourne': '80s',
  'dio': '80s',
  'guns n\' roses': '80s',
  'bon jovi': '80s',
  'def leppard': '80s',
  'van morrison': '70s',
  'the police': '80s',
  'phil collins': '80s',
  'peter gabriel': '80s',
  'whitney houston': '80s',
  'janet jackson': '80s',
  'cyndi lauper': '80s',
  'hall & oates': '80s',
  'toto': '80s',
  'journey': '80s',
  'inxs': '80s',
  'simple minds': '80s',
  'talk talk': '80s',
  'prefab sprout': '80s',
  'the stone roses': '80s',
  'public enemy': '80s',
  'n.w.a': '80s',
  'beastie boys': '80s',
  'run-d.m.c.': '80s',
  'de la soul': '80s',

  // 1990s
  'nirvana': '90s',
  'radiohead': '90s',
  'oasis': '90s',
  'blur': '90s',
  'pulp': '90s',
  'suede': '90s',
  'the verve': '90s',
  '2pac': '90s',
  'the notorious b.i.g.': '90s',
  'snoop dogg': '90s',
  'dr. dre': '90s',
  'nas': '90s',
  'wu-tang clan': '90s',
  'a tribe called quest': '90s',
  'mobb deep': '90s',
  'outkast': '90s',
  'lauryn hill': '90s',
  'fugees': '90s',
  'aphex twin': '90s',
  'boards of canada': '90s',
  'autechre': '90s',
  'the prodigy': '90s',
  'the chemical brothers': '90s',
  'fatboy slim': '90s',
  'underworld': '90s',
  'orbital': '90s',
  'pearl jam': '90s',
  'soundgarden': '90s',
  'alice in chains': '90s',
  'stone temple pilots': '90s',
  'green day': '90s',
  'the offspring': '90s',
  'blink-182': '90s',
  'nofx': '90s',
  'rancid': '90s',
  'sublime': '90s',
  'no doubt': '90s',
  'weezer': '90s',
  'the smashing pumpkins': '90s',
  'smashing pumpkins': '90s',
  'red hot chili peppers': '90s',
  'foo fighters': '90s',
  'beck': '90s',
  'pavement': '90s',
  'built to spill': '90s',
  'yo la tengo': '90s',
  'my bloody valentine': '90s',
  'slowdive': '90s',
  'ride': '90s',
  'lush': '90s',
  'mazzy star': '90s',
  'the cranberries': '90s',
  'garbage': '90s',
  'hole': '90s',
  'pj harvey': '90s',
  'tori amos': '90s',
  'alanis morissette': '90s',
  'fiona apple': '90s',
  'elliott smith': '90s',
  'jeff buckley': '90s',
  'nick cave & the bad seeds': '90s',
  'nine inch nails': '90s',
  'marilyn manson': '90s',
  'ministry': '90s',
  'tool': '90s',
  'rage against the machine': '90s',
  'korn': '90s',
  'deftones': '90s',
  'pantera': '90s',
  'sepultura': '90s',
  'type o negative': '90s',
  'daft punk': '90s',
  'air': '90s',
  'björk': '90s',
  'portishead': '90s',
  'massive attack': '90s',
  'tricky': '90s',
  'jamiroquai': '90s',
  'sade': '90s',
  'mariah carey': '90s',
  'tlc': '90s',
  'destiny\'s child': '90s',
  'aaliyah': '90s',
  'erykah badu': '90s',
  'd\'angelo': '90s',
  'spice girls': '90s',
  'backstreet boys': '90s',
  'britney spears': '90s',
  'tenacious d': '90s',
  'bowling for soup': '90s',

  // 2000s
  'kanye west': '00s',
  'the strokes': '00s',
  'the white stripes': '00s',
  'coldplay': '00s',
  'eminem': '00s',
  'arcade fire': '00s',
  'arctic monkeys': '00s',
  'interpol': '00s',
  'gorillaz': '00s',
  'jay-z': '00s',
  '50 cent': '00s',
  'lil wayne': '00s',
  'mf doom': '00s',
  'madvillain': '00s',
  'j dilla': '00s',
  'nujabes': '00s',
  'linkin park': '00s',
  'the killers': '00s',
  'lcd soundsystem': '00s',
  'system of a down': '00s',
  'slipknot': '00s',
  'rammstein': '00s',
  'evanescence': '00s',
  'my chemical romance': '00s',
  'fall out boy': '00s',
  'paramore': '00s',
  'panic! at the disco': '00s',
  'sum 41': '00s',
  'avril lavigne': '00s',
  'good charlotte': '00s',
  'jimmy eat world': '00s',
  'taking back sunday': '00s',
  'brand new': '00s',
  'muse': '00s',
  'queens of the stone age': '00s',
  'modest mouse': '00s',
  'the shins': '00s',
  'death cab for cutie': '00s',
  'the postal service': '00s',
  'bright eyes': '00s',
  'sufjan stevens': '00s',
  'the national': '00s',
  'spoon': '00s',
  'wilco': '00s',
  'yeah yeah yeahs': '00s',
  'bloc party': '00s',
  'franz ferdinand': '00s',
  'kasabian': '00s',
  'keane': '00s',
  'snow patrol': '00s',
  'the libertines': '00s',
  'kings of leon': '00s',
  'the black keys': '00s',
  'amy winehouse': '00s',
  'lily allen': '00s',
  'nelly furtado': '00s',
  'rihanna': '00s',
  'beyoncé': '00s',
  'lady gaga': '00s',
  'shakira': '00s',
  'justin timberlake': '00s',
  'usher': '00s',
  'alicia keys': '00s',
  'mgmt': '00s',
  'animal collective': '00s',
  'vampire weekend': '00s',
  'bon iver': '00s',
  'fleet foxes': '00s',
  'grizzly bear': '00s',
  'deerhunter': '00s',
  'phoenix': '00s',
  'justice': '00s',
  'burial': '00s',
  'flying lotus': '00s',
  'crystal castles': '00s',
  'sigur rós': '00s',
  'godspeed you! black emperor': '00s',
  'mogwai': '00s',
  'explosions in the sky': '00s',
  'opeth': '00s',
  'mastodon': '00s',
  'gojira': '00s',
  'meshuggah': '00s',
  'bring me the horizon': '10s',
  'crazy frog': '00s',

  // 2010s
  'drake': '10s',
  'kendrick lamar': '10s',
  'taylor swift': '10s',
  'frank ocean': '10s',
  'lana del rey': '10s',
  'the weeknd': '10s',
  'tyler, the creator': '10s',
  'mac miller': '10s',
  'tame impala': '10s',
  'lorde': '10s',
  'travis scott': '10s',
  'chance the rapper': '10s',
  'beach house': '10s',
  'childish gambino': '10s',
  'florence + the machine': '10s',
  'future': '10s',
  'a$ap rocky': '10s',
  'asap rocky': '10s',
  'post malone': '10s',
  'j. cole': '10s',
  'playboi carti': '10s',
  'lil uzi vert': '10s',
  'xxxtentacion': '10s',
  'juice wrld': '10s',
  '21 savage': '10s',
  'young thug': '10s',
  'migos': '10s',
  'cardi b': '10s',
  'nicki minaj': '10s',
  'ariana grande': '10s',
  'ed sheeran': '10s',
  'justin bieber': '10s',
  'bruno mars': '10s',
  'katy perry': '10s',
  'adele': '10s',
  'sia': '10s',
  'halsey': '10s',
  'shawn mendes': '10s',
  'camila cabello': '10s',
  'one direction': '10s',
  'harry styles': '10s',
  'twenty one pilots': '10s',
  'imagine dragons': '10s',
  'the 1975': '10s',
  'hozier': '10s',
  'alt-j': '10s',
  'foster the people': '10s',
  'two door cinema club': '10s',
  'glass animals': '10s',
  'cage the elephant': '10s',
  'mac demarco': '10s',
  'mitski': '10s',
  'car seat headrest': '10s',
  'king gizzard & the lizard wizard': '10s',
  'khruangbin': '10s',
  'anderson .paak': '10s',
  'sza': '10s',
  'daniel caesar': '10s',
  'kali uchis': '10s',
  'steve lacy': '10s',
  'solange': '10s',
  'fka twigs': '10s',
  'grimes': '10s',
  'carly rae jepsen': '10s',
  'sophie': '10s',
  'arca': '10s',
  'flume': '10s',
  'odesza': '10s',
  'disclosure': '10s',
  'kaytranada': '10s',
  'jamie xx': '10s',
  'four tet': '10s',
  'avicii': '10s',
  'calvin harris': '10s',
  'skrillex': '10s',
  'deadmau5': '10s',
  'porter robinson': '10s',
  'death grips': '10s',
  'jpegmafia': '10s',
  'denzel curry': '10s',
  'earl sweatshirt': '10s',
  'vince staples': '10s',
  'little simz': '10s',
  'dave': '10s',
  'skepta': '10s',
  'bts': '10s',
  'blackpink': '10s',
  'twice': '10s',
  'red velvet': '10s',
  'exo': '10s',

  // 2020s
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
  'doja cat': '20s',
  'megan thee stallion': '20s',
  'bad bunny': '20s',
  'rosalía': '20s',
  'peso pluma': '20s',
  'karol g': '20s',
  'central cee': '20s',
  'pinkpantheress': '20s',
  'beabadoobee': '20s',
  'clairo': '20s',
  'men i trust': '20s',
  'the last dinner party': '20s',
  'black country, new road': '20s',
  'black midi': '20s',
  'squid': '20s',
  'idles': '20s',
  'turnstile': '20s',
  'knocked loose': '20s',
  'sleep token': '20s',
  'spiritbox': '20s',
  'bad omens': '20s',
  'ethel cain': '20s',
  'caroline polachek': '20s',
  'weyes blood': '20s',
  'big thief': '20s',
  'adrianne lenker': '20s',
  'mk.gee': '20s',
  'dijon': '20s',
  '2hollis': '20s',
  'yeat': '20s',
  'ken carson': '20s',
  'destroy lonely': '20s',
  'baby keem': '20s',
  'doechii': '20s',
  'raye': '20s',
  'tyla': '20s',
  'ayra starr': '20s',
  'burna boy': '20s',
  'wizkid': '20s',
  'rema': '20s',
  'stray kids': '20s',
  'le sserafim': '20s',
  'aespa': '20s',
  'ive': '20s',
  'illit': '20s',
  'ateez': '20s',
  'seventeen': '20s',
  'tomorrow x together': '20s',
  'enhypen': '20s',
  'xg': '20s',
  'saja boys': '20s',
  'huntr/x': '20s',
  'tate mcrae': '20s',
  'gracie abrams': '20s',
  'benson boone': '20s',
  'teddy swims': '20s',
  'noah kahan': '20s',
  'zach bryan': '20s',
  'morgan wallen': '20s',
  'luke combs': '20s',
  'sombr': '20s',
  'addison rae': '20s',
  'lola young': '20s',
};

const DECADE_CONFIG: { decade: string; label: string; eraName: string }[] = [
  { decade: '60s', label: '1960s', eraName: 'Psychedelic Rock & Motown' },
  { decade: '70s', label: '1970s', eraName: 'Classic Vinyl, Punk & Disco' },
  { decade: '80s', label: '1980s', eraName: 'New Wave, Post-Punk & Synth' },
  { decade: '90s', label: '1990s', eraName: 'Alternative, Grunge & Golden Rap' },
  { decade: '00s', label: '2000s', eraName: 'Indie Revival & Blog Era' },
  { decade: '10s', label: '2010s', eraName: 'Streaming Era & Modern Classics' },
  { decade: '20s', label: '2020s', eraName: 'Current Wave & Next-Gen Sounds' },
];

function yearToDecadeKey(year: number): string | null {
  if (year >= 1950 && year < 1970) return '60s';
  if (year >= 1970 && year < 1980) return '70s';
  if (year >= 1980 && year < 1990) return '80s';
  if (year >= 1990 && year < 2000) return '90s';
  if (year >= 2000 && year < 2010) return '00s';
  if (year >= 2010 && year < 2020) return '10s';
  if (year >= 2020 && year <= 2030) return '20s';
  return null;
}

/**
 * Infers an artist's defining musical decade from their Last.fm tags and biography text.
 */
function inferDecadeFromArtistMeta(meta?: ArtistEnrichedMeta): string | null {
  if (!meta) return null;

  // 1. Check explicit decade tags from Last.fm (e.g., "80s", "1990s", "70s")
  for (const tag of meta.tags) {
    const t = tag.trim().toLowerCase();
    if (t === '60s' || t === '1960s' || t === 'sixties' || t === '50s' || t === '1950s') return '60s';
    if (t === '70s' || t === '1970s' || t === 'seventies' || t === 'classic rock' || t === 'disco') return '70s';
    if (t === '80s' || t === '1980s' || t === 'eighties' || t === 'new wave' || t === 'synthpop') return '80s';
    if (t === '90s' || t === '1990s' || t === 'nineties' || t === 'grunge' || t === 'britpop') return '90s';
    if (t === '00s' || t === '2000s' || t === 'noughties') return '00s';
    if (t === '10s' || t === '2010s') return '10s';
    if (t === '20s' || t === '2020s') return '20s';
  }

  // 2. Parse artist biography summary for formation, debut, or birth years
  if (meta.bioSummary) {
    const cleanBio = meta.bioSummary.replace(/<[^>]+>/g, ' ');

    // A: Band formation / career start pattern ("formed in ... in 1994", "founded in 1987", "debuted in 2012")
    const formedMatch = cleanBio.match(
      /(?:formed|founded|established|active since|started|began|originated|debuted)[^.]{0,75}?\b(19[5-9]\d|20[0-2]\d)\b/i
    );
    if (formedMatch) {
      const formedYear = parseInt(formedMatch[1], 10);
      // Peak catalog typically arrives ~3 years after initial formation
      const peakYear = Math.min(2026, formedYear + 3);
      const dec = yearToDecadeKey(peakYear);
      if (dec) return dec;
    }

    // B: Solo artist birth year pattern ("born May 11, 1999", "born 1969")
    const bornMatch = cleanBio.match(/\bborn\b[^.()\n]{0,55}?\b(19[2-9]\d|200\d)\b/i);
    if (bornMatch) {
      const birthYear = parseInt(bornMatch[1], 10);
      // Solo artists typically hit prime catalog around age 23
      const careerPeakYear = Math.min(2026, birthYear + 23);
      const dec = yearToDecadeKey(careerPeakYear);
      if (dec) return dec;
    }

    // C: Release / album year mentions in bio
    const releaseMatches = Array.from(cleanBio.matchAll(/\b(19[5-9]\d|20[0-2]\d)\b/g)).map((m) =>
      parseInt(m[1], 10)
    );
    // Filter out current year if it's just a "latest album in 2026" footnote when earlier years exist
    const historicalYears = releaseMatches.filter((y) => y >= 1955 && y <= 2025);
    const yearsToUse = historicalYears.length > 0 ? historicalYears : releaseMatches;
    if (yearsToUse.length > 0) {
      yearsToUse.sort((a, b) => a - b);
      // Use the 35th percentile year (closer to their breakthrough era than late-career reissues)
      const idx = Math.floor((yearsToUse.length - 1) * 0.35);
      const dec = yearToDecadeKey(yearsToUse[idx]);
      if (dec) return dec;
    }
  }

  return null;
}

export function estimateDecades(
  artists: LastFmArtist[],
  albums: LastFmAlbum[],
  tracks: LastFmTrack[],
  _registeredYear: number,
  artistMetaMap?: Map<string, ArtistEnrichedMeta>
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

  const resolveArtistDecade = (artistName: string): string | null => {
    const clean = artistName.trim().toLowerCase();
    if (!clean) return null;
    if (ARTIST_ERA_MAP[clean]) return ARTIST_ERA_MAP[clean];
    const meta = artistMetaMap?.get(clean);
    return inferDecadeFromArtistMeta(meta);
  };

  // 1. Analyze top albums (explicit years in title OR resolved artist era)
  albums.forEach((alb) => {
    const plays = parseInt(alb.playcount, 10) || 1;
    const title = alb.name.toLowerCase();
    const artist = (alb.artist?.name || (alb.artist as any)?.['#text'] || '').trim().toLowerCase();

    // Check explicit 4-digit year in album title (excluding "1989" by Taylor Swift which is 2010s/2020s)
    const matchYear = title.match(/\b(19[5-9]\d|20[0-2]\d)\b/);
    if (matchYear && !(title.includes('1989') && artist.includes('taylor swift'))) {
      const year = parseInt(matchYear[1], 10);
      const dec = yearToDecadeKey(year);
      if (dec) {
        counts[dec] += plays;
        return;
      }
    }

    const artistDecade = resolveArtistDecade(artist);
    if (artistDecade) {
      counts[artistDecade] += plays;
    }
  });

  // 2. Analyze top artists with playcount weighting
  artists.forEach((art) => {
    const plays = parseInt(art.playcount, 10) || 1;
    const artistDecade = resolveArtistDecade(art.name);
    if (artistDecade) {
      counts[artistDecade] += plays * 1.5;
    }
  });

  // 3. Analyze top tracks via their artist or title year
  tracks.slice(0, 30).forEach((trk) => {
    const plays = parseInt(trk.playcount, 10) || 1;
    const artist = (trk.artist?.name || (trk.artist as any)?.['#text'] || '').trim().toLowerCase();
    const artistDecade = resolveArtistDecade(artist);
    if (artistDecade) {
      counts[artistDecade] += plays * 0.8;
    }
  });

  let total = Object.values(counts).reduce((a, b) => a + b, 0);

  // Fallback only if zero artists/albums had any recognizable era metadata
  if (total <= 0) {
    counts['80s'] = 10;
    counts['90s'] = 15;
    counts['00s'] = 20;
    counts['10s'] = 30;
    counts['20s'] = 25;
    total = 100;
  }

  // Largest-remainder method so decade percentages ALWAYS sum to 100%
  const rawPercentages = DECADE_CONFIG.map((cfg) => {
    const c = counts[cfg.decade] || 0;
    const exact = (c / total) * 100;
    return {
      cfg,
      count: Math.round(c),
      floor: Math.floor(exact),
      remainder: exact - Math.floor(exact),
    };
  });

  let remainderToDistribute = 100 - rawPercentages.reduce((acc, item) => acc + item.floor, 0);
  const sortedByRemainder = [...rawPercentages].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < remainderToDistribute && i < sortedByRemainder.length; i++) {
    sortedByRemainder[i].floor += 1;
  }

  return rawPercentages.map((item) => ({
    decade: item.cfg.decade,
    label: item.cfg.label,
    eraName: item.cfg.eraName,
    count: item.count,
    percentage: item.floor,
  }));
}

export function calculateVelocity(
  lifetimeDailyAverage: number,
  recentTracks: LastFmRecentTrack[],
  period: Period = '12month',
  periodPlays: number = 0,
  last30DaysPlays: number = 0
): VelocityStats {
  const safeLifetimeAvg = Math.max(1, lifetimeDailyAverage);

  // Determine the user's true recent daily listening velocity
  let recentDailyVelocity = safeLifetimeAvg;

  if (period === '1month' && periodPlays > 0) {
    recentDailyVelocity = Math.max(1, Math.round(periodPlays / 30));
  } else if (period === '6month' && periodPlays > 0) {
    recentDailyVelocity = Math.max(1, Math.round(periodPlays / 182.5));
  } else if (period === '12month' && periodPlays > 0) {
    recentDailyVelocity = Math.max(1, Math.round(periodPlays / 365));
  } else if (last30DaysPlays > 0) {
    // For 'overall' (All Time), compare their active last 30 days against their lifetime daily average
    recentDailyVelocity = Math.max(1, Math.round(last30DaysPlays / 30));
  } else {
    // Fallback to dated recentTracks anchored to current timestamp so inactive gaps are respected
    const datedTracks = (recentTracks || []).filter((t) => t.date?.uts);
    if (datedTracks.length >= 5) {
      const newestUts = parseInt(datedTracks[0].date!.uts, 10);
      const oldestUts = parseInt(datedTracks[datedTracks.length - 1].date!.uts, 10);
      const nowUts = Math.max(Math.floor(Date.now() / 1000), newestUts);
      const elapsedDays = Math.max(3, (nowUts - oldestUts) / 86400);
      recentDailyVelocity = Math.max(1, Math.round(datedTracks.length / elapsedDays));
    }
  }

  const paceRatio = Number((recentDailyVelocity / safeLifetimeAvg).toFixed(2));
  const paceDeltaPercent = Math.round((paceRatio - 1) * 100);

  let status: 'accelerating' | 'consistent' | 'laidback' = 'consistent';
  let statusText = 'Steady listening routine';
  let plainText = `You are listening at your normal steady daily speed (about ${recentDailyVelocity} songs a day).`;

  if (paceDeltaPercent >= 20) {
    status = 'accelerating';
    statusText = `+${paceDeltaPercent}% Faster Than Usual`;
    plainText = `You are averaging ${recentDailyVelocity} songs a day right now, compared to your lifetime average of ${safeLifetimeAvg} songs a day.`;
  } else if (paceDeltaPercent <= -20) {
    status = 'laidback';
    statusText = `${paceDeltaPercent}% Relaxed Rotation`;
    plainText = `You are listening at a relaxed pace of ${recentDailyVelocity} songs a day, compared to your lifetime average of ${safeLifetimeAvg} songs a day.`;
  } else {
    status = 'consistent';
    statusText =
      paceDeltaPercent === 0
        ? 'Right on Your Lifetime Average'
        : `±${Math.abs(paceDeltaPercent)}% Steady Routine`;
    plainText = `You are averaging ${recentDailyVelocity} songs a day, right in line with your lifetime average of ${safeLifetimeAvg} songs a day.`;
  }

  return {
    lifetimeDailyAverage: safeLifetimeAvg,
    recentDailyVelocity,
    paceRatio,
    paceDeltaPercent,
    status,
    statusText,
    plainText,
  };
}
