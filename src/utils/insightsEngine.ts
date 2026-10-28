import type {
  Period,
  LastFmArtist,
  LastFmTrack,
  ArtistEnrichedMeta,
  DecadeCount,
  VelocityStats,
  SonicPersona,
  ObscurityStats,
  RepeatObsessionStats,
  CatalogDiversityStats,
  TasteRatingsSummary,
} from '../types/lastfm';

// Fallback global listener tiers for well-known mainstream artists when artist.getinfo is unavailable
const MAINSTREAM_SUPERSTARS = new Set([
  'taylor swift',
  'drake',
  'the weeknd',
  'bad bunny',
  'ed sheeran',
  'justin bieber',
  'ariana grande',
  'rihanna',
  'eminem',
  'post malone',
  'billie eilish',
  'dua lipa',
  'kanye west',
  'coldplay',
  'maroon 5',
  'bruno mars',
  'bts',
  'olivia rodrigo',
  'beyoncé',
  'kendrick lamar',
  'travis scott',
  'queen',
  'the beatles',
  'michael jackson',
  'katy perry',
  'adele',
  'harry styles',
  'sabrina carpenter',
  'radiohead',
  'nirvana',
  'arctic monkeys',
  'lana del rey',
  'lady gaga',
  'linkin park',
  'red hot chili peppers',
  'green day',
  'metallica',
  'pink floyd',
  'david bowie',
  'led zeppelin',
  'fleetwood mac',
  'the rolling stones',
  'daughtry',
  'foo fighters',
  'muse',
  'the killers',
  'gorillaz',
  'daft punk',
  'the cure',
  'the smiths',
  'oasis',
  'blur',
  'weezer',
  'blink-182',
  'the offspring',
  'fall out boy',
  'panic! at the disco',
  'paramore',
  'my chemical romance',
  'system of a down',
  'deftones',
  'slipknot',
  'korn',
  'evanescence',
  'nickelback',
  'imagine dragons',
  'twenty one pilots',
  'onejrepublic',
  'the chainsmokers',
  'calvin harris',
  'david guetta',
  'avicii',
  'sia',
  'miley cyrus',
  'selena gomez',
  'demi lovato',
  'shawn mendes',
  'camila cabello',
  'sam smith',
  'hozier',
  'lorde',
  'charli xcx',
  'chappell roan',
  'doja cat',
  'sza',
  'frank ocean',
  'tyler, the creator',
  'a$ap rocky',
  'asap rocky',
  'future',
  '21 savage',
  'lil uzi vert',
  'playboi carti',
  'j. cole',
  'jay-z',
  '50 cent',
  'snoop dogg',
  '2pac',
  'the notorious b.i.g.',
  'nas',
  'outkast',
  'lil wayne',
  'nicki minaj',
  'cardi b',
  'megan thee stallion',
  'usher',
  'chris brown',
  'alicia keys',
  'amy winehouse',
  'elton john',
  'billy joel',
  'bruce springsteen',
  'bob dylan',
  'abba',
  'madonna',
  'prince',
  'whitney houston',
  'mariah carey',
  'celine dion',
  'britney spears',
  'backstreet boys',
  'spice girls',
  'shakira',
  'u2',
  'depeche mode',
  'new order',
  'ac/dc',
  'guns n\' roses',
  'bon jovi',
  'aerosmith',
  'black sabbath',
  'iron maiden',
  'tame impala',
  'mac demarco',
  'mitski',
  'phoebe bridgers',
  'the strokes',
  'the white stripes',
  'vampire weekend',
  'arcade fire',
  'florence + the machine',
  'the 1975',
  'glass animals',
  'noah kahan',
  'zach bryan',
  'morgan wallen',
  'benson boone',
  'tate mcrae',
  'gracie abrams',
  'newjeans',
  'blackpink',
  'twice',
  'stray kids',
]);

/**
 * Converts a Last.fm global listener count into an artist rarity score from 0 (mega-mainstream) to 100 (deep underground).
 */
