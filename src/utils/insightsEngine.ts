import type {
  LastFmArtist,
  LastFmTrack,
  DecadeCount,
  VelocityStats,
  SonicPersona,
  ObscurityStats,
  RepeatObsessionStats,
  CatalogDiversityStats,
  TasteRatingsSummary,
} from '../types/lastfm';

// Mega global pop/chart artists for obscurity weighting
const MAINSTREAM_ARTISTS = new Set([
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
]);

export function calculateObscurity(artists: LastFmArtist[]): ObscurityStats {
  if (!artists || artists.length === 0) {
    return {
      score: 50,
      tierName: 'Balanced Explorer',
      description: 'Evenly balanced between beloved hits and underground discoveries.',
      plainExplanation: 'You listen to both popular radio songs and independent artists in equal measure.',
      longTailRatio: 50,
    };
  }

  const top20 = artists.slice(0, 20);
  const totalPlays = top20.reduce((sum, a) => sum + (parseInt(a.playcount, 10) || 1), 0);

  let mainstreamPlays = 0;
  top20.forEach((a) => {
    const clean = a.name.trim().toLowerCase();
    if (MAINSTREAM_ARTISTS.has(clean)) {
      mainstreamPlays += parseInt(a.playcount, 10) || 1;
    }
  });

  const mainstreamRatio = totalPlays > 0 ? mainstreamPlays / totalPlays : 0.5;

  // Top 5 vs remaining 15
  const top5Plays = artists.slice(0, 5).reduce((s, a) => s + (parseInt(a.playcount, 10) || 1), 0);
  const longTailRatio = totalPlays > 0 ? Math.round(((totalPlays - top5Plays) / totalPlays) * 100) : 50;

  // Score from 0 (100% chart pop) to 100 (100% underground/independent)
  const rawScore = Math.round((1 - mainstreamRatio * 0.7) * 75 + (longTailRatio / 100) * 25);
  const score = Math.max(12, Math.min(96, rawScore));

  let tierName = 'Balanced Explorer';
  let description = 'A healthy mix of universal classics and curious underground wanderings.';
  let plainExplanation = 'You listen to a comfortable mix of big anthems and independent music.';

  if (score >= 78) {
    tierName = 'Underground Digger';
    description = 'Mainstream radio is non-existent here. You hunt for lost master cuts and independent pressings.';
    plainExplanation = 'You mostly listen to independent artists and rare songs that almost never play on the radio.';
  } else if (score >= 60) {
    tierName = 'Curious Listener';
    description = 'You frequently bypass viral trends in favor of critically acclaimed, independent sounds.';
    plainExplanation = 'You explore beyond the top charts and often look for creative, lesser-known artists.';
  } else if (score >= 40) {
    tierName = 'Balanced Explorer';
    description = 'Comfortable with stadium anthems while maintaining strong loyalty to dedicated niche artists.';
    plainExplanation = 'You enjoy huge popular songs just as much as discovering new independent names.';
  } else {
    tierName = 'Top Hits Lover';
    description = 'You celebrate the monumental power of pop cultural touchstones and universally recognized hooks.';
    plainExplanation = 'You love huge hits, stadium anthems, and songs that everyone in the room knows.';
  }

  return {
    score,
    tierName,
    description,
    plainExplanation,
    longTailRatio,
  };
}

