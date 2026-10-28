import React, { useState } from 'react';
import type { TasteRatingsSummary, SonicPersona, TasteRatingItem } from '../types/lastfm';

interface TasteRatingsProps {
  ratings: TasteRatingsSummary;
  persona: SonicPersona;
  username: string;
}

export const TasteRatings: React.FC<TasteRatingsProps> = ({ ratings, persona, username }) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'spectrum'>('cards');
  const [showExplainer, setShowExplainer] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const items: TasteRatingItem[] = [
    ratings.rarity,
    ratings.loyalty,
    ratings.looping,
    ratings.clock,
    ratings.era,
    ratings.appetite,
  ];

  const toggleCard = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  return (
    <section className="w-full bg-[#18203a] p-6 sm:p-8 border border-[#232d4b] select-none space-y-8">
      {/* Top Banner: Musical Persona & Overall Grade */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-[#232d4b]">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase font-extrabold text-[#ff5c9a] tracking-widest">
              YOUR MUSIC TASTE RATING
            </span>
            <span className="text-xs text-[#98a1ba] font-mono">
              • {persona.badgeCode}
            </span>
          </div>

          <h3 className="text-3xl sm:text-4xl font-extrabold text-[#f1ebdc] heading-bricolage">
            {persona.archetype}
          </h3>

          <p className="text-base text-[#3fd6c6] font-semibold body-bricolage">
            &ldquo;{persona.tagline}&rdquo;
          </p>

          <p className="text-sm text-[#98a1ba] body-bricolage max-w-2xl leading-relaxed">
            {persona.description}
          </p>
        </div>

        {/* Overall Score Badge */}
        <div className="bg-[#101626] p-5 border border-[#232d4b] flex items-center gap-5 shrink-0">
          <div className="text-center pr-5 border-r border-[#232d4b]">
            <span className="text-[10px] uppercase font-bold text-[#98a1ba] tracking-wider block mb-1">
              OVERALL GRADE
            </span>
            <span className="text-4xl font-black text-[#ff5c9a] heading-bricolage">
              {ratings.overallScore >= 80 ? 'A+' : ratings.overallScore >= 70 ? 'A' : 'B+'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#98a1ba] tracking-wider block mb-0.5">
              MUSIC TASTE INDEX
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#3fd6c6] heading-bricolage tabular-nums">
                {ratings.overallScore}
              </span>
              <span className="text-sm text-[#98a1ba]">/ 100</span>
            </div>
            <span className="text-xs text-[#f1ebdc] font-semibold block mt-0.5">
              {ratings.overallGrade}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: View Switcher and Explainer Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2" role="tablist" aria-label="Rating view modes">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'cards'}
            onClick={() => setActiveTab('cards')}
            className={`min-touch-target px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
              activeTab === 'cards'
                ? 'bg-[#3fd6c6] text-[#101626] border-[#3fd6c6]'
                : 'bg-[#101626] text-[#98a1ba] border-[#232d4b] hover:text-[#f1ebdc]'
            }`}
          >
            Detailed Scorecard (6 Ratings)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'spectrum'}
            onClick={() => setActiveTab('spectrum')}
            className={`min-touch-target px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
              activeTab === 'spectrum'
                ? 'bg-[#3fd6c6] text-[#101626] border-[#3fd6c6]'
                : 'bg-[#101626] text-[#98a1ba] border-[#232d4b] hover:text-[#f1ebdc]'
            }`}
          >
            Spectrum Comparison
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowExplainer(!showExplainer)}
          aria-expanded={showExplainer}
          aria-controls="ratings-explainer-panel"
          className="text-xs text-[#98a1ba] hover:text-[#3fd6c6] transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3fd6c6] py-1.5 min-touch-target"
        >
          <span className="w-4 h-4 rounded-full border border-[#98a1ba] flex items-center justify-center text-[10px] font-bold" aria-hidden="true">
            ?
          </span>
          <span>{showExplainer ? 'Hide explanation' : 'How are ratings calculated?'}</span>
        </button>
      </div>

      {/* Plain Language Explainer Box */}
      {showExplainer && (
        <div id="ratings-explainer-panel" className="bg-[#101626] p-5 border border-[#3fd6c6]/40 text-xs sm:text-sm text-[#98a1ba] space-y-3 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-[#f1ebdc]">
            <span className="text-[#3fd6c6]">✦</span>
            <span>Simple, Honest Music Metrics</span>
          </div>
          <p>
            Every rating is computed directly from your Last.fm scrobble history and global artist metadata for the selected time period:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#f1ebdc] pt-1">
            <li className="flex items-start gap-2 bg-[#18203a] p-2.5 border border-[#232d4b]">
              <span className="text-[#ff5c9a] font-bold">1. Rarity:</span>
              <span>Weighted from the real Last.fm global listener counts of your top artists (from millions of listeners down to niche indie acts).</span>
            </li>
            <li className="flex items-start gap-2 bg-[#18203a] p-2.5 border border-[#232d4b]">
              <span className="text-[#3fd6c6] font-bold">2. Loyalty &amp; Variety:</span>
              <span>Measures the exact share of your period plays spent on your top 5 artists versus total unique artists played.</span>
            </li>
            <li className="flex items-start gap-2 bg-[#18203a] p-2.5 border border-[#232d4b]">
              <span className="text-[#ff5c9a] font-bold">3. Song Looping:</span>
              <span>Combines your #1 song’s replay count, top-track concentration, and library-wide plays per unique track.</span>
            </li>
            <li className="flex items-start gap-2 bg-[#18203a] p-2.5 border border-[#232d4b]">
              <span className="text-[#3fd6c6] font-bold">4. Day vs. Night:</span>
              <span>Analyzes up to 400 recent scrobbles in your local timezone to map daytime (6am–9pm) vs. late-night (10pm–5am) habits.</span>
            </li>
            <li className="flex items-start gap-2 bg-[#18203a] p-2.5 border border-[#232d4b]">
              <span className="text-[#ff5c9a] font-bold">5. Favorite Era:</span>
              <span>Matches your top artists and albums against Last.fm artist biographies, decade tags, and album release years.</span>
            </li>
            <li className="flex items-start gap-2 bg-[#18203a] p-2.5 border border-[#232d4b]">
              <span className="text-[#3fd6c6] font-bold">6. Listening Appetite:</span>
              <span>Compares your daily plays in the selected period against your all-time daily average since joining Last.fm.</span>
            </li>
          </ul>
        </div>
      )}

      {/* VIEW 1: DETAILED 6-CARD SCORECARD */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, idx) => {
            const isPink = idx % 2 === 0;
            const isExpanded = expandedCardId === item.id;
            const spectrumPos = item.spectrumPosition ?? item.score;

            return (
              <div
                key={item.id}
                className="bg-[#101626] p-5 border border-[#232d4b] flex flex-col justify-between gap-4 group hover:border-[#3fd6c6] transition-colors"
              >
                {/* Header & Letter Grade Badge */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-[#98a1ba] tracking-wider block">
                        {item.title}
                      </span>
                      <h4 className="text-xl font-bold text-[#f1ebdc] heading-bricolage mt-0.5">
                        {item.grade}
                      </h4>
                    </div>
                    {/* Letter Grade Badge */}
                    <div
                      className={`w-9 h-9 flex items-center justify-center font-black text-sm heading-bricolage shrink-0 ${
                        isPink ? 'bg-[#ff5c9a] text-[#101626]' : 'bg-[#3fd6c6] text-[#101626]'
                      }`}
                    >
                      {item.letterGrade}
                    </div>
                  </div>

                  {/* Plain English Tagline */}
                  <p className="text-xs text-[#3fd6c6] font-medium body-bricolage">
                    {item.tagline}
                  </p>

                  {/* Simple Explanation */}
                  <p className="text-xs text-[#98a1ba] leading-relaxed body-bricolage">
                    {item.plainMeaning}
                  </p>
                </div>

                {/* Score Bar & Spectrum */}
                <div className="space-y-2 pt-2 border-t border-[#18203a]">
                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="text-[#98a1ba]">Score rating</span>
                    <span className="font-mono font-bold text-[#f1ebdc] tabular-nums">
                      {item.score} / 100
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="w-full h-2 bg-[#18203a] overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isPink ? 'bg-[#ff5c9a]' : 'bg-[#3fd6c6]'
                      }`}
                      style={{ width: `${Math.max(8, spectrumPos)}%` }}
                    />
                  </div>

                  {/* Labels on both ends */}
                  <div className="flex justify-between text-[10px] text-[#98a1ba] font-mono pt-0.5">
                    <span className="truncate max-w-[48%]">{item.leftLabel}</span>
                    <span className="truncate max-w-[48%] text-right">{item.rightLabel}</span>
                  </div>
                </div>

                {/* Stat Highlight & Why This Score Button */}
                <div className="pt-2 border-t border-[#18203a] space-y-2">
                  <div className="bg-[#18203a] p-2 text-xs font-semibold text-[#f1ebdc] flex items-center justify-between">
                    <span className="text-[10px] text-[#98a1ba] uppercase">Fact:</span>
                    <span className="truncate ml-2 text-right">{item.highlight}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCard(item.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`rating-reason-${item.id}`}
                    className="w-full text-left text-[11px] text-[#98a1ba] hover:text-[#3fd6c6] transition-colors cursor-pointer flex items-center justify-between pt-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3fd6c6]"
                  >
                    <span>Why this score?</span>
                    <span aria-hidden="true">{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {isExpanded && (
                    <div id={`rating-reason-${item.id}`} className="p-2.5 bg-[#18203a] text-[11px] text-[#98a1ba] leading-relaxed border-l-2 border-[#3fd6c6]">
                      {item.whyThisRating}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: SPECTRUM COMPARISON */}
      {activeTab === 'spectrum' && (
        <div className="bg-[#101626] p-6 border border-[#232d4b] space-y-6">
          <div className="border-b border-[#232d4b] pb-3">
            <h4 className="text-lg font-bold text-[#f1ebdc] heading-bricolage">
              Your Taste Across 6 Key Spectrums
            </h4>
            <p className="text-xs text-[#98a1ba] mt-1">
              See where your music taste sits between opposite ends of listening habits.
            </p>
          </div>

          <div className="space-y-6">
            {items.map((item, idx) => {
              const isPink = idx % 2 === 0;
              const spectrumPos = item.spectrumPosition ?? item.score;

              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#f1ebdc] uppercase tracking-wider">
                        {item.title}
                      </span>
                      <span className="text-xs text-[#3fd6c6] font-semibold">
                        • {item.grade}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#98a1ba] tabular-nums">
                      {item.highlight}
                    </span>
                  </div>

                  {/* Visual Spectrum Slider */}
                  <div className="space-y-1">
                    <div className="w-full h-3 bg-[#18203a] border border-[#232d4b] relative overflow-hidden">
                      <div
                        className={`h-full ${
                          isPink
                            ? 'bg-gradient-to-r from-[#232d4b] to-[#ff5c9a]'
                            : 'bg-gradient-to-r from-[#232d4b] to-[#3fd6c6]'
                        }`}
                        style={{ width: `${Math.max(6, spectrumPos)}%` }}
                      />
                      {/* Indicator pip */}
                      <div
                        className="absolute top-0 bottom-0 w-1.5 bg-[#f1ebdc] -translate-x-1/2 shadow"
                        style={{ left: `${spectrumPos}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-[#98a1ba]">
                      <span>← {item.leftLabel}</span>
                      <span>{item.rightLabel} →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
