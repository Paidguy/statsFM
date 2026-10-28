import React, { useState, useRef, useEffect } from 'react';
import type { Period, UserStatsPayload, LastFmArtist } from './types/lastfm';
import { fetchUserFullStats, LastFmError } from './api/lastfmClient';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ArtistPoster } from './components/ArtistPoster';
import { TopTracks } from './components/TopTracks';
import { HourChart } from './components/HourChart';
import { WeekdayHeatmap } from './components/WeekdayHeatmap';
import { DecadeDistribution } from './components/DecadeDistribution';
import { VelocityGauge } from './components/VelocityGauge';
import { CatalogDiversity } from './components/CatalogDiversity';
import { TopAlbums } from './components/TopAlbums';
import { RecapModal } from './components/RecapModal';
import { TasteRatings } from './components/TasteRatings';
import { CustomCursor } from './components/CustomCursor';
import { ArtistSpotlightModal } from './components/ArtistSpotlightModal';
import { FestivalPosterModal } from './components/FestivalPosterModal';

const PERIOD_OPTIONS: { id: Period; label: string }[] = [
  { id: '12month', label: 'Last 12 months' },
  { id: 'overall', label: 'All time' },
  { id: '6month', label: 'Last 6 months' },
  { id: '1month', label: 'Last month' },
];

