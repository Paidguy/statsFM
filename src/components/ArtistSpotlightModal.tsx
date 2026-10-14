import React, { useEffect } from 'react';
import type { LastFmArtist, LastFmTrack, LastFmAlbum, LastFmRecentTrack } from '../types/lastfm';

interface ArtistSpotlightModalProps {
  artist: LastFmArtist;
  rank: number;
  username: string;
  periodLabel: string;
  allTracks: LastFmTrack[];
  allAlbums: LastFmAlbum[];
  recentTracks: LastFmRecentTrack[];
  totalPlays: number;
  onClose: () => void;
}

export const ArtistSpotlightModal: React.FC<ArtistSpotlightModalProps> = ({
  artist,
  rank,
  username,
  periodLabel,
  allTracks,
  allAlbums,
  recentTracks,
  totalPlays,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const artistPlays = parseInt(artist.playcount, 10) || 0;
  const normalizedArtist = artist.name.trim().toLowerCase();

  // Find tracks by this artist
  const artistTracks = allTracks.filter((t) => {
    const name = t.artist?.name || (t.artist as any)?.['#text'] || '';
    return name.trim().toLowerCase() === normalizedArtist;
  });

  // Also extract tracks from recent history if not in top tracks
  const recentByArtist = recentTracks.filter(
    (t) => t.artist?.['#text']?.trim().toLowerCase() === normalizedArtist
  );

  // Find albums by this artist
  const artistAlbums = allAlbums.filter((a) => {
    const name = a.artist?.name || (a.artist as any)?.['#text'] || '';
    return name.trim().toLowerCase() === normalizedArtist;
  });

  // Calculate percentage of total plays
  const percentageOfTotal = totalPlays > 0 ? ((artistPlays / totalPlays) * 100).toFixed(1) : '0';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Artist spotlight: ${artist.name}`}
      className="fixed inset-0 z-50 bg-[#101626]/90 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#18203a] border border-[#232d4b] p-6 sm:p-8 flex flex-col gap-6 relative select-none max-h-[90vh] overflow-y-auto"
      >
        {/* Top bar with rank and close button */}
        <div className="flex items-center justify-between border-b border-[#232d4b] pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#3fd6c6]">
            <span>#{rank} ARTIST</span>
            <span className="text-[#98a1ba]">/</span>
            <span className="text-[#98a1ba]">{periodLabel}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close artist spotlight"
            className="min-touch-target px-3 py-1 text-sm font-semibold text-[#98a1ba] hover:text-[#ff5c9a] bg-[#101626] border border-[#232d4b] rounded-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fd6c6]"
          >
            Close
          </button>
        </div>

        {/* Artist Header */}
        <div className="space-y-2">
          <h3 className="text-3xl sm:text-5xl font-extrabold text-[#f1ebdc] heading-bricolage">
            {artist.name}
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#98a1ba]">
            <span>
              <strong className="text-[#ff5c9a] font-bold text-base tabular-nums">
                {artistPlays.toLocaleString()}
              </strong>{' '}
              plays
            </span>
            <span>•</span>
            <span>
              <strong className="text-[#3fd6c6] font-bold text-base tabular-nums">
                {percentageOfTotal}%
              </strong>{' '}
              of your listening
            </span>
          </div>
        </div>

        {/* User's Top Tracks by this artist */}
        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-bold text-[#f1ebdc] uppercase tracking-wider">
            Your top tracks
          </h4>
          {artistTracks.length > 0 ? (
            <div className="space-y-2">
              {artistTracks.slice(0, 5).map((track, idx) => (
                <div
                  key={track.name + idx}
                  className="bg-[#101626] p-3 border border-[#232d4b] flex items-center justify-between text-sm gap-2"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[#98a1ba] font-bold text-xs w-4">
                      {idx + 1}
                    </span>
                    <span className="text-[#f1ebdc] font-semibold truncate heading-bricolage">
                      {track.name}
                    </span>
                  </div>
                  <span className="text-xs text-[#3fd6c6] tabular-nums shrink-0">
                    {parseInt(track.playcount, 10).toLocaleString()} plays
                  </span>
                </div>
              ))}
            </div>
          ) : recentByArtist.length > 0 ? (
            <div className="space-y-2">
              <span className="text-xs text-[#98a1ba]">
                Appeared in your latest 200 plays:
              </span>
              {Array.from(new Set(recentByArtist.map((t) => t.name)))
                .slice(0, 5)
                .map((name, idx) => (
                  <div
                    key={name + idx}
                    className="bg-[#101626] p-3 border border-[#232d4b] text-sm text-[#f1ebdc] font-semibold truncate"
                  >
                    {name}
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-xs text-[#98a1ba] bg-[#101626] p-3 border border-[#232d4b]">
              Individual track breakdown for this period is grouped under artist plays.
            </p>
          )}
        </div>

        {/* User's Top Albums by this artist */}
        {artistAlbums.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-[#f1ebdc] uppercase tracking-wider">
              Top albums
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {artistAlbums.slice(0, 4).map((album, idx) => (
                <div
                  key={album.name + idx}
                  className="bg-[#101626] p-3 border border-[#232d4b] flex flex-col justify-between"
                >
                  <span className="text-sm font-bold text-[#f1ebdc] heading-bricolage line-clamp-1">
                    {album.name}
                  </span>
                  <span className="text-xs text-[#98a1ba] mt-1 tabular-nums">
                    {parseInt(album.playcount, 10).toLocaleString()} plays
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-4 border-t border-[#232d4b] flex items-center justify-between text-xs text-[#98a1ba]">
          <a
            href={`https://www.last.fm/user/${encodeURIComponent(username)}/library/music/${encodeURIComponent(artist.name)}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#3fd6c6] text-[#f1ebdc] underline focus-visible:ring-1 focus-visible:ring-[#3fd6c6]"
          >
            Open on Last.fm ↗
          </a>
          <span>statsFM</span>
        </div>
      </div>
    </div>
  );
};
