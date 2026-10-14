import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import type { LastFmArtist } from '../types/lastfm';

interface FestivalPosterModalProps {
  username: string;
  periodLabel: string;
  artists: LastFmArtist[];
  onClose: () => void;
}

export const FestivalPosterModal: React.FC<FestivalPosterModalProps> = ({
  username,
  periodLabel,
  artists,
  onClose,
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const displayArtists = artists.slice(0, 36);
  const headliner = displayArtists[0]?.name || 'HEADLINER';
  const subHeadliners = displayArtists.slice(1, 5);
  const midTier = displayArtists.slice(5, 15);
  const undercard = displayArtists.slice(15, 36);

  const handleDownload = async () => {
    if (!posterRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        quality: 0.98,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${username.toLowerCase()}-festival-poster-a2.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export festival poster', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Festival gig poster export preview"
      className="fixed inset-0 z-50 bg-[#101626]/95 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#18203a] border border-[#232d4b] p-6 flex flex-col gap-6 relative select-none max-h-[95vh] overflow-y-auto"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-[#232d4b] pb-4">
          <div>
            <span className="text-xs uppercase font-bold text-[#ff5c9a] tracking-wider block">
              Silkscreen Gig Poster
            </span>
            <h3 className="text-xl font-bold text-[#f1ebdc] heading-bricolage">
              {username}&apos;s Festival Lineup (A2 / 18×24)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close poster preview"
            className="min-touch-target px-3 py-1 text-sm font-semibold text-[#98a1ba] hover:text-[#ff5c9a] bg-[#101626] border border-[#232d4b] rounded-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fd6c6]"
          >
            Close
          </button>
        </div>

        {/* Poster Preview Canvas (Scaled for screen, renders high-res on export) */}
        <div className="w-full flex justify-center overflow-x-auto bg-[#0a0e1a] p-4 border border-[#232d4b]">
          <div
            ref={posterRef}
            className="w-[500px] min-h-[700px] bg-[#101626] border-4 border-[#18203a] p-8 flex flex-col justify-between text-center relative overflow-hidden shrink-0"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
            }}
          >
            {/* Corner silkscreen registration marks */}
            <div className="absolute top-2 left-2 text-[#ff5c9a] text-xs font-mono select-none pointer-events-none">
              + REG.01
            </div>
            <div className="absolute top-2 right-2 text-[#3fd6c6] text-xs font-mono select-none pointer-events-none">
              + REG.02
            </div>
            <div className="absolute bottom-2 left-2 text-[#3fd6c6] text-xs font-mono select-none pointer-events-none">
              + REG.03
            </div>
            <div className="absolute bottom-2 right-2 text-[#ff5c9a] text-xs font-mono select-none pointer-events-none">
              + REG.04
            </div>

            {/* Overlapping risograph background motif */}
            <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
              <div className="w-80 h-80 rounded-full bg-[#ff5c9a] risograph-blend" />
              <div className="w-80 h-80 rounded-full bg-[#3fd6c6] -ml-28 risograph-blend" />
            </div>

            {/* Poster Header */}
            <div className="relative z-10 border-b-2 border-[#f1ebdc] pb-4 mb-4">
              <div className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#98a1ba] uppercase mb-1">
                STATSFM &amp; LAST.FM PRESENT
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#f1ebdc] uppercase tracking-tight heading-bricolage">
                {username}&apos;S SOUND FESTIVAL
              </h1>
              <div className="text-xs font-semibold text-[#3fd6c6] tracking-widest uppercase mt-1">
                LIVE IN YOUR HEADPHONES · {periodLabel.toUpperCase()} · RAIN OR SHINE
              </div>
            </div>

            {/* Lineup Tiers */}
            <div className="relative z-10 my-auto flex flex-col gap-6 py-2">
              {/* Headliner */}
              <div>
                <span className="text-[10px] tracking-widest uppercase text-[#ff5c9a] font-bold block mb-1">
                  ★ SPECIAL GUEST HEADLINER ★
                </span>
                <div className="text-4xl sm:text-5xl font-black text-[#f1ebdc] uppercase tracking-tighter heading-bricolage leading-none">
                  {headliner}
                </div>
              </div>

              {/* Sub-Headliners */}
              {subHeadliners.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-b border-[#232d4b] py-3">
                  {subHeadliners.map((art) => (
                    <span
                      key={art.name}
                      className="text-lg sm:text-xl font-extrabold text-[#3fd6c6] uppercase heading-bricolage"
                    >
                      {art.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Mid-Tier */}
              {midTier.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm sm:text-base font-bold text-[#f1ebdc] heading-bricolage">
                  {midTier.map((art, idx) => (
                    <React.Fragment key={art.name}>
                      <span>{art.name}</span>
                      {idx < midTier.length - 1 && (
                        <span className="text-[#ff5c9a] font-normal">/</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Undercard */}
              {undercard.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-[#98a1ba] font-medium leading-relaxed">
                  {undercard.map((art, idx) => (
                    <React.Fragment key={art.name}>
                      <span>{art.name}</span>
                      {idx < undercard.length - 1 && (
                        <span className="text-[#3a476e]">·</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Poster Footer with Ticket Barcode */}
            <div className="relative z-10 border-t-2 border-[#f1ebdc] pt-4 mt-4 flex items-center justify-between text-left text-[10px] text-[#98a1ba]">
              <div>
                <span className="font-bold text-[#f1ebdc] block uppercase">VENUE: STEREO RECORD PLAZA</span>
                <span>ADMIT ONE · NON-TRANSFERABLE</span>
              </div>
              <div className="flex flex-col items-end">
                {/* Simulated Barcode */}
                <div className="flex items-center gap-0.5 h-6 bg-[#f1ebdc] px-1 py-0.5">
                  <div className="w-1 h-full bg-[#101626]" />
                  <div className="w-0.5 h-full bg-[#101626]" />
                  <div className="w-1.5 h-full bg-[#101626]" />
                  <div className="w-0.5 h-full bg-[#101626]" />
                  <div className="w-2 h-full bg-[#101626]" />
                  <div className="w-1 h-full bg-[#101626]" />
                  <div className="w-0.5 h-full bg-[#101626]" />
                  <div className="w-1.5 h-full bg-[#101626]" />
                  <div className="w-2 h-full bg-[#101626]" />
                </div>
                <span className="font-mono text-[9px] mt-0.5">#ND-LASTFM-{headliner.slice(0, 3).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[#98a1ba]">
            Silkscreen concert poster format ready for print or sharing
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="min-touch-target px-6 py-2.5 bg-[#ff5c9a] hover:bg-[#ff75aa] text-[#101626] font-bold heading-bricolage text-sm cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fd6c6]"
          >
            {isExporting ? 'Generating poster…' : 'Download festival poster (PNG)'}
          </button>
        </div>
      </div>
    </div>
  );
};
