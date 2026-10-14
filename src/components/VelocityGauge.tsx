import React from 'react';
import type { VelocityStats } from '../types/lastfm';

interface VelocityGaugeProps {
  velocity: VelocityStats;
}

export const VelocityGauge: React.FC<VelocityGaugeProps> = ({ velocity }) => {
  const { lifetimeDailyAverage, recentDailyVelocity, paceRatio, paceDeltaPercent, status, statusText, plainText } = velocity;

  const clampedDelta = Math.max(-50, Math.min(50, paceDeltaPercent));
  const sliderPercent = ((clampedDelta + 50) / 100) * 100;

  const isAccelerating = status === 'accelerating';
  const isLaidBack = status === 'laidback';

  return (
    <div className="w-full bg-[#18203a] p-6 sm:p-8 border border-[#232d4b] select-none">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-6 pb-6 border-b border-[#232d4b]">
        <div>
          <span className="text-xs uppercase font-bold text-[#3fd6c6] tracking-wider block mb-1">
            Daily Listening Pace
          </span>
          <h4 className="text-2xl sm:text-3xl font-extrabold text-[#f1ebdc] heading-bricolage">
            {statusText}
          </h4>
          <p className="text-sm text-[#98a1ba] body-bricolage mt-0.5">
            {plainText}
          </p>
        </div>
        <div className="text-xs text-[#98a1ba] bg-[#101626] p-2.5 border border-[#232d4b] tabular-nums">
          {paceRatio}x your lifetime average
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#101626] p-4 border border-[#232d4b]">
          <span className="text-xs text-[#98a1ba] block mb-1">
            Recent daily plays
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#3fd6c6] heading-bricolage tabular-nums">
            {recentDailyVelocity}
          </span>
          <span className="text-xs text-[#98a1ba] ml-1.5">songs / day</span>
        </div>

        <div className="bg-[#101626] p-4 border border-[#232d4b]">
          <span className="text-xs text-[#98a1ba] block mb-1">
            Lifetime daily average
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-[#f1ebdc] heading-bricolage tabular-nums">
            {lifetimeDailyAverage}
          </span>
          <span className="text-xs text-[#98a1ba] ml-1.5">songs / day</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-[#101626] p-4 border border-[#232d4b]">
          <span className="text-xs text-[#98a1ba] block mb-1">
            Compared to normal
          </span>
          <span
            className={`text-2xl sm:text-3xl font-bold heading-bricolage tabular-nums ${
              isAccelerating ? 'text-[#ff5c9a]' : isLaidBack ? 'text-[#3fd6c6]' : 'text-[#f1ebdc]'
            }`}
          >
            {paceDeltaPercent > 0 ? `+${paceDeltaPercent}% faster` : paceDeltaPercent < 0 ? `${paceDeltaPercent}% slower` : 'Normal routine'}
          </span>
        </div>
      </div>

      {/* Speed Slider Meter */}
      <div className="bg-[#101626] p-5 border border-[#232d4b]">
        <div className="flex items-center justify-between text-xs text-[#98a1ba] mb-2 font-mono">
          <span>SLOWER THAN USUAL</span>
          <span className="text-[#f1ebdc] font-bold">NORMAL LIFETIME SPEED</span>
          <span>FASTER THAN USUAL</span>
        </div>

        <div className="relative w-full h-8 flex items-center">
          {/* Groove track */}
          <div className="w-full h-2 bg-[#18203a] border border-[#2c3756] relative">
            {/* Center mark */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#98a1ba] -translate-x-1/2" />
          </div>

          {/* Fader slider knob */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300"
            style={{ left: `${sliderPercent}%` }}
          >
            <div className="w-5 h-8 bg-[#f1ebdc] border border-[#101626] shadow flex items-center justify-center">
              <div
                className={`w-1 h-4 ${
                  isAccelerating ? 'bg-[#ff5c9a]' : isLaidBack ? 'bg-[#3fd6c6]' : 'bg-[#18203a]'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
