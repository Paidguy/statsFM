import React from 'react';
import type { CatalogDiversityStats } from '../types/lastfm';

interface CatalogDiversityProps {
  diversity: CatalogDiversityStats;
  totalArtists: number;
}

export const CatalogDiversity: React.FC<CatalogDiversityProps> = ({ diversity, totalArtists }) => {
  const { diversityScore, archetype, top5ArtistShare, description } = diversity;

  const isLoyalist = archetype === 'Deep Loyalist';
  const isExplorer = archetype === 'Eclectic Explorer';

  return (
    <div className="w-full bg-[#18203a] p-6 sm:p-8 border border-[#232d4b] select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-6 pb-6 border-b border-[#232d4b]">
        <div>
          <span className="text-xs uppercase font-bold text-[#ff5c9a] tracking-wider block mb-1">
            Artist Loyalty vs. Variety
          </span>
          <h4 className="text-2xl sm:text-3xl font-extrabold text-[#f1ebdc] heading-bricolage">
            {archetype}
          </h4>
          <p className="text-sm text-[#98a1ba] body-bricolage mt-0.5">
            {description}
          </p>
        </div>
        <div className="text-xs text-[#98a1ba] bg-[#101626] p-2.5 border border-[#232d4b] tabular-nums">
          {totalArtists.toLocaleString()} total artists on file
        </div>
      </div>

      {/* Diversity Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#101626] p-4 border border-[#232d4b]">
          <span className="text-xs text-[#98a1ba] block mb-1">
            Top 5 artists share
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold heading-bricolage tabular-nums ${
                isLoyalist ? 'text-[#ff5c9a]' : 'text-[#f1ebdc]'
              }`}
            >
              {top5ArtistShare}%
            </span>
            <span className="text-xs text-[#98a1ba]">of your total music time</span>
          </div>
        </div>

        <div className="bg-[#101626] p-4 border border-[#232d4b]">
          <span className="text-xs text-[#98a1ba] block mb-1">
            Variety &amp; discovery score
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold heading-bricolage tabular-nums ${
                isExplorer ? 'text-[#3fd6c6]' : 'text-[#f1ebdc]'
              }`}
            >
              {diversityScore}/100
            </span>
            <span className="text-xs text-[#98a1ba]">exploration level</span>
          </div>
        </div>
      </div>

      {/* Spectrum Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-[#98a1ba] font-mono">
          <span className={isLoyalist ? 'text-[#ff5c9a] font-bold' : ''}>LOYAL TO A FEW FAVORITES</span>
          <span className={isExplorer ? 'text-[#3fd6c6] font-bold' : ''}>LOVES EXPLORING NEW ARTISTS</span>
        </div>
        <div className="w-full h-3 bg-[#101626] overflow-hidden relative">
          <div
            className="h-full bg-linear-to-r from-[#ff5c9a] via-[#f1ebdc] to-[#3fd6c6]"
            style={{ width: '100%' }}
          />
          {/* Indicator Marker */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-[#101626] border-x border-[#f1ebdc]"
            style={{ left: `${diversityScore}%` }}
          />
        </div>
      </div>
    </div>
  );
};