function listenerCountToRarityScore(listeners: number): number {
  if (listeners <= 0) return 55;
  // Log10 scale:
  // 10,000,000 listeners (log10 = 7.0) -> ~6/100 rarity
  // 2,000,000 listeners (log10 = 6.30) -> ~25/100 rarity
  // 600,000 listeners (log10 = 5.78)   -> ~41/100 rarity
  // 150,000 listeners (log10 = 5.18)   -> ~59/100 rarity
  // 30,000 listeners (log10 = 4.48)    -> ~79/100 rarity
  // <= 3,000 listeners (log10 <= 3.48) -> ~96/100 rarity
  const logL = Math.log10(Math.max(400, listeners));
  const raw = 100 - ((logL - 3.25) / (7.0 - 3.25)) * 92;
  return Math.max(5, Math.min(98, Math.round(raw)));
}

export function calculateObscurity(
  artists: LastFmArtist[],
  artistMetaMap?: Map<string, ArtistEnrichedMeta>
): ObscurityStats {
  if (!artists || artists.length === 0) {
    return {
      score: 50,
      tierName: 'Balanced Explorer',
      description: 'Evenly balanced between beloved hits and underground discoveries.',
      plainExplanation: 'You listen to both popular radio songs and independent artists in equal measure.',
      longTailRatio: 50,
    };
  }

  const top25 = artists.slice(0, 25);
  const totalTopPlays = top25.reduce((sum, a) => sum + (parseInt(a.playcount, 10) || 1), 0);

  let weightedRaritySum = 0;
  let nonMainstreamPlays = 0;

  top25.forEach((a) => {
    const plays = parseInt(a.playcount, 10) || 1;
    const clean = a.name.trim().toLowerCase();
    const meta = artistMetaMap?.get(clean);

    let artistRarity = 52;
    let isNonMainstream = false;

    if (meta && meta.globalListeners > 0) {
      artistRarity = listenerCountToRarityScore(meta.globalListeners);
      // Artists under 1,000,000 global Last.fm listeners are considered independent / non-mainstream
      if (meta.globalListeners < 500_000) {
        isNonMainstream = true;
      } else if (meta.globalListeners < 1_300_000) {
        // Mid-tier crossover contributes partially to non-mainstream share
        nonMainstreamPlays += plays * 0.5;
      }
    } else if (MAINSTREAM_SUPERSTARS.has(clean)) {
      artistRarity = 18;
      isNonMainstream = false;
    } else {
      // Unlisted artist outside top 15: moderate indie/niche assumption
      artistRarity = 62;
      isNonMainstream = true;
    }

    if (isNonMainstream) {
      nonMainstreamPlays += plays;
    }

    weightedRaritySum += artistRarity * plays;
  });

  const score = Math.max(8, Math.min(97, Math.round(weightedRaritySum / Math.max(1, totalTopPlays))));
  const longTailRatio = Math.max(
    3,
    Math.min(98, Math.round((nonMainstreamPlays / Math.max(1, totalTopPlays)) * 100))
  );

  let tierName = 'Balanced Explorer';
  let description = 'A healthy mix of universal classics and curious underground wanderings.';
  let plainExplanation = 'You listen to a comfortable mix of big anthems and independent music.';

  if (score >= 72) {
    tierName = 'Underground Digger';
    description = 'Mainstream radio is rare here. You hunt for independent releases, cult favorites, and niche artists.';
    plainExplanation = 'You mostly listen to independent artists and deeper cuts that rarely play on mainstream radio.';
  } else if (score >= 54) {
    tierName = 'Indie & Curious Listener';
    description = 'You frequently look past top-40 trends in favor of acclaimed indie, alternative, and genre staples.';
    plainExplanation = 'You explore beyond the biggest pop charts and enjoy creative, mid-sized and independent artists.';
  } else if (score >= 34) {
    tierName = 'Balanced Explorer';
    description = 'Comfortable with iconic, globally loved artists while keeping room for niche favorites.';
    plainExplanation = 'You enjoy well-known artists and classics just as much as discovering smaller names.';
  } else {
    tierName = 'Mainstream & Icons Fan';
    description = 'You celebrate the power of globally recognized legends, chart-toppers, and stadium anthems.';
    plainExplanation = 'You love iconic artists, huge hits, and songs that millions of music fans know by heart.';
  }

  return {
    score,
    tierName,
    description,
    plainExplanation,
    longTailRatio,
  };
}

