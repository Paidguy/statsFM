import React, { useState } from 'react';
import type { LastFmArtist } from '../types/lastfm';

interface ArtistPosterProps {
  artists: LastFmArtist[];
  onSelectArtist?: (artist: LastFmArtist, rank: number) => void;
}

export const ArtistPoster: React.FC<ArtistPosterProps> = ({ artists, onSelectArtist }) => {
  const [hoveredArtist, setHoveredArtist] = useState<string | null>(null);

  if (!artists || artists.length === 0) {
    return (
      <div className="p-6 bg-[#18203a] text-[#98a1ba]">
        No artist history found for this period.
      </div>
    );
  }

  // Display top 24-30 artists
  const displayArtists = artists.slice(0, 30);
  const playCounts = displayArtists.map((a) => parseInt(a.playcount, 10) || 0);
  const maxPlays = Math.max(...playCounts, 1);
  const minPlays = Math.min(...playCounts, 1);

  return (
    <div className="w-full bg-[#18203a] p-6 sm:p-10 border border-[#232d4b]">
      <div 
        className="flex flex-wrap items-baseline gap-x-5 gap-y-3 justify-start select-none"
        role="region"
        aria-label="Top artists name poster"
      >
        {displayArtists.map((artist, idx) => {
          const plays = parseInt(artist.playcount, 10) || 0;
          
          // Logarithmic/linear hybrid scaling for gig poster look (16px to 54px)
          const ratio = maxPlays > minPlays ? (plays - minPlays) / (maxPlays - minPlays) : 0.5;
          const scaledRatio = Math.pow(ratio, 0.7);
          const fontSize = Math.round(16 + scaledRatio * 38);

          // Risograph ink accents for top 3
          let colorClass = 'text-[#f1ebdc] hover:text-[#3fd6c6]';
          if (idx === 0) {
            colorClass = 'text-[#ff5c9a] hover:text-[#f1ebdc]';
          } else if (idx === 1) {
            colorClass = 'text-[#3fd6c6] hover:text-[#f1ebdc]';
          } else if (idx === 2) {
            colorClass = 'text-[#f1ebdc]';
          }

          const isHovered = hoveredArtist === artist.name;

          return (
            <span
              key={artist.name + idx}
              onClick={() => onSelectArtist?.(artist, idx + 1)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectArtist?.(artist, idx + 1);
                }
              }}
              onMouseEnter={() => setHoveredArtist(artist.name)}
              onMouseLeave={() => setHoveredArtist(null)}
              onFocus={() => setHoveredArtist(artist.name)}
              onBlur={() => setHoveredArtist(null)}
              tabIndex={0}
              role="button"
              className={`inline-block heading-bricolage transition-colors cursor-pointer relative ${colorClass} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3fd6c6] active:scale-95`}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: 1.05,
              }}
              title={`${artist.name}: ${plays.toLocaleString()} plays. Click for spotlight.`}
            >
              {artist.name}
              {idx < displayArtists.length - 1 && (
                <span className="text-[#3a476e] text-base font-normal ml-3 pointer-events-none select-none">
                  /
                </span>
              )}
              {isHovered && (
                <span 
                  className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#101626] border border-[#2c3756] text-[#3fd6c6] text-xs px-2 py-0.5 whitespace-nowrap z-20 pointer-events-none body-bricolage"
                >
                  {plays.toLocaleString()} plays · Click for spotlight
                </span>
              )}
            </span>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-[#232d4b] flex items-center justify-between text-xs text-[#98a1ba]">
        <span>Ranked by play count · Click any artist to view spotlight</span>
        <span>{displayArtists.length} artists shown</span>
      </div>
    </div>
  );
};
