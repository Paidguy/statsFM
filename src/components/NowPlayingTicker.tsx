import React from 'react';
import type { LastFmRecentTrack } from '../types/lastfm';

interface NowPlayingTickerProps {
  nowPlayingTrack: LastFmRecentTrack | null;
  latestTrack?: LastFmRecentTrack | null;
}

export const NowPlayingTicker: React.FC<NowPlayingTickerProps> = ({
  nowPlayingTrack,
  latestTrack,
}) => {
  const activeTrack = nowPlayingTrack || latestTrack;
  if (!activeTrack) return null;

  const isLive = !!nowPlayingTrack;
  const artistName = activeTrack.artist?.['#text'] || 'Unknown artist';
  const trackName = activeTrack.name || 'Unknown track';
  const albumName = activeTrack.album?.['#text'];

  return (
    <div
      role="region"
      aria-label={isLive ? `Now playing: ${trackName} by ${artistName}` : `Latest scrobble: ${trackName} by ${artistName}`}
      className="w-full bg-[#18203a] border border-[#232d4b] p-3 sm:p-4 flex items-center justify-between gap-4 mt-6 select-none"
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Animated Turntable Record & Arm */}
        <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
          {/* Spinning Record Platter */}
          <div
            className={`w-9 h-9 rounded-full bg-[#101626] border border-[#2c3756] relative flex items-center justify-center ${
              isLive ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '3.5s' }}
            aria-hidden="true"
          >
            {/* Record grooves */}
            <div className="absolute inset-1 rounded-full border border-[#232d4b]" />
            <div className="absolute inset-2 rounded-full border border-[#232d4b]" />
            {/* Center ink label */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#18203a] relative flex items-center justify-center">
              <div className="absolute w-2 h-2 rounded-full bg-[#ff5c9a] -left-0.5 risograph-blend" />
              <div className="absolute w-2 h-2 rounded-full bg-[#3fd6c6] -right-0.5 risograph-blend" />
            </div>
          </div>

          {/* Pivoting Record Arm */}
          <div
            className={`absolute top-0 right-0 w-6 h-6 pointer-events-none origin-top-right transition-transform duration-300 ${
              isLive ? 'rotate-12' : '-rotate-12'
            }`}
            aria-hidden="true"
          >
            <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-[#98a1ba]" />
            <div className="absolute top-0.5 right-0.5 w-4 h-0.5 bg-[#98a1ba] origin-right -rotate-45" />
            <div className={`absolute top-3 right-3 w-1 h-1 ${isLive ? 'bg-[#3fd6c6]' : 'bg-[#98a1ba]'}`} />
          </div>
        </div>

        {/* Track Metadata */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                isLive ? 'text-[#3fd6c6]' : 'text-[#98a1ba]'
              }`}
            >
              {isLive ? 'Now spinning' : 'Last scrobbled'}
            </span>
            {isLive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fd6c6] animate-ping" />
            )}
          </div>
          <div className="flex items-baseline gap-2 truncate">
            <span className="text-sm sm:text-base font-bold text-[#f1ebdc] heading-bricolage truncate">
              {trackName}
            </span>
            <span className="text-xs sm:text-sm text-[#98a1ba] truncate">
              {artistName}
            </span>
          </div>
        </div>
      </div>

      {albumName && (
        <span className="hidden md:inline-block text-xs text-[#98a1ba] truncate max-w-[200px] border-l border-[#232d4b] pl-3">
          {albumName}
        </span>
      )}
    </div>
  );
};