export function calculateRepeatObsession(
  tracks: LastFmTrack[],
  totalPlaysInPeriod: number = 0,
  totalUniqueTracksInPeriod: number = 0,
  period: Period = '12month'
): RepeatObsessionStats {
  if (!tracks || tracks.length === 0) {
    return {
      obsessionScore: 25,
      tierName: 'Queue Shuffler',
      plainExplanation: 'You rarely play the same song twice in a row, keeping your music moving forward.',
      mostRepeatedTrack: {
        name: 'None',
        artist: 'Unknown',
        playcount: 0,
        shareOfTopTracks: 0,
      },
      top5TrackConcentration: 25,
    };
  }

  const top5 = tracks.slice(0, 5);
  const top20 = tracks.slice(0, 20);
  const totalTop20Plays = top20.reduce((s, t) => s + (parseInt(t.playcount, 10) || 0), 0);
  const top5Plays = top5.reduce((s, t) => s + (parseInt(t.playcount, 10) || 0), 0);
  const topTrackPlays = parseInt(top5[0]?.playcount, 10) || 0;

  // 1. Concentration within top 20 tracks
  const top5TrackConcentration =
    totalTop20Plays > 0 ? Math.round((top5Plays / totalTop20Plays) * 100) : 25;
  const shareOfTopTracks =
    totalTop20Plays > 0 ? Math.round((topTrackPlays / totalTop20Plays) * 100) : 5;

  // 2. Actual replay intensity of the #1 song relative to the selected time period
  const periodPeakBenchmark =
    period === '1month' ? 28 : period === '6month' ? 65 : period === '12month' ? 105 : 220;
  const peakPlayIntensity = Math.min(100, Math.round((topTrackPlays / periodPeakBenchmark) * 100));

  // 3. Library-wide track replay rate (average plays per unique song in the period)
  const effectivePlays = Math.max(totalPlaysInPeriod, totalTop20Plays, 1);
  const effectiveUniqueTracks = Math.max(totalUniqueTracksInPeriod, tracks.length, 1);
  const avgPlaysPerTrack = effectivePlays / effectiveUniqueTracks;
  // 1.0 play/track = 0% repeat; 6.0+ plays/track across entire library = 100% repeat
  const libraryReplayScore = Math.min(100, Math.max(5, Math.round(((avgPlaysPerTrack - 1) / 4.5) * 100)));

  // 4. Skew between #1 song and tracks #6-#20
  const tailTracks = top20.slice(5);
  const avgTailPlays =
    tailTracks.length > 0
      ? tailTracks.reduce((s, t) => s + (parseInt(t.playcount, 10) || 0), 0) / tailTracks.length
      : Math.max(1, topTrackPlays);
  const skewRatio = avgTailPlays > 0 ? topTrackPlays / avgTailPlays : 1;
  // skewRatio of 1.0 = flat; skewRatio of 4.0+ = heavy #1 track obsession
  const skewScore = Math.min(100, Math.max(10, Math.round(((skewRatio - 1) / 3.2) * 100)));

  // Combine factors: if topTrackPlays <= 2, cap score low so light listeners aren't mislabeled as loopers
  let rawScore = Math.round(
    peakPlayIntensity * 0.45 + libraryReplayScore * 0.25 + skewScore * 0.3
  );
  if (topTrackPlays <= 2) {
    rawScore = Math.min(rawScore, 22);
  } else if (topTrackPlays <= 5 && period !== '1month') {
    rawScore = Math.min(rawScore, 36);
  }

  const obsessionScore = Math.max(10, Math.min(98, rawScore));

  let tierName = 'Balanced Listener';
  let plainExplanation =
    'You have a few favorite songs on repeat, but you still enjoy listening to full tracklists.';

  if (obsessionScore >= 72) {
    tierName = 'Heavy Song Looper';
    plainExplanation =
      'When you fall in love with a song, you put it on repeat and play it dozens of times.';
  } else if (obsessionScore >= 50) {
    tierName = 'Favorite Repeater';
    plainExplanation =
      'You return to your favorite songs often, playing your top tracks significantly more than the rest.';
  } else if (obsessionScore >= 30) {
    tierName = 'Album & Playlist Listener';
    plainExplanation =
      'You prefer listening through whole albums or playlists instead of looping a single track over and over.';
  } else {
    tierName = 'Wide Queue Shuffler';
    plainExplanation =
      'You almost never repeat the same song twice, keeping a fresh stream of tracks moving forward.';
  }

  return {
    obsessionScore,
    tierName,
    plainExplanation,
    mostRepeatedTrack: {
      name: top5[0]?.name || 'Unknown',
      artist: top5[0]?.artist?.name || (top5[0]?.artist as any)?.['#text'] || 'Unknown',
      playcount: topTrackPlays,
      shareOfTopTracks,
    },
    top5TrackConcentration,
  };
}

