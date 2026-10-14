import React from 'react';
import type { LastFmTrack } from '../types/lastfm';

interface TopTracksProps {
  tracks: LastFmTrack[];
}

export const TopTracks: React.FC<TopTracksProps> = ({ tracks }) => {
  if (!tracks || tracks.length === 0) {
    return (
      <div className="p-6 bg-[#18203a] text-[#98a1ba]">
        No track history found for this period.
      </div>
    );
  }

  const displayTracks = tracks.slice(0, 10);
  const maxPlays = Math.max(...displayTracks.map((t) => parseInt(t.playcount, 10) || 0), 1);

  return (
    <div className="w-full bg-[#18203a] p-6 sm:p-8 border border-[#232d4b]">
      <div className="space-y-4">
        {displayTracks.map((track, idx) => {
          const plays = parseInt(track.playcount, 10) || 0;
          const percentage = Math.max(3, Math.round((plays / maxPlays) * 100));
          const artistName = track.artist?.name || (track.artist as any)?.['#text'] || 'Unknown artist';

          return (
            <div key={track.name + idx} className="group flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between text-sm sm:text-base gap-4">
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="text-[#98a1ba] font-bold w-6 shrink-0 text-sm">
                    {idx + 1}
                  </span>
                  <span className="text-[#f1ebdc] font-semibold truncate heading-bricolage">
                    {track.name}
                  </span>
                  <span className="text-[#98a1ba] truncate text-sm">
                    {artistName}
                  </span>
                </div>
                <span className="text-[#98a1ba] text-xs sm:text-sm shrink-0 tabular-nums">
                  {plays.toLocaleString()} plays
                </span>
              </div>

              {/* Hand-written proportional bar */}
              <div 
                className="w-full h-2 bg-[#101626] overflow-hidden" 
                role="progressbar" 
                aria-valuenow={plays} 
                aria-valuemin={0} 
                aria-valuemax={maxPlays}
                aria-label={`${track.name} by ${artistName}, ${plays} plays`}
              >
                <div
                  className="h-full bg-[#3fd6c6] transition-all duration-300 group-hover:bg-[#ff5c9a]"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
