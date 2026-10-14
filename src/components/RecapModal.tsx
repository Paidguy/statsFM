import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import type { UserStatsPayload } from '../types/lastfm';
import { HourChart } from './HourChart';
import { ExportCard } from './ExportCard';

interface RecapModalProps {
  data: UserStatsPayload;
  periodLabel: string;
  onClose: () => void;
  onStartOver: () => void;
}

export const RecapModal: React.FC<RecapModalProps> = ({
  data,
  periodLabel,
  onClose,
  onStartOver,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'story' | 'square'>('story');
  const [isExporting, setIsExporting] = useState(false);
  const exportCardRef = useRef<HTMLDivElement>(null);

  const totalSlides = 8;
  const { user, artists, tracks, stats, hours, decades } = data;
  const topArtist = artists[0] || { name: 'Unknown artist', playcount: '0' };
  const topTracks5 = tracks.slice(0, 5);

  const formatHour = (h: number): string => {
    if (h === 0) return '12am';
    if (h === 12) return '12pm';
    if (h > 12) return `${h - 12}pm`;
    return `${h}am`;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide((s) => Math.min(s + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide((s) => Math.max(s - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle tap / click navigation
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width * 0.35) {
      setCurrentSlide((s) => Math.max(s - 1, 0));
    } else {
      setCurrentSlide((s) => Math.min(s + 1, totalSlides - 1));
    }
  };

  const handleCopySummary = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const summaryText = `${user.name}'s Music Recap (${periodLabel})
Musical Personality: ${stats.sonicPersona.archetype} ("${stats.sonicPersona.tagline}")
Overall Taste Score: ${stats.tasteRatings.overallScore}/100 (${stats.tasteRatings.overallGrade})
Underground vs. Popular: ${stats.tasteRatings.rarity.score}/100 (${stats.tasteRatings.rarity.grade})
Song Looping: ${stats.tasteRatings.looping.grade} (Most replayed: "${stats.repeatObsession.mostRepeatedTrack.name}" ${stats.repeatObsession.mostRepeatedTrack.playcount} times)
Artist Loyalty: ${stats.tasteRatings.loyalty.grade} (${stats.diversity.top5ArtistShare}% spent on top 5 artists)
Favorite Era: ${stats.topDecade.label} (${stats.topDecade.eraName})
Daily Listening: ${stats.velocity.recentDailyVelocity} songs/day
Total Songs Played: ${stats.totalPlays.toLocaleString()} (~${stats.daysOfMusic} days of music)
Top Artist: ${topArtist.name}
Peak Listening Hour: ${formatHour(stats.peakHour)}
statsFM · ${window.location.origin}/?u=${encodeURIComponent(user.name)}`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyShareLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?u=${encodeURIComponent(user.name)}&p=12month`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!exportCardRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(exportCardRef.current, {
        quality: 0.98,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${user.name.toLowerCase()}-music-recap-${downloadFormat}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${user.name}'s music recap story`}
      onClick={handleContainerClick}
      className="fixed inset-0 z-50 bg-[#101626] text-[#f1ebdc] flex flex-col justify-between select-none cursor-pointer overflow-hidden p-4 sm:p-8"
    >
      {/* Background risograph dual-ink atmosphere */}
      <div 
        className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-30"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 -left-20 w-96 h-96 sm:w-[480px] sm:h-[480px] rounded-full bg-[#ff5c9a] risograph-blend" />
        <div className="absolute top-1/3 left-28 sm:left-60 w-96 h-96 sm:w-[480px] sm:h-[480px] rounded-full bg-[#3fd6c6] risograph-blend" />
      </div>

      {/* Top Segmented Progress Bar & Controls */}
      <div className="relative z-20 w-full max-w-2xl mx-auto flex flex-col gap-3">
        <div className="flex items-center gap-1.5 w-full">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <div
              key={idx}
              className="h-1.5 flex-1 bg-[#232d4b] overflow-hidden"
            >
              <div
                className={`h-full transition-all duration-300 ${
                  idx <= currentSlide ? 'bg-[#3fd6c6]' : 'bg-transparent'
                }`}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-bold tracking-tight text-[#f1ebdc] heading-bricolage">
            {user.name} <span className="text-[#98a1ba] font-normal">/ {periodLabel}</span>
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close recap"
            className="min-touch-target px-4 py-1.5 text-sm font-semibold text-[#f1ebdc] hover:text-[#ff5c9a] bg-[#18203a] border border-[#232d4b] rounded-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fd6c6]"
          >
            Close
          </button>
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto my-auto px-2 sm:px-6">
        {/* Slide 0: Cover */}
        {currentSlide === 0 && (
          <div className="flex flex-col items-start gap-6">
            <div className="relative w-16 h-16 flex items-center">
              <div className="absolute left-0 w-12 h-12 rounded-full bg-[#ff5c9a] risograph-blend" />
              <div className="absolute left-5 w-12 h-12 rounded-full bg-[#3fd6c6] risograph-blend" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#3fd6c6] block mb-2">
                YOUR MUSIC TASTE IN REVIEW
              </span>
              <h1 className="text-4xl sm:text-6xl font-black text-[#f1ebdc] uppercase tracking-tight heading-bricolage">
                {user.name}&apos;s recap
              </h1>
            </div>
            <p className="text-xl sm:text-2xl text-[#98a1ba] body-bricolage prose-measure">
              Let&apos;s explore your music habits: how unique your taste is, your favorite loop tracks, and when you listen most.
            </p>
            <div className="text-sm font-bold text-[#ff5c9a] mt-4 flex items-center gap-2">
              <span>Tap right or press right arrow to start</span>
            </div>
          </div>
        )}

        {/* Slide 1: Volume */}
        {currentSlide === 1 && (
          <div className="flex flex-col items-start gap-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff5c9a]">
              01 / TOTAL MUSIC PLAYED
            </span>
            <div className="space-y-2">
              <div className="text-6xl sm:text-8xl font-black text-[#f1ebdc] heading-bricolage tabular-nums leading-none">
                {stats.totalPlays.toLocaleString()}
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#3fd6c6] heading-bricolage">
                songs played in total
              </p>
            </div>
            <div className="p-6 bg-[#18203a] border-2 border-[#232d4b] w-full space-y-3">
              <p className="text-2xl sm:text-3xl text-[#f1ebdc] heading-bricolage">
                That is about <span className="text-[#3fd6c6] font-bold">~{stats.daysOfMusic} full days</span> of non-stop music.
              </p>
              <p className="text-base text-[#98a1ba] body-bricolage">
                You averaged about {stats.playsPerDay} songs every single day since {stats.registeredYear}, across {stats.totalArtists.toLocaleString()} different artists.
              </p>
            </div>
          </div>
        )}

        {/* Slide 2: Musical Personality */}
        {currentSlide === 2 && (
          <div className="flex flex-col items-start gap-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3fd6c6]">
              02 / YOUR MUSICAL PERSONALITY
            </span>
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-6xl font-black text-[#f1ebdc] uppercase heading-bricolage leading-none">
                {stats.sonicPersona.archetype}
              </h2>
              <p className="text-xl sm:text-2xl text-[#3fd6c6] font-semibold italic heading-bricolage">
                &ldquo;{stats.sonicPersona.tagline}&rdquo;
              </p>
            </div>
            <div className="w-full bg-[#18203a] p-6 border-2 border-[#232d4b] space-y-4">
              <p className="text-base sm:text-lg text-[#f1ebdc] body-bricolage leading-relaxed">
                {stats.sonicPersona.description}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#232d4b] text-xs">
                <div className="bg-[#101626] p-2.5 text-[#3fd6c6] font-semibold">{stats.sonicPersona.trait1}</div>
                <div className="bg-[#101626] p-2.5 text-[#ff5c9a] font-semibold">{stats.sonicPersona.trait2}</div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 3: Taste Rarity (Mainstream vs. Underground) */}
        {currentSlide === 3 && (
          <div className="flex flex-col items-start gap-6 w-full">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff5c9a]">
              03 / HOW UNIQUE IS YOUR MUSIC TASTE?
            </span>
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-6xl sm:text-8xl font-black text-[#3fd6c6] heading-bricolage tabular-nums leading-none">
                  {stats.tasteRatings.rarity.score}
                </span>
                <span className="text-2xl text-[#98a1ba] font-bold">/ 100</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#f1ebdc] heading-bricolage">
                {stats.tasteRatings.rarity.grade}
              </h3>
            </div>
            <div className="w-full bg-[#18203a] p-6 border-2 border-[#232d4b] space-y-4">
              <p className="text-base sm:text-lg text-[#f1ebdc] body-bricolage">
                {stats.tasteRatings.rarity.plainMeaning}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#98a1ba] font-mono">
                  <span>MAINSTREAM RADIO HITS</span>
                  <span>INDEPENDENT &amp; RARE GEMS</span>
                </div>
                <div className="w-full h-3 bg-[#101626] overflow-hidden relative">
                  <div
                    className="h-full bg-linear-to-r from-[#f1ebdc] via-[#3fd6c6] to-[#ff5c9a]"
                    style={{ width: `${stats.tasteRatings.rarity.score}%` }}
                  />
                </div>
                <div className="text-xs text-[#98a1ba] text-right">
                  {stats.obscurity.longTailRatio}% of your listening is outside the billboard top 5
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 4: Song Looping Habit */}
        {currentSlide === 4 && (
          <div className="flex flex-col items-start gap-6 w-full">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3fd6c6]">
              04 / DO YOU LOOP SONGS ON REPEAT?
            </span>
            <div className="space-y-1">
              <h2 className="text-3xl sm:text-5xl font-black text-[#f1ebdc] heading-bricolage">
                {stats.tasteRatings.looping.grade}
              </h2>
              <p className="text-base text-[#98a1ba] body-bricolage">
                {stats.tasteRatings.looping.plainMeaning}
              </p>
            </div>
            <div className="w-full bg-[#18203a] p-6 border-2 border-[#232d4b] space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-[#98a1ba] uppercase tracking-wider font-bold block">
                  YOUR MOST REPEATED SONG
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#ff5c9a] heading-bricolage truncate">
                  &ldquo;{stats.repeatObsession.mostRepeatedTrack.name}&rdquo;
                </div>
                <div className="text-sm text-[#98a1ba]">
                  by {stats.repeatObsession.mostRepeatedTrack.artist}
                </div>
              </div>
              <div className="p-4 bg-[#101626] border border-[#232d4b] flex items-center justify-between">
                <span className="text-sm text-[#f1ebdc]">You played this song:</span>
                <span className="text-xl font-mono font-bold text-[#3fd6c6] tabular-nums">
                  {stats.repeatObsession.mostRepeatedTrack.playcount} times
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Slide 5: The Top Rotation */}
        {currentSlide === 5 && (
          <div className="flex flex-col items-start gap-5 w-full">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff5c9a]">
              05 / YOUR TOP ARTIST &amp; SONGS
            </span>
            <div className="w-full bg-[#18203a] p-5 border-2 border-[#232d4b] flex items-baseline justify-between">
              <div>
                <span className="text-xs text-[#98a1ba] uppercase block">#1 MOST PLAYED ARTIST</span>
                <span className="text-2xl sm:text-3xl font-black text-[#f1ebdc] heading-bricolage">{topArtist.name}</span>
              </div>
              <span className="text-lg font-bold text-[#ff5c9a] font-mono tabular-nums">{stats.topArtistShareOfTopTen}% of top 10</span>
            </div>
            <div className="w-full space-y-2">
              {topTracks5.map((track, i) => (
                <div
                  key={track.name + i}
                  className="p-3 bg-[#18203a] border border-[#232d4b] flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-sm font-bold text-[#ff5c9a] w-5">#{i + 1}</span>
                    <span className="font-bold text-[#f1ebdc] truncate">{track.name}</span>
                  </div>
                  <span className="text-xs font-mono text-[#3fd6c6] tabular-nums shrink-0">
                    {parseInt(track.playcount, 10).toLocaleString()} plays
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slide 6: When You Listen Most */}
        {currentSlide === 6 && (
          <div className="flex flex-col items-start gap-5 w-full">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3fd6c6]">
              06 / WHEN DO YOU LISTEN MOST?
            </span>
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="p-4 bg-[#18203a] border border-[#232d4b]">
                <span className="text-xs text-[#98a1ba] block uppercase">PEAK TIME</span>
                <span className="text-2xl font-black text-[#f1ebdc] heading-bricolage">{formatHour(stats.peakHour)}</span>
                <span className="text-[11px] text-[#ff5c9a] block mt-1">{stats.tasteRatings.clock.grade}</span>
              </div>
              <div className="p-4 bg-[#18203a] border border-[#232d4b]">
                <span className="text-xs text-[#98a1ba] block uppercase">FAVORITE ERA</span>
                <span className="text-2xl font-black text-[#3fd6c6] heading-bricolage">{stats.topDecade.label}</span>
                <span className="text-[11px] text-[#98a1ba] truncate block mt-1">{stats.topDecade.eraName}</span>
              </div>
            </div>
            <div className="w-full">
              <HourChart hours={hours} />
            </div>
          </div>
        )}

        {/* Slide 7: Grand Summary */}
        {currentSlide === 7 && (
          <div className="flex flex-col items-start gap-4 w-full">
            <div className="flex items-center justify-between w-full border-b border-[#232d4b] pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#3fd6c6]">
                07 / YOUR MUSIC SUMMARY
              </span>
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="flex items-center gap-2 text-xs"
              >
                <button
                  type="button"
                  onClick={() => setDownloadFormat('story')}
                  className={`px-2.5 py-1 font-semibold cursor-pointer border ${
                    downloadFormat === 'story'
                      ? 'bg-[#3fd6c6] text-[#101626] border-[#3fd6c6]'
                      : 'bg-[#18203a] text-[#f1ebdc] border-[#232d4b]'
                  }`}
                >
                  Story (9:16)
                </button>
                <button
                  type="button"
                  onClick={() => setDownloadFormat('square')}
                  className={`px-2.5 py-1 font-semibold cursor-pointer border ${
                    downloadFormat === 'square'
                      ? 'bg-[#3fd6c6] text-[#101626] border-[#3fd6c6]'
                      : 'bg-[#18203a] text-[#f1ebdc] border-[#232d4b]'
                  }`}
                >
                  Square (1:1)
                </button>
              </div>
            </div>

            {/* Poster Summary Card */}
            <div className="w-full bg-[#18203a] border-2 border-[#232d4b] p-5 space-y-2 text-sm">
              <div className="flex justify-between border-b border-[#232d4b] pb-1.5">
                <span className="text-[#98a1ba]">Music Personality</span>
                <span className="text-[#ff5c9a] font-bold">{stats.sonicPersona.archetype}</span>
              </div>
              <div className="flex justify-between border-b border-[#232d4b] pb-1.5">
                <span className="text-[#98a1ba]">Taste Rarity</span>
                <span className="text-[#3fd6c6] font-bold">{stats.tasteRatings.rarity.score}/100 ({stats.tasteRatings.rarity.grade})</span>
              </div>
              <div className="flex justify-between border-b border-[#232d4b] pb-1.5">
                <span className="text-[#98a1ba]">Song Looping</span>
                <span className="text-[#f1ebdc] font-bold">{stats.tasteRatings.looping.grade}</span>
              </div>
              <div className="flex justify-between border-b border-[#232d4b] pb-1.5">
                <span className="text-[#98a1ba]">Top Artist</span>
                <span className="text-[#ff5c9a] font-bold">{topArtist.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#98a1ba]">Total Songs Played</span>
                <span className="text-[#f1ebdc] font-bold tabular-nums">{stats.totalPlays.toLocaleString()}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="flex flex-wrap items-center gap-3 w-full pt-1"
            >
              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={isExporting}
                className="min-touch-target px-5 py-2.5 bg-[#ff5c9a] hover:bg-[#ff75aa] text-[#101626] text-sm font-bold heading-bricolage cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#3fd6c6]"
              >
                {isExporting ? 'Generating image…' : `Download ${downloadFormat === 'story' ? 'Story (9:16)' : 'Square (1:1)'}`}
              </button>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="min-touch-target px-4 py-2.5 bg-[#18203a] hover:bg-[#232d4b] text-[#3fd6c6] border border-[#232d4b] text-sm font-bold heading-bricolage cursor-pointer focus-visible:ring-2 focus-visible:ring-[#3fd6c6]"
              >
                {copiedLink ? 'Link copied!' : 'Copy share link'}
              </button>

              <button
                type="button"
                onClick={handleCopySummary}
                className="min-touch-target px-4 py-2.5 bg-[#18203a] hover:bg-[#232d4b] text-[#f1ebdc] border border-[#232d4b] text-sm font-bold heading-bricolage cursor-pointer focus-visible:ring-2 focus-visible:ring-[#3fd6c6]"
              >
                {copiedSummary ? 'Summary copied!' : 'Copy summary'}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartOver();
                }}
                className="min-touch-target px-4 py-2.5 bg-transparent hover:text-[#ff5c9a] text-[#98a1ba] text-sm font-bold heading-bricolage cursor-pointer"
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden container for high-res html-to-image rendering */}
      <div 
        style={{ position: 'absolute', top: -9999, left: -9999, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <ExportCard
          ref={exportCardRef}
          data={data}
          periodLabel={periodLabel}
          format={downloadFormat}
        />
      </div>

      {/* Bottom slide index & helper */}
      <div className="relative z-20 w-full max-w-2xl mx-auto flex items-center justify-between text-xs text-[#98a1ba] pt-2">
        <span>Slide {currentSlide + 1} of {totalSlides}</span>
        <div className="flex items-center gap-4">
          {currentSlide > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((s) => s - 1);
              }}
              className="text-[#98a1ba] hover:text-[#f1ebdc] py-1"
            >
              Previous
            </button>
          )}
          {currentSlide < totalSlides - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((s) => s + 1);
              }}
              className="text-[#3fd6c6] hover:text-[#f1ebdc] py-1 font-bold"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