export function calculateCatalogDiversity(
  artists: LastFmArtist[],
  totalArtistsInPeriod: number,
  totalPlaysInPeriod: number = 0
): CatalogDiversityStats {
  if (!artists || artists.length === 0) {
    return {
      diversityScore: 50,
      archetype: 'Balanced Regular',
      top5ArtistShare: 30,
      description: 'You balance regular visits to your top artists with steady exploration of new names.',
      plainExplanation: 'You have a trusted set of favorite musicians, but you still try out new artists regularly.',
    };
  }

  const top5Plays = artists
    .slice(0, 5)
    .reduce((s, a) => s + (parseInt(a.playcount, 10) || 0), 0);
  const top50Plays = artists.reduce((s, a) => s + (parseInt(a.playcount, 10) || 0), 0);

  // Use true period plays (never less than the sum of top 50 artists' plays)
  const effectiveTotalPlays = Math.max(totalPlaysInPeriod, top50Plays, 1);

  // Exact percentage of total period plays spent on the user's top 5 artists
  const top5ArtistShare = Math.max(
    1,
    Math.min(100, Math.round((top5Plays / effectiveTotalPlays) * 100))
  );

  // Also check top 5 concentration within top 50 artists (for users with very large catalogs)
  const top5ShareOfTop50 = top50Plays > 0 ? (top5Plays / top50Plays) * 100 : 50;

  // Diversity score (0 = 100% focused on top 5 favorites, 100 = wide exploration across many artists)
  // Blended from true total share (70% weight) and top-50 distribution (30% weight)
  const blendedConcentration = top5ArtistShare * 0.7 + top5ShareOfTop50 * 0.3;
  const diversityScore = Math.max(8, Math.min(96, Math.round(100 - blendedConcentration)));

  let archetype: 'Deep Loyalist' | 'Balanced Regular' | 'Eclectic Explorer' = 'Balanced Regular';
  let description =
    'You balance regular visits to your top artists with steady exploration of new names.';
  let plainExplanation =
    'You have a trusted set of favorite musicians, but you still try out new artists regularly.';

  if (diversityScore <= 42 || top5ArtistShare >= 45) {
    archetype = 'Deep Loyalist';
    description =
      'High artist devotion. You spend a large share of your listening time with a trusted inner circle of favorite artists.';
    plainExplanation =
      'You are deeply loyal to your favorite artists, dedicating a major share of your listening time to them.';
  } else if (diversityScore >= 66 && totalArtistsInPeriod >= 20) {
    archetype = 'Eclectic Explorer';
    description =
      'A wide-ranging musical appetite. You spread your listening across many different artists instead of sticking to just a few.';
    plainExplanation = `You explore widely across ${totalArtistsInPeriod.toLocaleString()} artists, with your top 5 taking up only ${top5ArtistShare}% of your plays.`;
  }

  return {
    diversityScore,
    archetype,
    top5ArtistShare,
    description,
    plainExplanation,
  };
}