export function calculateRepeatObsession(tracks: LastFmTrack[]): RepeatObsessionStats {
  if (!tracks || tracks.length === 0) {
    return {
      obsessionScore: 30,
      tierName: 'Shuffler',
      plainExplanation: 'You rarely play the same song twice in a row, keeping your music moving forward.',
      mostRepeatedTrack: {
        name: 'None',
        artist: 'Unknown',
        playcount: 0,
        shareOfTopTracks: 0,
      },
      top5TrackConcentration: 30,
    };
  }

  const top5 = tracks.slice(0, 5);
  const top20 = tracks.slice(0, 20);
  const totalTopPlays = top20.reduce((s, t) => s + (parseInt(t.playcount, 10) || 1), 0);
  const top5Plays = top5.reduce((s, t) => s + (parseInt(t.playcount, 10) || 1), 0);
  const topTrackPlays = parseInt(top5[0]?.playcount, 10) || 1;

  const top5TrackConcentration = totalTopPlays > 0 ? Math.round((top5Plays / totalTopPlays) * 100) : 40;
  const shareOfTopTracks = totalTopPlays > 0 ? Math.round((topTrackPlays / totalTopPlays) * 100) : 20;

  // Score 0-100
  const obsessionScore = Math.max(15, Math.min(98, Math.round(top5TrackConcentration * 0.7 + shareOfTopTracks * 0.9)));

  let tierName = 'Balanced Listener';
  let plainExplanation = 'You have a few favorite songs on repeat, but you still enjoy listening to full tracklists.';

  if (obsessionScore >= 75) {
    tierName = 'Song Looper';
    plainExplanation = 'When you fall in love with a song, you put it on repeat and loop it dozens of times.';
  } else if (obsessionScore >= 55) {
    tierName = 'Frequent Repeater';
    plainExplanation = 'You return to your absolute favorite songs often, playing them much more than the rest.';
  } else if (obsessionScore >= 35) {
    tierName = 'Album Purist';
    plainExplanation = 'You prefer listening through whole albums or playlists instead of looping single songs.';
  } else {
    tierName = 'Queue Shuffler';
    plainExplanation = 'You rarely repeat the same track twice, always keeping your music moving forward.';
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

export function calculateCatalogDiversity(artists: LastFmArtist[], totalArtists: number): CatalogDiversityStats {
  const top5Plays = artists.slice(0, 5).reduce((s, a) => s + (parseInt(a.playcount, 10) || 1), 0);
  const totalTopPlays = artists.slice(0, 25).reduce((s, a) => s + (parseInt(a.playcount, 10) || 1), 0);

  const top5ArtistShare = totalTopPlays > 0 ? Math.round((top5Plays / totalTopPlays) * 100) : 50;
  const diversityScore = Math.max(10, Math.min(95, 100 - top5ArtistShare));

  let archetype: 'Deep Loyalist' | 'Balanced Regular' | 'Eclectic Explorer' = 'Balanced Regular';
  let description = 'You balance regular visits to your top artists with steady exploration of new names.';
  let plainExplanation = 'You have a trusted set of favorite musicians, but you still try out new artists regularly.';

  if (top5ArtistShare >= 65) {
    archetype = 'Deep Loyalist';
    description = 'Extreme devotion. You spend the majority of your listening time with a trusted inner circle of artists.';
    plainExplanation = 'You are super loyal to your favorite artists, spending most of your listening time with them.';
  } else if (top5ArtistShare <= 38 || totalArtists > 500) {
    archetype = 'Eclectic Explorer';
    description = 'A sprawling musical appetite. You rarely linger on a single artist, constantly branching outward.';
    plainExplanation = 'You listen to hundreds of different artists without sticking too long to just one.';
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
  if (nightOwlPercentage >= 45) {
    return {
      archetype: 'The Night Owl',
      tagline: 'Your headphones come alive late at night.',
      description: 'You do your deepest listening when the rest of the world is asleep. Late nights between 10pm and 5am are your peak music hours.',
      trait1: `${nightOwlPercentage}% Nighttime Listening`,
      trait2: `${obscurity.tierName}`,
      badgeCode: 'NIGHT-01',
    };
  }

  // 2. High track repetition
  if (repeat.obsessionScore >= 70) {
    return {
      archetype: 'The Song Looper',
      tagline: 'When a track connects, you loop it on repeat.',
      description: 'When you find a song you truly love, you play it over and over. Loyalty to your favorite track beats searching for new ones.',
      trait1: `${repeat.mostRepeatedTrack.playcount} Plays on Favorite Song`,
      trait2: `Most Looped: "${repeat.mostRepeatedTrack.name}"`,
      badgeCode: 'LOOP-02',
    };
  }

  // 3. Vintage era devotion
  if (topDecade.decade === '60s' || topDecade.decade === '70s' || topDecade.decade === '80s' || topDecade.decade === '90s') {
    return {
      archetype: 'The Classic Soul',
      tagline: 'Drawn to the timeless sound of past decades.',
      description: `Your music heart belongs to the ${topDecade.label}. You love the warm, memorable songwriting from golden eras of music.`,
      trait1: `Favorite Era: ${topDecade.label}`,
      trait2: `${topDecade.eraName}`,
      badgeCode: 'CLASSIC-03',
    };
  }

  // 4. High obscurity / underground
  if (obscurity.score >= 70) {
    return {
      archetype: 'The Hidden Gem Hunter',
      tagline: 'Finding great music outside the mainstream charts.',
      description: 'You skip top-40 radio in search of independent artists, rare b-sides, and fresh underground sounds that most people miss.',
      trait1: `${obscurity.score}/100 Underground Score`,
      trait2: `${obscurity.longTailRatio}% Non-Mainstream Listening`,
      badgeCode: 'UNDERGROUND-04',
    };
  }

  // 5. High velocity listening
  if (velocity.status === 'accelerating') {
    return {
      archetype: 'The Fast Track Listener',
      tagline: 'Listening at top speed right now.',
      description: 'You are listening to music much faster than your usual daily pace, discovering songs and albums at high momentum.',
      trait1: `${velocity.recentDailyVelocity} Songs Per Day`,
      trait2: `${velocity.plainText || 'High Listening Pace'}`,
      badgeCode: 'FAST-05',
    };
  }

  // 6. Default / Eclectic Explorer
  return {
    archetype: 'The Eclectic Explorer',
    tagline: 'Curious across every genre, decade, and style.',
    description: 'You love variety. You jump between different musical styles, decades, and moods without getting stuck in one box.',
    trait1: `${diversity.archetype}`,
    trait2: `Favorite Era: ${topDecade.label}`,
    badgeCode: 'EXPLORE-06',
  };
}

export function buildTasteRatings(
  obscurity: ObscurityStats,
  diversity: CatalogDiversityStats,
  repeat: RepeatObsessionStats,
  nightOwlPercentage: number,
  peakHour: number,
  topDecade: DecadeCount,
  velocity: VelocityStats
): TasteRatingsSummary {
  const formatHour = (h: number): string => {
    if (h === 0) return '12am';
    if (h === 12) return '12pm';
    if (h > 12) return `${h - 12}pm`;
    return `${h}am`;
  };

  // 1. Taste Uniqueness / Rarity (Underground vs Popular)
  const rarityScore = obscurity.score;
  const rarityLetterGrade = rarityScore >= 80 ? 'A+' : rarityScore >= 65 ? 'A' : rarityScore >= 50 ? 'B' : rarityScore >= 35 ? 'C' : 'D';

  // 2. Artist Loyalty (Loyal circle vs Broad explorer)
  const loyaltyScore = Math.max(10, Math.min(95, 100 - diversity.diversityScore));
  const loyaltyLetterGrade = loyaltyScore >= 75 ? 'A+' : loyaltyScore >= 60 ? 'A' : loyaltyScore >= 45 ? 'B' : 'C';

  // 3. Song Looping Habit
  const loopingScore = repeat.obsessionScore;
  const loopingLetterGrade = loopingScore >= 75 ? 'A+' : loopingScore >= 55 ? 'A' : loopingScore >= 35 ? 'B' : 'C';

  // 4. Night Owl / Listening Clock
  const clockScore = Math.max(5, Math.min(95, nightOwlPercentage));
  const clockLetterGrade = nightOwlPercentage >= 50 ? 'A+' : nightOwlPercentage >= 35 ? 'A' : nightOwlPercentage >= 20 ? 'B' : 'C';

  // 5. Time Travel / Era
  let eraScore = 70;
  if (topDecade.decade === '60s') eraScore = 15;
  else if (topDecade.decade === '70s') eraScore = 28;
  else if (topDecade.decade === '80s') eraScore = 42;
  else if (topDecade.decade === '90s') eraScore = 58;
  else if (topDecade.decade === '00s') eraScore = 72;
  else if (topDecade.decade === '10s') eraScore = 84;
  else if (topDecade.decade === '20s') eraScore = 95;

  // 6. Listening Appetite / Volume
  const appetiteScore = Math.max(12, Math.min(98, Math.round(velocity.recentDailyVelocity * 1.6)));
  const appetiteLetterGrade = velocity.recentDailyVelocity >= 50 ? 'A+' : velocity.recentDailyVelocity >= 30 ? 'A' : velocity.recentDailyVelocity >= 15 ? 'B' : 'C';

  // Overall Score (0-100)
  const overallScore = Math.max(
    30,
    Math.min(
      99,
      Math.round(
        rarityScore * 0.25 +
        loyaltyScore * 0.2 +
        loopingScore * 0.15 +
        (Math.min(100, velocity.recentDailyVelocity * 2)) * 0.2 +
        (topDecade.percentage > 35 ? 85 : 70) * 0.2
      )
    )
  );

  let overallGrade = 'Curious Music Fan';
  if (overallScore >= 85) overallGrade = 'Deep Audiophile';
  else if (overallScore >= 75) overallGrade = 'Passionate Explorer';
  else if (overallScore >= 60) overallGrade = 'Active Daily Listener';
  else overallGrade = 'Casual Music Fan';

  return {
    overallScore,
    overallGrade,
    rarity: {
      id: 'rarity',
      title: 'Underground vs. Popular',
      score: rarityScore,
      letterGrade: rarityLetterGrade,
      grade: obscurity.tierName,
      tagline: rarityScore >= 60 ? 'Finds rare music outside the charts' : 'Loves popular hits and big anthems',
      plainMeaning: obscurity.plainExplanation,
      highlight: `${obscurity.score}/100 Uniqueness (${obscurity.longTailRatio}% non-mainstream artists)`,
      leftLabel: 'Top 40 Radio Hits',
      rightLabel: 'Rare Underground Gems',
      whyThisRating: `We matched your top 20 artists against world chart-toppers. ${obscurity.longTailRatio}% of your listening is focused on independent or niche music.`,
    },
    loyalty: {
      id: 'loyalty',
      title: 'Artist Loyalty & Devotion',
      score: loyaltyScore,
      letterGrade: loyaltyLetterGrade,
      grade: diversity.archetype,
      tagline: diversity.archetype === 'Deep Loyalist' ? 'Devoted to a trusted inner circle' : diversity.archetype === 'Eclectic Explorer' ? 'Constantly discovering new musicians' : 'Healthy mix of favorites and discovery',
      plainMeaning: diversity.plainExplanation,
      highlight: `${diversity.top5ArtistShare}% of all plays belong to your top 5 artists`,
      leftLabel: 'Explores Hundreds of Artists',
      rightLabel: 'Sticks to a Small Inner Circle',
      whyThisRating: `Your top 5 musicians take up ${diversity.top5ArtistShare}% of your listening time. This reveals whether you stick to favorites or seek variety.`,
    },
    looping: {
      id: 'looping',
      title: 'Song Repeating Habit',
      score: loopingScore,
      letterGrade: loopingLetterGrade,
      grade: repeat.tierName,
      tagline: loopingScore >= 60 ? 'Loops favorite songs over and over' : 'Listens straight through full albums',
      plainMeaning: repeat.plainExplanation,
      highlight: `Top repeat: "${repeat.mostRepeatedTrack.name}" played ${repeat.mostRepeatedTrack.playcount} times`,
      leftLabel: 'Shuffles & Plays Full Albums',
      rightLabel: 'Plays One Song on Repeat',
      whyThisRating: `Your most-replayed track was played ${repeat.mostRepeatedTrack.playcount} times. When a song connects with you, this shows how often you hit repeat.`,
    },
    clock: {
      id: 'clock',
      title: 'Listening Time & Rhythm',
      score: clockScore,
      letterGrade: clockLetterGrade,
      grade: nightOwlPercentage >= 40 ? 'Late Night Owl' : nightOwlPercentage >= 20 ? 'Evening Listener' : 'Daytime Regular',
      tagline: nightOwlPercentage >= 40 ? 'Most active when the world is asleep' : 'Listens during daylight and working hours',
      plainMeaning:
        nightOwlPercentage >= 40
          ? 'You do a huge portion of your listening late at night between 10pm and 5am.'
          : 'You mostly listen during daytime hours while working, studying, or on the move.',
      highlight: `Peak hour: ${formatHour(peakHour)} (${nightOwlPercentage}% late night plays)`,
      leftLabel: 'Daytime (6am - 6pm)',
      rightLabel: 'Late Night (10pm - 5am)',
      whyThisRating: `We grouped your recent tracks by the hour they were played. ${nightOwlPercentage}% of them happened after dark.`,
    },
    era: {
      id: 'era',
      title: 'Favorite Music Era',
      score: eraScore,
      letterGrade: topDecade.label,
      grade: `${topDecade.label} Era Lover`,
      tagline: `Devoted to ${topDecade.eraName}`,
      plainMeaning: `Your favorite era of music is the ${topDecade.label}. About ${topDecade.percentage}% of your music was released in this time period.`,
      highlight: `${topDecade.percentage}% of your songs come from the ${topDecade.label}`,
      leftLabel: 'Vintage Classics (60s-80s)',
      rightLabel: 'Modern Waves (2020s)',
      whyThisRating: `We estimated the release decade for each of your top artists and albums. The ${topDecade.label} had the highest share by far.`,
    },
    appetite: {
      id: 'appetite',
      title: 'Daily Music Appetite',
      score: appetiteScore,
      letterGrade: appetiteLetterGrade,
      grade: velocity.statusText,
      tagline: velocity.recentDailyVelocity >= 35 ? 'Music plays almost non-stop throughout your day' : 'Comfortable and steady listening routine',
      plainMeaning: velocity.plainText,
      highlight: `${velocity.recentDailyVelocity} songs per day (${velocity.paceRatio}x your lifetime speed)`,
      leftLabel: 'Casual Background Listener',
      rightLabel: 'Non-stop Music All Day',
      whyThisRating: `You currently average ${velocity.recentDailyVelocity} tracks every day, compared to your overall lifetime speed of ${velocity.lifetimeDailyAverage} tracks daily.`,
    },
  };
}
