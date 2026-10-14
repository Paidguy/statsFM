import React, { useState } from 'react';
import type { LastFmRecentTrack } from '../types/lastfm';
import { NowPlayingTicker } from './NowPlayingTicker';
import { MagneticButton } from './MagneticButton';

interface HeroProps {
  initialUsername?: string;
  onSearch: (username: string) => void;
  isLoading: boolean;
  errorMessage?: string | null;
  nowPlayingTrack?: LastFmRecentTrack | null;
  latestTrack?: LastFmRecentTrack | null;
}

const SAMPLE_ACCOUNTS = [
  { user: 'rj', label: 'rj (Founder)' },
  { user: 'cher', label: 'cher' },
];

export const Hero: React.FC<HeroProps> = ({
  initialUsername = '',
  onSearch,
  isLoading,
  errorMessage,
  nowPlayingTrack,
  latestTrack,
}) => {
  const [username, setUsername] = useState(initialUsername);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username.trim());
    }
  };

  const handleSelectSample = (sampleUser: string) => {
    setUsername(sampleUser);
    onSearch(sampleUser);
  };

  return (
    <section className="relative w-full max-w-3xl mx-auto px-6 pt-16 pb-14 sm:pt-24 sm:pb-20 select-none">
      <div className="relative z-10 w-full flex flex-col items-start">
        {/* Status Kicker - Clean Unboxed Metadata */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#3fd6c6] uppercase tracking-widest mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3fd6c6] animate-pulse" aria-hidden="true" />
          <span>LAST.FM TASTE RATINGS &amp; STATS</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl text-[#f1ebdc] heading-bricolage mb-5 leading-tight tracking-tight">
          Your Last.fm, in full.
        </h1>
        <p className="text-lg sm:text-xl text-[#98a1ba] body-bricolage mb-8 prose-measure leading-relaxed">
          Type any Last.fm username to see your music taste ratings, top artists, favorite songs, and listening habits explained in simple, everyday language.
        </p>

        {/* Search Input Form with Magnetic CTA */}
        <form onSubmit={handleSubmit} className="w-full mb-3" aria-busy={isLoading}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <label htmlFor="lastfm-username-input" className="sr-only">
                Last.fm username
              </label>
              <input
                id="lastfm-username-input"
                type="text"
                autoComplete="off"
                spellCheck="false"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Last.fm username (e.g. rj)"
                disabled={isLoading}
                className="w-full min-touch-target px-4 py-3.5 bg-[#18203a] border border-[#2b3658] text-[#f1ebdc] placeholder-[#98a1ba] rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fd6c6] text-base body-bricolage transition-colors"
              />
            </div>

            <MagneticButton
              type="submit"
              disabled={isLoading || !username.trim()}
              className="w-full sm:w-auto min-touch-target px-7 py-3.5 bg-[#ff5c9a] hover:bg-[#ff75aa] active:bg-[#e04583] disabled:opacity-50 disabled:cursor-not-allowed text-[#101626] font-bold heading-bricolage text-base rounded-none cursor-pointer transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fd6c6]"
            >
              {isLoading ? 'Loading…' : 'Show my stats'}
            </MagneticButton>
          </div>
        </form>

        {/* 1-Click Magnetic Sample Accounts */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#98a1ba] mb-4">
          <span>Quick test:</span>
          {SAMPLE_ACCOUNTS.map((sample) => (
            <MagneticButton
              key={sample.user}
              type="button"
              onClick={() => handleSelectSample(sample.user)}
              aria-label={`Test with sample username ${sample.label}`}
              className="min-h-[36px] px-3 py-1.5 bg-[#18203a] hover:bg-[#232d4b] text-[#f1ebdc] border border-[#232d4b] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fd6c6] text-xs font-semibold"
            >
              {sample.label}
            </MagneticButton>
          ))}
        </div>

        <p className="text-sm text-[#98a1ba] mb-4">
          Your profile needs to be public. We only read what Last.fm already shows on it.
        </p>

        {errorMessage && (
          <div 
            role="alert" 
            aria-live="assertive"
            className="p-4 bg-[#18203a] border-l-2 border-[#ff5c9a] text-[#f1ebdc] text-base body-bricolage mb-4"
          >
            {errorMessage}
          </div>
        )}

        {/* Active Live Playback Ticker */}
        {(nowPlayingTrack || latestTrack) && (
          <div className="w-full mt-2">
            <NowPlayingTicker
              nowPlayingTrack={nowPlayingTrack || null}
              latestTrack={latestTrack || null}
            />
          </div>
        )}
      </div>
    </section>
  );
};