export function determineSonicPersona(
  nightOwlPercentage: number,
  obscurity: ObscurityStats,
  repeat: RepeatObsessionStats,
  diversity: CatalogDiversityStats,
  topDecade: DecadeCount,
  velocity: VelocityStats
): SonicPersona {
  // 1. Extreme night listening
  if (nightOwlPercentage >= 42) {
    return {
      archetype: 'The Night Owl',
      tagline: 'Your headphones come alive late at night.',
      description:
        'You do your deepest listening when the rest of the world is asleep. Late nights between 10pm and 5am are your peak music hours.',
      trait1: `${nightOwlPercentage}% Nighttime Listening`,
      trait2: `${obscurity.tierName}`,
      badgeCode: 'NIGHT-01',
    };
  }

  // 2. High track repetition
  if (repeat.obsessionScore >= 72) {
    return {
      archetype: 'The Song Looper',
      tagline: 'When a track connects, you loop it on repeat.',
      description:
        'When you find a song you truly love, you play it over and over. Loyalty to your favorite track beats searching for new ones.',
      trait1: `${repeat.mostRepeatedTrack.playcount} Plays on #1 Song`,
      trait2: `Most Looped: "${repeat.mostRepeatedTrack.name}"`,
      badgeCode: 'LOOP-02',
    };
  }

  // 3. High obscurity / underground
  if (obscurity.score >= 68) {
    return {
      archetype: 'The Hidden Gem Hunter',
      tagline: 'Finding great music outside the mainstream charts.',
      description:
        'You look beyond top-40 radio in search of independent artists, deeper cuts, and niche sounds that most people miss.',
      trait1: `${obscurity.score}/100 Underground Score`,
      trait2: `${obscurity.longTailRatio}% Non-Mainstream Listening`,
      badgeCode: 'UNDERGROUND-04',
    };
  }

  // 4. Vintage era devotion (when primary vintage decade is >= 30% of listening)
  if (
    (topDecade.decade === '60s' ||
      topDecade.decade === '70s' ||
      topDecade.decade === '80s' ||
      topDecade.decade === '90s') &&
    topDecade.percentage >= 28
  ) {
    return {
      archetype: 'The Classic Soul',
      tagline: `Drawn to the timeless sound of the ${topDecade.label}.`,
      description: `Your music taste is anchored in the ${topDecade.label} (${topDecade.percentage}% of your catalog). You love iconic songwriting from classic eras of music.`,
      trait1: `Favorite Era: ${topDecade.label} (${topDecade.percentage}%)`,
      trait2: `${topDecade.eraName}`,
      badgeCode: 'CLASSIC-03',
    };
  }

  // 5. Deep Loyalist
  if (diversity.archetype === 'Deep Loyalist') {
    return {
      archetype: 'The Devoted Loyalist',
      tagline: 'Ride-or-die dedication to your favorite artists.',
      description: `Your top 5 artists account for ${diversity.top5ArtistShare}% of your listening. When an artist earns your trust, you know their catalog inside and out.`,
      trait1: `${diversity.top5ArtistShare}% Top 5 Artist Share`,
      trait2: `Favorite Era: ${topDecade.label}`,
      badgeCode: 'LOYAL-05',
    };
  }

  // 6. High velocity listening
  if (velocity.status === 'accelerating' && velocity.recentDailyVelocity >= 25) {
    return {
      archetype: 'The High-Volume Listener',
      tagline: 'Listening at top speed right now.',
      description:
        'You are listening to music faster than your usual daily pace, soundtracked by a constant stream of songs and albums.',
      trait1: `${velocity.recentDailyVelocity} Songs Per Day`,
      trait2: `${velocity.statusText}`,
      badgeCode: 'FAST-06',
    };
  }

  // 7. Default / Eclectic Explorer
  return {
    archetype: 'The Eclectic Explorer',
    tagline: 'Curious across genres, eras, and artists.',
    description:
      'You love variety. You move fluidly across different artists, decades, and styles without getting locked into a single box.',
    trait1: `${diversity.archetype}`,
    trait2: `Favorite Era: ${topDecade.label}`,
    badgeCode: 'EXPLORE-07',
  };
}

