import React, { useState } from 'react';
import type { DecadeCount } from '../types/lastfm';

interface DecadeDistributionProps {
  decades: DecadeCount[];
  topDecade: DecadeCount;
}

export const DecadeDistribution: React.FC<DecadeDistributionProps> = ({ decades, topDecade }) => {
  const [hoveredDecade, setHoveredDecade] = useState<DecadeCount | null>(null);

  const maxPercentage = Math.max(...decades.map((d) => d.percentage), 1);

  return (
    <div className="w-full bg-[#18203a] p-6 sm:p-8 border border-[#232d4b] select-none">
      {/* Top Banner / Primary Era */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-6 pb-6 border-b border-[#232d4b]">
        <div>
          <span className="text-xs uppercase font-bold text-[#ff5c9a] tracking-wider block mb-1">
            Your #1 Favorite Era
          </span>
          <h4 className="text-2xl sm:text-3xl font-extrabold text-[#f1ebdc] heading-bricolage">
            {topDecade.label} <span className="text-xl sm:text-2xl font-normal text-[#3fd6c6]">({topDecade.percentage}%)</span>
          </h4>
          <p className="text-sm text-[#98a1ba] body-bricolage mt-0.5">
            {topDecade.eraName}
          </p>
        </div>
        <div className="text-xs text-[#98a1ba] bg-[#101626] p-2.5 border border-[#232d4b]">
          Based on your top albums &amp; artists
        </div>
      </div>

      {/* Proportional Decade Bars */}
      <div
        className="space-y-3"
        role="img"
        aria-label={`Decade distribution showing primary era as ${topDecade.label} with ${topDecade.percentage}% of catalog listening.`}
      >
        {decades.map((dec) => {
          const isTop = dec.decade === topDecade.decade;
          const barWidth = Math.max(3, Math.round((dec.percentage / maxPercentage) * 100));
          const isHovered = hoveredDecade?.decade === dec.decade;

          return (
            <div
              key={dec.decade}
              onMouseEnter={() => setHoveredDecade(dec)}
              onMouseLeave={() => setHoveredDecade(null)}
              onFocus={() => setHoveredDecade(dec)}
              onBlur={() => setHoveredDecade(null)}
              tabIndex={0}
              className="group cursor-pointer focus-visible:outline-none"
            >
              <div className="flex items-baseline justify-between text-xs sm:text-sm mb-1 gap-2">
                <div className="flex items-baseline gap-2 truncate">
                  <span
                    className={`font-bold heading-bricolage ${
                      isTop ? 'text-[#ff5c9a]' : 'text-[#f1ebdc]'
                    }`}
                  >
                    {dec.label}
                  </span>
                  <span className="text-[#98a1ba] truncate text-xs">
                    {dec.eraName}
                  </span>
                </div>
                <span className="text-[#98a1ba] font-mono tabular-nums shrink-0 text-xs">
                  {dec.percentage}%
                </span>
              </div>

              {/* Bar */}
              <div className="w-full h-2.5 bg-[#101626] overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isTop
                      ? 'bg-[#ff5c9a]'
                      : isHovered
                      ? 'bg-[#3fd6c6]'
                      : 'bg-[#2b3658] group-hover:bg-[#3fd6c6]'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
