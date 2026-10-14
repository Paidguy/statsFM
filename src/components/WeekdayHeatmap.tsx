import React, { useState } from 'react';
import type { DayCount } from '../types/lastfm';

interface WeekdayHeatmapProps {
  days: DayCount[];
}

export const WeekdayHeatmap: React.FC<WeekdayHeatmapProps> = ({ days }) => {
  const [activeDay, setActiveDay] = useState<DayCount | null>(null);

  const maxCount = Math.max(...days.map((d) => d.count), 1);
  const totalDatedPlays = days.reduce((acc, d) => acc + d.count, 0);

  // Peak day
  let peakDay = days[0];
  days.forEach((d) => {
    if (d.count > (peakDay?.count || 0)) {
      peakDay = d;
    }
  });

  const ariaDescription = `7-day weekday listening breakdown based on the last ${totalDatedPlays} plays. Peak day is ${peakDay.fullName} with ${peakDay.count} plays. Weekday listening displayed in aqua, weekend listening in pink.`;

  const chartHeight = 160;
  const chartWidth = 320;
  const barWidth = 32;
  const gap = (chartWidth - barWidth * 7) / 6;

  return (
    <div className="w-full bg-[#18203a] p-6 sm:p-8 border border-[#232d4b]">
      {/* Legend & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#3fd6c6] inline-block" aria-hidden="true" />
            <span className="text-[#98a1ba]">Mon – Fri</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#ff5c9a] inline-block" aria-hidden="true" />
            <span className="text-[#98a1ba]">Sat – Sun</span>
          </div>
        </div>
        <div className="text-xs text-[#98a1ba]">
          {activeDay ? (
            <span className="text-[#f1ebdc] font-semibold">
              {activeDay.fullName}: {activeDay.count} plays
            </span>
          ) : (
            <span>Peak day: {peakDay.fullName}</span>
          )}
        </div>
      </div>

      {/* SVG 7-bar chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`}
          className="w-full h-auto min-w-[280px] overflow-visible"
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

          {days.map((item) => {
            const barHeight = Math.max(4, (item.count / maxCount) * (chartHeight - 20));
            const x = item.dayIndex * (barWidth + gap);
            const y = chartHeight - barHeight;
            const fill = item.isWeekend ? '#ff5c9a' : '#3fd6c6';
            const isHovered = activeDay?.dayIndex === item.dayIndex;

            return (
              <g
                key={item.dayName}
                onMouseEnter={() => setActiveDay(item)}
                onMouseLeave={() => setActiveDay(null)}
                onFocus={() => setActiveDay(item)}
                onBlur={() => setActiveDay(null)}
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

                {/* Day label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fill="#98a1ba"
                  fontSize="12"
                  fontWeight={item.isWeekend ? 'bold' : 'normal'}
                  fontFamily="Bricolage Grotesque, sans-serif"
                >
                  {item.dayName}
                </text>

                {/* Play count on hover */}
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