export function buildTasteRatings(
  obscurity: ObscurityStats,
  diversity: CatalogDiversityStats,
  repeat: RepeatObsessionStats,
  nightOwlPercentage: number,
  peakHour: number,
  topDecade: DecadeCount,
  velocity: VelocityStats,
  totalArtists: number = 50
): TasteRatingsSummary {
  const formatHour = (h: number): string => {
    if (h === 0) return '12am';
    if (h === 12) return '12pm';
    if (h > 12) return `${h - 12}pm`;
    return `${h}am`;
  };

  // 1. Underground vs. Popular (Rarity)
  const rarityScore = obscurity.score;
  const raritySpectrum = obscurity.score; // 0 = Mainstream Hits, 100 = Underground Gems
  const rarityLetterGrade =
    rarityScore >= 75 ? 'A+' : rarityScore >= 58 ? 'A' : rarityScore >= 42 ? 'B+' : 'B';

  // 2. Artist Loyalty vs. Variety
  // Spectrum matches CatalogDiversity component: 0% = Loyal to Favorites, 100% = Explores Many Artists
  const loyaltySpectrum = diversity.diversityScore;
  // Score rewards strength of conviction (whether deeply loyal OR widely exploring)
  const loyaltyStrengthScore =
    diversity.archetype === 'Eclectic Explorer'
      ? Math.max(72, diversity.diversityScore)
      : diversity.archetype === 'Deep Loyalist'
      ? Math.max(72, Math.min(96, 100 - diversity.diversityScore + 15))
      : 76;
  const loyaltyLetterGrade =
    loyaltyStrengthScore >= 82 ? 'A+' : loyaltyStrengthScore >= 72 ? 'A' : 'B+';

  // 3. Song Repeating Habit (Looping)
  const loopingScore = repeat.obsessionScore;
  const loopingSpectrum = repeat.obsessionScore; // 0 = Plays Full Albums, 100 = Loops Single Songs
  const loopingLetterGrade =
    loopingScore >= 72 ? 'A+' : loopingScore >= 50 ? 'A' : loopingScore >= 32 ? 'B+' : 'B';

  // 4. Listening Time & Rhythm (Clock)
  // Night hours (10pm-5am) are 8 out of 24 hours. 55%+ night listening = 95% on night owl spectrum.
  const clockSpectrum = Math.max(6, Math.min(96, Math.round((nightOwlPercentage / 55) * 100)));
  const daytimePercentage = 100 - nightOwlPercentage;
  // Score reflects how strong their dominant listening window is (so daytime listeners get high scores too!)
  const dominantWindowShare = Math.max(nightOwlPercentage * 1.6, daytimePercentage * 0.92);
  const clockScore = Math.max(65, Math.min(96, Math.round(dominantWindowShare)));
  const clockLetterGrade = clockScore >= 82 ? 'A+' : clockScore >= 72 ? 'A' : 'B+';

  // 5. Favorite Music Era (Time Machine)
  let eraSpectrum = 70;
  if (topDecade.decade === '60s') eraSpectrum = 10;
  else if (topDecade.decade === '70s') eraSpectrum = 25;
  else if (topDecade.decade === '80s') eraSpectrum = 40;
  else if (topDecade.decade === '90s') eraSpectrum = 55;
  else if (topDecade.decade === '00s') eraSpectrum = 70;
  else if (topDecade.decade === '10s') eraSpectrum = 84;
  else if (topDecade.decade === '20s') eraSpectrum = 95;
  // Era score measures how strongly defined their favorite era is (never penalizing 60s/70s/80s fans!)
  const eraScore = Math.max(68, Math.min(97, Math.round(52 + topDecade.percentage * 0.95)));

  // 6. Daily Music Appetite (Volume & Pace)
  // 45+ songs/day (~2.7+ hours/day) is top-tier daily volume
  const appetiteSpectrum = Math.max(
    10,
    Math.min(98, Math.round((velocity.recentDailyVelocity / 50) * 100))
  );
  const appetiteScore = Math.max(
    55,
    Math.min(
      98,
      Math.round(
        Math.min(100, velocity.recentDailyVelocity * 1.8) * 0.6 +
          Math.min(100, velocity.paceRatio * 65) * 0.4
      )
    )
  );
  const appetiteLetterGrade =
    appetiteScore >= 82 ? 'A+' : appetiteScore >= 70 ? 'A' : appetiteScore >= 58 ? 'B+' : 'B';

  // Overall Music Taste Index (0-100)
  const overallScore = Math.max(
    58,
    Math.min(
      98,
      Math.round(
        rarityScore * 0.2 +
          loyaltyStrengthScore * 0.2 +
          Math.max(65, loopingScore) * 0.15 +
          clockScore * 0.15 +
          eraScore * 0.15 +
          appetiteScore * 0.15
      )
    )
  );

  let overallGrade = 'Active Music Fan';
  if (overallScore >= 84) overallGrade = 'Dedicated Audiophile';
  else if (overallScore >= 75) overallGrade = 'Passionate Explorer';
  else if (overallScore >= 65) overallGrade = 'Regular Music Listener';

  return {
    overallScore,
    overallGrade,
    rarity: {
      id: 'rarity',
      title: 'Underground vs. Popular',
      score: rarityScore,
      spectrumPosition: raritySpectrum,
      letterGrade: rarityLetterGrade,
      grade: obscurity.tierName,
      tagline:
        rarityScore >= 54
          ? 'Explores independent & niche music beyond the charts'
          : 'Loves iconic artists and globally popular hits',
      plainMeaning: obscurity.plainExplanation,
      highlight: `${obscurity.score}/100 Rarity (${obscurity.longTailRatio}% non-mainstream plays)`,
      leftLabel: 'Global Chart Icons',
      rightLabel: 'Underground Gems',
      whyThisRating: `Calculated from the real Last.fm global listener counts of your top artists. ${obscurity.longTailRatio}% of your top-artist plays belong to artists with under 1M global listeners.`,
    },
    loyalty: {
      id: 'loyalty',
      title: 'Artist Loyalty vs. Variety',
      score: loyaltyStrengthScore,
      spectrumPosition: loyaltySpectrum,
      letterGrade: loyaltyLetterGrade,
      grade: diversity.archetype,
      tagline:
        diversity.archetype === 'Deep Loyalist'
          ? 'Devoted to a trusted inner circle of favorites'
          : diversity.archetype === 'Eclectic Explorer'
          ? 'Spreads listening widely across many artists'
          : 'Healthy balance of favorite artists and discovery',
      plainMeaning: diversity.plainExplanation,
      highlight: `Top 5 artists = ${diversity.top5ArtistShare}% of plays (${totalArtists.toLocaleString()} artists)`,
      leftLabel: 'Loyal to Favorites',
      rightLabel: 'Explores Many Artists',
      whyThisRating: `Your top 5 artists account for ${diversity.top5ArtistShare}% of your total plays in this period across ${totalArtists.toLocaleString()} unique artists (${diversity.diversityScore}/100 variety index).`,
    },
    looping: {
      id: 'looping',
      title: 'Song Repeating Habit',
      score: loopingScore,
      spectrumPosition: loopingSpectrum,
      letterGrade: loopingLetterGrade,
      grade: repeat.tierName,
      tagline:
        loopingScore >= 50
          ? 'Replays favorite songs heavily when they click'
          : 'Listens across full albums and varied queues',
      plainMeaning: repeat.plainExplanation,
      highlight: `#1 song "${repeat.mostRepeatedTrack.name}" (${repeat.mostRepeatedTrack.playcount.toLocaleString()} plays)`,
      leftLabel: 'Plays Full Albums',
      rightLabel: 'Loops Favorite Songs',
      whyThisRating: `Your #1 track was played ${repeat.mostRepeatedTrack.playcount.toLocaleString()} times (${repeat.mostRepeatedTrack.shareOfTopTracks}% of your top-20 track plays), and your top 5 tracks make up ${repeat.top5TrackConcentration}% of your top-20 plays.`,
    },
    clock: {
      id: 'clock',
      title: 'Listening Time & Rhythm',
      score: clockScore,
      spectrumPosition: clockSpectrum,
      letterGrade: clockLetterGrade,
      grade:
        nightOwlPercentage >= 38
          ? 'Late Night Owl'
          : nightOwlPercentage >= 22
          ? 'Evening & Night Listener'
          : 'Daytime Regular',
      tagline:
        nightOwlPercentage >= 38
          ? 'Most active late at night (10pm – 5am)'
          : `Most active during daytime & evening (${daytimePercentage}% between 6am – 9pm)`,
      plainMeaning:
        nightOwlPercentage >= 38
          ? `You do ${nightOwlPercentage}% of your listening late at night between 10pm and 5am, peaking around ${formatHour(peakHour)}.`
          : `You do ${daytimePercentage}% of your listening between 6am and 9pm, with your peak hour at ${formatHour(peakHour)}.`,
      highlight: `Peak hour: ${formatHour(peakHour)} (${nightOwlPercentage}% night / ${daytimePercentage}% day)`,
      leftLabel: 'Daytime (6am – 9pm)',
      rightLabel: 'Late Night (10pm – 5am)',
      whyThisRating: `Grouped from the timestamps of your recent scrobbles in your local timezone. ${nightOwlPercentage}% occurred between 10pm and 5am, with peak activity at ${formatHour(peakHour)}.`,
    },
    era: {
      id: 'era',
      title: 'Favorite Music Era',
      score: eraScore,
      spectrumPosition: eraSpectrum,
      letterGrade: topDecade.label,
      grade: `${topDecade.label} Era Fan`,
      tagline: `Anchored in ${topDecade.eraName}`,
      plainMeaning: `Your #1 musical decade is the ${topDecade.label}, which makes up ${topDecade.percentage}% of your analyzed catalog.`,
      highlight: `${topDecade.percentage}% of your catalog is from the ${topDecade.label}`,
      leftLabel: 'Vintage (60s–80s)',
      rightLabel: 'Modern (2010s–20s)',
      whyThisRating: `Determined by matching your top artists and albums against Last.fm artist biographies, decade tags, and album release years. The ${topDecade.label} leads at ${topDecade.percentage}%.`,
    },
    appetite: {
      id: 'appetite',
      title: 'Daily Music Appetite',
      score: appetiteScore,
      spectrumPosition: appetiteSpectrum,
      letterGrade: appetiteLetterGrade,
      grade: velocity.statusText,
      tagline:
        velocity.recentDailyVelocity >= 30
          ? 'High-volume daily soundtrack'
          : 'Steady, consistent daily listening habit',
      plainMeaning: velocity.plainText,
      highlight: `${velocity.recentDailyVelocity} songs/day (${velocity.paceRatio}x your ${velocity.lifetimeDailyAverage}/day lifetime avg)`,
      leftLabel: 'Relaxed Daily Pace',
      rightLabel: 'Non-Stop All Day',
      whyThisRating: `Compares your active daily pace in this period (${velocity.recentDailyVelocity} tracks/day) against your all-time average since joining Last.fm (${velocity.lifetimeDailyAverage} tracks/day).`,
    },
  };
}
