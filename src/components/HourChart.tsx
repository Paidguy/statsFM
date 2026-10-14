import React, { useState } from 'react';
import type { HourCount } from '../types/lastfm';

interface HourChartProps {
  hours: HourCount[];
}

export const HourChart: React.FC<HourChartProps> = ({ hours }) => {
  const [activeHour, setActiveHour] = useState<HourCount | null>(null);

  const maxCount = Math.max(...hours.map((h) => h.count), 1);
  const totalDatedPlays = hours.reduce((acc, h) => acc + h.count, 0);

  // Night hours (10pm to 5am): 22, 23, 0, 1, 2, 3, 4, 5
  const nightColor = '#ff5c9a';
  const dayColor = '#3fd6c6';

  const chartHeight = 160;
  const chartWidth = 560;
  const barWidth = 16;
  const gap = (chartWidth - barWidth * 24) / 23;

  const formatHourLabel = (h: number): string => {
    if (h === 0) return '12am';
    if (h === 12) return '12pm';
    if (h > 12) return `${h - 12}pm`;
    return `${h}am`;
  };

  // Find peak hour description for aria-label
  let peakHour = hours[0];
  hours.forEach((h) => {
    if (h.count > (peakHour?.count || 0)) {
      peakHour = h;
    }
  });

  const ariaDescription = `Listening by hour histogram based on the last ${totalDatedPlays} plays. Peak listening occurs at ${formatHourLabel(peakHour.hour)} with ${peakHour.count} plays. Night hours (10pm to 5am) highlighted in pink; daytime hours in aqua.`;

  return (
    <div className="w-full bg-[#18203a] p-6 sm:p-8 border border-[#232d4b]">
      {/* Legend & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#ff5c9a] inline-block" aria-hidden="true" />
            <span className="text-[#98a1ba]">10pm – 5am</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#3fd6c6] inline-block" aria-hidden="true" />
            <span className="text-[#98a1ba]">6am – 9pm</span>
          </div>
        </div>
        <div className="text-xs text-[#98a1ba]">
          {activeHour ? (
            <span className="text-[#f1ebdc] font-semibold">
              {formatHourLabel(activeHour.hour)}: {activeHour.count} plays
            </span>
          ) : (
            <span>From last {totalDatedPlays} plays</span>
          )}
        </div>
      </div>

      {/* SVG 24-bar chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`}
          className="w-full h-auto min-w-[480px] overflow-visible"
          role="img"
          aria-label={ariaDescription}
        >
          {/* Baseline */}
          <line
            x1="0"
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke="#2b3658"
            strokeWidth="1"
          />

          {hours.map((item) => {
            const barHeight = Math.max(3, (item.count / maxCount) * (chartHeight - 20));
            const x = item.hour * (barWidth + gap);
            const y = chartHeight - barHeight;
            const isNight = item.hour >= 22 || item.hour <= 5;
            const fill = isNight ? nightColor : dayColor;
            const isHovered = activeHour?.hour === item.hour;

            return (
              <g
                key={item.hour}
                onMouseEnter={() => setActiveHour(item)}
                onMouseLeave={() => setActiveHour(null)}
                onFocus={() => setActiveHour(item)}
                onBlur={() => setActiveHour(null)}
                tabIndex={0}
                className="cursor-pointer focus-visible:outline-none"
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={fill}
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-all duration-150"
                />

                {/* Hour label below for specific intervals */}
                {(item.hour === 0 || item.hour === 6 || item.hour === 12 || item.hour === 18 || item.hour === 23) && (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    fill="#98a1ba"
                    fontSize="11"
                    fontFamily="Bricolage Grotesque, sans-serif"
                  >
                    {formatHourLabel(item.hour)}
                  </text>
                )}

                {/* Play count on hover above bar */}
                {isHovered && (
                  <text
                    x={x + barWidth / 2}
                    y={Math.max(12, y - 6)}
                    textAnchor="middle"
                    fill="#f1ebdc"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="Bricolage Grotesque, sans-serif"
                  >
                    {item.count}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