export default function App() {
  const [username, setUsername] = useState<string>('');
  const [period, setPeriod] = useState<Period>('12month');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<UserStatsPayload | null>(null);
  const [isRecapOpen, setIsRecapOpen] = useState<boolean>(false);
  const [spotlightArtist, setSpotlightArtist] = useState<{ artist: LastFmArtist; rank: number } | null>(null);
  const [isFestivalPosterOpen, setIsFestivalPosterOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Check URL query parameters on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('u');
    const periodParam = params.get('p') as Period | null;

    if (userParam) {
      const validPeriod: Period = ['12month', 'overall', '6month', '1month'].includes(periodParam || '')
        ? (periodParam as Period)
        : '12month';
      setPeriod(validPeriod);
      loadStats(userParam, validPeriod);
    }
  }, []);

  const loadStats = async (userToLoad: string, targetPeriod: Period = period) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchUserFullStats(userToLoad, targetPeriod);
      setStatsData(data);
      setUsername(userToLoad);

      // Update URL query params without reloading
      const url = new URL(window.location.href);
      url.searchParams.set('u', userToLoad);
      url.searchParams.set('p', targetPeriod);
      window.history.replaceState({}, '', url.toString());

      // Smooth scroll into results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      if (err instanceof LastFmError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Could not reach Last.fm. Try again in a minute.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    if (username) {
      loadStats(username, newPeriod);
    }
  };

  const handleCopyDirectLink = async () => {
    const url = `${window.location.origin}/?u=${encodeURIComponent(username)}&p=${period}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleStartOver = () => {
    setStatsData(null);
    setErrorMessage(null);
    setSpotlightArtist(null);
    setIsFestivalPosterOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('u');
    url.searchParams.delete('p');
    window.history.replaceState({}, '', url.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPeriodLabel = PERIOD_OPTIONS.find((p) => p.id === period)?.label || 'Last 12 months';

  return (
    <div className="min-h-screen bg-[#101626] text-[#f1ebdc] flex flex-col justify-between relative selection:bg-[#ff5c9a] selection:text-[#101626]">
      {/* Custom Stylus Needle & Dual-Ink Cursor */}
      <CustomCursor />

      <div className="w-full">
        {/* Top Header */}
        <Header onReset={handleStartOver} />

        {/* Hero & Input */}
        <Hero
          initialUsername={username}
          onSearch={(val) => loadStats(val, period)}
          isLoading={isLoading}
          errorMessage={errorMessage}
          nowPlayingTrack={statsData?.nowPlayingTrack}
          latestTrack={statsData?.recentTracks?.[0]}
        />

        {/* Results Section (rendered after a search) */}
        {statsData && (
          <div
            id="results"
            ref={resultsRef}
            className="w-full max-w-4xl mx-auto px-6 py-12 space-y-16"
          >
            {/* User heading and period selection */}
            <div className="space-y-6 border-b border-[#232d4b] pb-8">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-[#f1ebdc] heading-bricolage">
                    {statsData.username}
                  </h2>
                  <button
                    type="button"
                    onClick={handleCopyDirectLink}
                    className="min-touch-target px-3 py-1 bg-[#18203a] hover:bg-[#232d4b] text-xs font-semibold text-[#3fd6c6] border border-[#232d4b] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fd6c6]"
                    title="Copy direct shareable link"
                  >
                    {copiedLink ? 'Link copied to clipboard!' : 'Copy link to stats'}
                  </button>
                </div>

                {/* Period buttons: Last 12 months, All time, Last 6 months, Last month */}
                <div
                  role="tablist"
                  aria-label="Time period selection"
                  className="flex flex-wrap items-center gap-2"
                >
                  {PERIOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      role="tab"
                      aria-selected={period === opt.id}
                      disabled={isLoading}
                      onClick={() => handlePeriodChange(opt.id)}
                      className={`min-touch-target px-4 py-2 text-sm font-semibold rounded-none cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fd6c6] ${
                        period === opt.id
                          ? 'bg-[#3fd6c6] text-[#101626]'
                          : 'bg-[#18203a] hover:bg-[#232d4b] text-[#f1ebdc] border border-[#232d4b]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* One paragraph of totals with emphasised numbers */}
              <p className="text-lg sm:text-xl text-[#98a1ba] body-bricolage prose-measure leading-relaxed">
                {period === 'overall' ? (
                  <>
                    You have played{' '}
                    <strong className="text-[#f1ebdc] font-bold body-bricolage-bold">
                      {statsData.stats.totalPlays.toLocaleString()}
                    </strong>{' '}
                    tracks since{' '}
                    <strong className="text-[#f1ebdc] font-bold body-bricolage-bold">
                      {statsData.stats.registeredYear}
                    </strong>
                    . That is about{' '}
                    <strong className="text-[#f1ebdc] font-bold body-bricolage-bold">
                      {statsData.stats.daysOfMusic.toLocaleString()}
                    </strong>{' '}
                    days ({statsData.stats.hoursOfMusic.toLocaleString()} hours) of continuous music, averaging{' '}
                    <strong className="text-[#f1ebdc] font-bold body-bricolage-bold">
                      {statsData.stats.playsPerDay.toLocaleString()}
                    </strong>{' '}
                    plays a day across{' '}
                    <strong className="text-[#f1ebdc] font-bold body-bricolage-bold">
                      {statsData.stats.totalArtists.toLocaleString()}
                    </strong>{' '}
                    different artists.
                  </>
                ) : (
                  <>
                    In the{' '}
                    <strong className="text-[#3fd6c6] font-bold body-bricolage-bold">
                      {currentPeriodLabel.toLowerCase()}
                    </strong>
                    , you have played{' '}
                    <strong className="text-[#f1ebdc] font-bold body-bricolage-bold">
                      {statsData.stats.totalPlays.toLocaleString()}
                    </strong>{' '}
                    tracks ({statsData.stats.hoursOfMusic.toLocaleString()} hours /{' '}
                    <strong className="text-[#f1ebdc] font-bold body-bricolage-bold">
                      {statsData.stats.daysOfMusic.toLocaleString()}
                    </strong>{' '}
                    days of music), averaging{' '}
                    <strong className="text-[#f1ebdc] font-bold body-bricolage-bold">
                      {statsData.stats.playsPerDay.toLocaleString()}
                    </strong>{' '}
                    plays a day across{' '}
                    <strong className="text-[#f1ebdc] font-bold body-bricolage-bold">
                      {statsData.stats.totalArtists.toLocaleString()}
                    </strong>{' '}
                    artists (out of{' '}
                    <strong className="text-[#f1ebdc] font-bold body-bricolage-bold">
                      {statsData.stats.lifetimePlays.toLocaleString()}
                    </strong>{' '}
                    all-time plays since {statsData.stats.registeredYear}).
                  </>
                )}
              </p>

              {/* Action buttons: Open my recap & Export festival poster */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecapOpen(true)}
                  className="min-touch-target px-6 py-3.5 bg-[#ff5c9a] hover:bg-[#ff75aa] active:bg-[#e04583] text-[#101626] font-bold heading-bricolage text-base rounded-none cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fd6c6]"
                >
                  Open my recap
                </button>
                <button
                  type="button"
                  onClick={() => setIsFestivalPosterOpen(true)}
                  className="min-touch-target px-5 py-3.5 bg-[#18203a] hover:bg-[#232d4b] text-[#3fd6c6] border border-[#232d4b] font-bold heading-bricolage text-base rounded-none cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fd6c6]"
                >
                  Festival poster (A2)
                </button>
              </div>
            </div>

            {/* Comprehensive Music Taste Rating Scorecard */}
            <section id="section-ratings">
              <TasteRatings
                ratings={statsData.stats.tasteRatings}
                persona={statsData.stats.sonicPersona}
                username={statsData.username}
              />
            </section>

            {/* Top artists name poster with click-to-spotlight */}
            <section id="section-artists" className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#f1ebdc] heading-bricolage">
                    Top artists
                  </h3>
                  <p className="text-sm text-[#98a1ba]">
                    Size reflects how many times you played each artist. Tap any name to see their profile.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFestivalPosterOpen(true)}
                  className="text-xs text-[#ff5c9a] hover:text-[#f1ebdc] underline cursor-pointer shrink-0"
                >
                  Export festival lineup poster ↗
                </button>
              </div>
              <ArtistPoster
                artists={statsData.artists}
                onSelectArtist={(artist, rank) => setSpotlightArtist({ artist, rank })}
              />
            </section>

            {/* Top tracks ranked list with proportional bars */}
            <section id="section-tracks" className="space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-[#f1ebdc] heading-bricolage">
                  Top tracks
                </h3>
                <p className="text-sm text-[#98a1ba]">
                  Your most-played songs ranked by total plays.
                </p>
              </div>
              <TopTracks tracks={statsData.tracks} />
            </section>

            {/* Decade & Era Distribution */}
            <section id="section-decades" className="space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-[#f1ebdc] heading-bricolage">
                  Favorite eras &amp; decades
                </h3>
                <p className="text-sm text-[#98a1ba]">
                  Which decades your favorite music was created in.
                </p>
              </div>
              <DecadeDistribution
                decades={statsData.decades}
                topDecade={statsData.stats.topDecade}
              />
            </section>

            {/* Catalog Diversity Spectrum */}
            <section id="section-diversity" className="space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-[#f1ebdc] heading-bricolage">
                  Artist loyalty vs. variety
                </h3>
                <p className="text-sm text-[#98a1ba]">
                  Do you focus heavily on a small circle of favorites, or explore widely?
                </p>
              </div>
              <CatalogDiversity
                diversity={statsData.stats.diversity}
                totalArtists={statsData.stats.totalArtists}
              />
            </section>

            {/* Listening Pace / Velocity Gauge */}
            <section id="section-velocity" className="space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-[#f1ebdc] heading-bricolage">
                  Daily listening pace
                </h3>
                <p className="text-sm text-[#98a1ba]">
                  How much music you listen to each day compared to your normal routine.
                </p>
              </div>
              <VelocityGauge velocity={statsData.stats.velocity} />
            </section>

            {/* Listening by hour and weekday heatmap */}
            <div className="space-y-12">
              <section id="section-hours" className="space-y-3">
                <div>
                  <h3 className="text-2xl font-bold text-[#f1ebdc] heading-bricolage">
                    Listening by hour of day
                  </h3>
                  <p className="text-sm text-[#98a1ba]">
                    What time of day you listen most based on your recent{' '}
                    {statsData.hours.reduce((sum, h) => sum + h.count, 0)} dated plays.
                  </p>
                </div>
                <HourChart hours={statsData.hours} />
              </section>

              <section id="section-days" className="space-y-3">
                <div>
                  <h3 className="text-2xl font-bold text-[#f1ebdc] heading-bricolage">
                    Listening by day of week
                  </h3>
                  <p className="text-sm text-[#98a1ba]">
                    Comparing your weekday listening to weekend listening.
                  </p>
                </div>
                <WeekdayHeatmap days={statsData.days} />
              </section>
            </div>

            {/* Top albums grid */}
            <section id="section-albums" className="space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-[#f1ebdc] heading-bricolage">
                  Top albums
                </h3>
                <p className="text-sm text-[#98a1ba]">
                  Your most-streamed albums with album artwork.
                </p>
              </div>
              <TopAlbums albums={statsData.albums} />
            </section>

            {/* Bottom recap call to action */}
            <div className="pt-6 border-t border-[#232d4b] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecapOpen(true)}
                  className="min-touch-target px-6 py-3.5 bg-[#3fd6c6] hover:bg-[#5cf0e1] text-[#101626] font-bold heading-bricolage text-base rounded-none cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5c9a]"
                >
                  Open my recap
                </button>
                <button
                  type="button"
                  onClick={() => setIsFestivalPosterOpen(true)}
                  className="min-touch-target px-5 py-3.5 bg-[#18203a] hover:bg-[#232d4b] text-[#f1ebdc] border border-[#232d4b] font-bold heading-bricolage text-base rounded-none cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fd6c6]"
                >
                  Festival poster
                </button>
              </div>
              <button
                type="button"
                onClick={handleStartOver}
                className="text-sm text-[#98a1ba] hover:text-[#f1ebdc] cursor-pointer py-2 px-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3fd6c6]"
              >
                Start another lookup
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Artist Spotlight Modal */}
      {spotlightArtist && statsData && (
        <ArtistSpotlightModal
          artist={spotlightArtist.artist}
          rank={spotlightArtist.rank}
          username={statsData.username}
          periodLabel={currentPeriodLabel}
          allTracks={statsData.tracks}
          allAlbums={statsData.albums}
          recentTracks={statsData.recentTracks}
          totalPlays={statsData.stats.totalPlays}
          onClose={() => setSpotlightArtist(null)}
        />
      )}

      {/* Festival Silkscreen Poster Modal */}
      {isFestivalPosterOpen && statsData && (
        <FestivalPosterModal
          username={statsData.username}
          periodLabel={currentPeriodLabel}
          artists={statsData.artists}
          onClose={() => setIsFestivalPosterOpen(false)}
        />
      )}

      {/* Recap Modal Story */}
      {isRecapOpen && statsData && (
        <RecapModal
          data={statsData}
          periodLabel={currentPeriodLabel}
          onClose={() => setIsRecapOpen(false)}
          onStartOver={handleStartOver}
        />
      )}

      {/* Quiet Footer */}
      <footer className="w-full border-t border-[#18203a] px-6 py-6 mt-16 text-xs text-[#98a1ba]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>statsFM. Reads public Last.fm profile data.</span>
          <span>Cached for 5 minutes. No sign-up required.</span>
        </div>
      </footer>
    </div>
  );
}
