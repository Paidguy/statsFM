import React, { useState } from 'react';
import type { LastFmAlbum } from '../types/lastfm';

interface TopAlbumsProps {
  albums: LastFmAlbum[];
}

export const TopAlbums: React.FC<TopAlbumsProps> = ({ albums }) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (!albums || albums.length === 0) {
    return (
      <div className="p-6 bg-[#18203a] text-[#98a1ba]">
        No album history found for this period.
      </div>
    );
  }

  const displayAlbums = albums.slice(0, 12);

  const getAlbumImageUrl = (album: LastFmAlbum): string => {
    if (!album.image || album.image.length === 0) return '';
    // Look for extralarge or large
    const extra = album.image.find((img) => img.size === 'extralarge');
    if (extra && extra['#text']) return extra['#text'];
    const large = album.image.find((img) => img.size === 'large');
    if (large && large['#text']) return large['#text'];
    const medium = album.image.find((img) => img.size === 'medium');
    if (medium && medium['#text']) return medium['#text'];
    return album.image[album.image.length - 1]?.['#text'] || '';
  };

  const handleImageError = (key: string) => {
    setFailedImages((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayAlbums.map((album, idx) => {
          const rawUrl = getAlbumImageUrl(album);
          const artistName = album.artist?.name || (album.artist as any)?.['#text'] || 'Unknown artist';
          const plays = parseInt(album.playcount, 10) || 0;
          const key = `${album.name}-${artistName}-${idx}`;
          // Last.fm placeholder star or empty or failed
          const isInvalidUrl = !rawUrl || rawUrl.includes('2a96cbd8b46e442fc41c2b86b821562f') || failedImages[key];

          return (
            <div
              key={key}
              className="bg-[#18203a] border border-[#232d4b] p-3 flex flex-col justify-between group"
            >
              {/* Sleeve / Cover Art */}
              <div className="relative aspect-square w-full overflow-hidden bg-[#101626] mb-3">
                {!isInvalidUrl ? (
                  <img
                    src={rawUrl}
                    alt={`${album.name} by ${artistName} album cover`}
                    referrerPolicy="no-referrer"
                    onError={() => handleImageError(key)}
                    className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-200"
                  />
                ) : (
                  /* Generated Risograph Ink Fallback Sleeve */
                  <div 
                    className="relative w-full h-full bg-[#101626] p-4 flex flex-col justify-between select-none overflow-hidden"
                    role="img"
                    aria-label={`Generated sleeve for ${album.name}`}
                  >
                    {/* Vinyl grooves pattern */}
                    <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
                      <div className="w-44 h-44 rounded-full border border-[#f1ebdc]" />
                      <div className="absolute w-32 h-32 rounded-full border border-[#f1ebdc]" />
                      <div className="absolute w-20 h-20 rounded-full border border-[#f1ebdc]" />
                      <div className="absolute w-8 h-8 rounded-full bg-[#232d4b]" />
                    </div>

                    {/* Overlapping screen-blended ink circles motif */}
                    <div className="absolute -top-4 -right-4 w-28 h-28 pointer-events-none">
                      <div className="absolute top-0 right-4 w-18 h-18 rounded-full bg-[#ff5c9a] opacity-80 risograph-blend" />
                      <div className="absolute bottom-0 right-0 w-18 h-18 rounded-full bg-[#3fd6c6] opacity-80 risograph-blend" />
                    </div>

                    <div className="relative z-10">
                      <span className="text-[10px] text-[#98a1ba] tracking-wider uppercase block">
                        Record
                      </span>
                    </div>

                    <div className="relative z-10">
                      <div className="text-sm font-bold text-[#f1ebdc] heading-bricolage line-clamp-2">
                        {album.name}
                      </div>
                      <div className="text-xs text-[#98a1ba] truncate">
                        {artistName}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Album info */}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-[#f1ebdc] heading-bricolage truncate">
                  {album.name}
                </span>
                <span className="text-xs text-[#98a1ba] truncate">
                  {artistName}
                </span>
                <span className="text-xs text-[#3fd6c6] mt-1 tabular-nums">
                  {plays.toLocaleString()} plays
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
