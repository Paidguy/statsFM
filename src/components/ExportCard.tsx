import React from 'react';
import type { UserStatsPayload } from '../types/lastfm';

interface ExportCardProps {
  data: UserStatsPayload;
  periodLabel: string;
  format: 'story' | 'square';
}

export const ExportCard = React.forwardRef<HTMLDivElement, ExportCardProps>(
  ({ data, periodLabel, format }, ref) => {
    const { user, artists, tracks, stats } = data;
    const topArtist = artists[0] || { name: 'Unknown artist', playcount: '0' };
    const topTracks = tracks.slice(0, 3);

    const formatPeak = (h: number) => {
      if (h === 0) return '12am';
      if (h === 12) return '12pm';
      if (h > 12) return `${h - 12}pm`;
      return `${h}am`;
    };

    const isStory = format === 'story';

    return (
      <div
        ref={ref}
        className={`bg-[#101626] text-[#f1ebdc] flex flex-col justify-between p-8 sm:p-12 relative overflow-hidden select-none border-4 border-[#18203a] ${
          isStory ? 'w-[540px] h-[960px]' : 'w-[720px] h-[720px]'
        }`}
        style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
        }}
      >
        {/* Registration marks */}
        <div className="absolute top-3 left-3 text-[10px] text-[#ff5c9a] font-mono pointer-events-none">
          + REG.01
        </div>
        <div className="absolute top-3 right-3 text-[10px] text-[#3fd6c6] font-mono pointer-events-none">
          + REG.02
        </div>
        <div className="absolute bottom-3 left-3 text-[10px] text-[#3fd6c6] font-mono pointer-events-none">
          + REG.03
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] text-[#ff5c9a] font-mono pointer-events-none">
          + REG.04
        </div>

        {/* Risograph dual-ink background screen blend */}
        <div className="absolute top-1/4 right-0 w-96 h-96 pointer-events-none select-none opacity-30">
          <div className="absolute top-0 right-10 w-72 h-72 rounded-full bg-[#ff5c9a] risograph-blend" />
          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[#3fd6c6] risograph-blend" />
        </div>

        {/* Top Masthead */}
        <div className="relative z-10 flex items-center justify-between border-b-2 border-[#f1ebdc] pb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 flex items-center">
              <div className="absolute left-0 w-5 h-5 rounded-full bg-[#ff5c9a] risograph-blend" />
              <div className="absolute left-2.5 w-5 h-5 rounded-full bg-[#3fd6c6] risograph-blend" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#f1ebdc] heading-bricolage">
              statsFM
            </span>
          </div>
          <div className="text-xs font-bold text-[#3fd6c6] tracking-widest uppercase">
            {periodLabel}
          </div>
        </div>

        {/* Hero Subject Title & Sonic Persona Badge */}
        <div className="relative z-10 my-auto flex flex-col gap-5">
          <div>
            <div className="inline-block px-2.5 py-0.5 bg-[#18203a] border border-[#ff5c9a] text-[10px] font-bold uppercase tracking-wider text-[#ff5c9a] mb-2">
              MUSIC PERSONALITY: {stats.sonicPersona.archetype.toUpperCase()}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-[#f1ebdc] uppercase tracking-tight heading-bricolage">
              {user.name}
            </h2>
            <p className="text-xs text-[#98a1ba] italic mt-0.5">
              &ldquo;{stats.sonicPersona.tagline}&rdquo;
            </p>
          </div>

          {/* 4-Stat Clear Grid */}
          <div className="grid grid-cols-2 gap-3 bg-[#18203a] p-5 border border-[#232d4b]">
            <div className="border-b border-[#232d4b] pb-3">
              <span className="text-[11px] text-[#98a1ba] block uppercase tracking-wider">
                Total songs played
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#f1ebdc] heading-bricolage tabular-nums">
                {stats.totalPlays.toLocaleString()}
              </span>
            </div>
            <div className="border-b border-[#232d4b] pb-3">
              <span className="text-[11px] text-[#98a1ba] block uppercase tracking-wider">
                Days of music
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#3fd6c6] heading-bricolage tabular-nums">
                ~{stats.daysOfMusic} days
              </span>
            </div>
            <div className="pt-1">
              <span className="text-[11px] text-[#98a1ba] block uppercase tracking-wider">
                Taste Rarity
              </span>
              <span className="text-lg font-bold text-[#3fd6c6] heading-bricolage block">
                {stats.tasteRatings.rarity.score}/100
              </span>
              <span className="text-[10px] text-[#98a1ba] truncate block">
                {stats.tasteRatings.rarity.grade}
              </span>
            </div>
            <div className="pt-1">
              <span className="text-[11px] text-[#98a1ba] block uppercase tracking-wider">
                Peak listening time
              </span>
              <span className="text-lg font-bold text-[#ff5c9a] heading-bricolage block">
                {formatPeak(stats.peakHour)} · {stats.peakDayName.slice(0, 3)}
              </span>
              <span className="text-[10px] text-[#98a1ba]">
                {stats.tasteRatings.clock.grade}
              </span>
            </div>
          </div>

          {/* Top Artist & Replay */}
          <div className="bg-[#18203a] p-4 border border-[#232d4b] space-y-2">
            <div className="flex justify-between items-baseline border-b border-[#232d4b] pb-2">
              <div>
                <span className="text-[10px] text-[#98a1ba] uppercase block">#1 FAVORITE ARTIST</span>
                <span className="text-base font-extrabold text-[#ff5c9a] heading-bricolage">{topArtist.name}</span>
              </div>
              <span className="text-xs text-[#98a1ba] font-mono tabular-nums">{stats.topArtistShareOfTopTen}% of top 10</span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-[10px] text-[#98a1ba] uppercase block">MOST REPLAYED SONG</span>
                <span className="text-xs font-semibold text-[#f1ebdc] truncate max-w-[240px] block">
                  {stats.repeatObsession.mostRepeatedTrack.name}
                </span>
              </div>
              <span className="text-xs text-[#3fd6c6] font-mono tabular-nums">
                {stats.repeatObsession.mostRepeatedTrack.playcount} plays
              </span>
            </div>
          </div>

          {/* Era & Pacing Strip */}
          <div className="flex items-center justify-between bg-[#101626] border border-[#232d4b] px-4 py-2 text-xs">
            <div>
              <span className="text-[10px] text-[#98a1ba] block">FAVORITE ERA</span>
              <span className="font-bold text-[#f1ebdc]">{stats.topDecade.label} ({stats.topDecade.percentage}%)</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#98a1ba] block">SPEED</span>
              <span className="font-bold text-[#3fd6c6]">{stats.velocity.statusText}</span>
            </div>
          </div>
        </div>

        {/* Footer with ticket bar */}
        <div className="relative z-10 border-t-2 border-[#f1ebdc] pt-3 flex items-center justify-between text-[10px] text-[#98a1ba]">
          <div>
            <span className="font-bold text-[#f1ebdc] block uppercase">NEEDLEDROP.APP</span>
            <span>PUBLIC LAST.FM MUSIC RECAP</span>
          </div>
          {/* Barcode stamp */}
          <div className="flex items-center gap-0.5 h-5 bg-[#f1ebdc] px-1 py-0.5">
            <div className="w-1 h-full bg-[#101626]" />
            <div className="w-0.5 h-full bg-[#101626]" />
            <div className="w-1.5 h-full bg-[#101626]" />
            <div className="w-0.5 h-full bg-[#101626]" />
            <div className="w-2 h-full bg-[#101626]" />
            <div className="w-1 h-full bg-[#101626]" />
            <div className="w-2 h-full bg-[#101626]" />
          </div>
        </div>
      </div>
    );
  }
);

ExportCard.displayName = 'ExportCard';
