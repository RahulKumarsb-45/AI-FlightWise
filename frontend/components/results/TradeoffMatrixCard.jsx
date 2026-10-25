'use client';

import { useState } from 'react';
import { DollarSign, Clock, GitCompare, CheckCircle2, AlertCircle, Sparkles, Plane, Info } from 'lucide-react';
import { formatInr, formatDuration } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { trackTradeoffCompared } from '@/lib/analytics';

export function TradeoffMatrixCard({ matrix, categories = {}, recommendations = [] }) {
  const [activeTab, setActiveTab] = useState('all');

  const cheapest = categories.cheapest || recommendations[0];
  const fastest = categories.fastest || recommendations[0];
  const balanced = categories.balanced || recommendations[0];

  if (!cheapest && !fastest && !balanced) {
    return null;
  }

  const options = matrix?.options?.length
    ? matrix.options
    : [
        cheapest && {
          category: 'cheapest',
          title: 'Cheapest Option',
          badge: 'Maximum Savings',
          priceInr: cheapest.totalPriceInr,
          durationMinutes: cheapest.totalDurationMinutes,
          stops: cheapest.totalStops,
          whySelected: 'Lowest out-of-pocket flight price.',
          bestSuitedFor: 'Budget-first travelers and students.',
          primaryAirport: (cheapest.originAirport?.isPrimary ?? true) && (cheapest.destinationAirports?.every(a => a.isPrimary ?? true) ?? true),
          tradeoffHighlight: fastest && cheapest !== fastest
            ? `Saves ${formatInr(fastest.totalPriceInr - cheapest.totalPriceInr)} vs fastest, but adds ${formatDuration(cheapest.totalDurationMinutes - fastest.totalDurationMinutes)}.`
            : 'Lowest fare available.',
        },
        fastest && fastest !== cheapest && {
          category: 'fastest',
          title: 'Fastest Route',
          badge: 'Shortest Transit',
          priceInr: fastest.totalPriceInr,
          durationMinutes: fastest.totalDurationMinutes,
          stops: fastest.totalStops,
          whySelected: 'Minimal travel time and direct/fast connections.',
          bestSuitedFor: 'Business travelers and families.',
          primaryAirport: (fastest.originAirport?.isPrimary ?? true) && (fastest.destinationAirports?.every(a => a.isPrimary ?? true) ?? true),
          tradeoffHighlight: `Saves ${formatDuration(cheapest.totalDurationMinutes - fastest.totalDurationMinutes)} vs cheapest for ${formatInr(fastest.totalPriceInr - cheapest.totalPriceInr)} more.`,
        },
        balanced && balanced !== cheapest && balanced !== fastest && {
          category: 'balanced',
          title: 'Best Balanced Option',
          badge: 'Optimal Balance',
          priceInr: balanced.totalPriceInr,
          durationMinutes: balanced.totalDurationMinutes,
          stops: balanced.totalStops,
          whySelected: 'The smart sweet spot between price and travel time.',
          bestSuitedFor: 'Most travelers seeking great value without extreme layovers.',
          primaryAirport: (balanced.originAirport?.isPrimary ?? true) && (balanced.destinationAirports?.every(a => a.isPrimary ?? true) ?? true),
          tradeoffHighlight: 'The recommended middle ground with optimal composite score.',
        },
      ].filter(Boolean);

  function handleInteraction(optionCategory) {
    trackTradeoffCompared({
      category: optionCategory,
      total_options_compared: options.length,
    });
  }

  return (
    <section
      aria-labelledby="decision-intelligence-title"
      className="rounded-2xl border border-electric-200/80 bg-gradient-to-br from-white via-electric-50/20 to-violet-50/20 p-6 shadow-soft sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-electric-100 text-electric-700">
              <GitCompare className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 id="decision-intelligence-title" className="font-display text-lg font-bold text-navy-950 sm:text-xl">
              Flight Decision Intelligence & Trade-offs
            </h2>
          </div>
          <p className="mt-1 text-xs text-ink-500 sm:text-sm">
            Side-by-side trade-offs between price, total transit time, layovers, and airport convenience.
          </p>
        </div>

        {matrix?.summary && (
          <div className="rounded-full bg-electric-50 px-3.5 py-1 text-xs font-semibold text-electric-800 border border-electric-200/70">
            {matrix.summary}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {options.map((opt) => {
          const isCheapest = opt.category === 'cheapest';
          const isFastest = opt.category === 'fastest';
          const isBalanced = opt.category === 'balanced';

          return (
            <div
              key={opt.category}
              onClick={() => handleInteraction(opt.category)}
              className={cn(
                'flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 hover:shadow-card cursor-pointer',
                isBalanced
                  ? 'border-electric-400 bg-white ring-2 ring-electric-400/25 shadow-soft'
                  : 'border-ink-100/90 bg-white/95 hover:border-ink-200'
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={isBalanced ? 'electric' : isCheapest ? 'emerald' : 'sky'}>
                    {opt.badge}
                  </Badge>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-ink-400">
                    {opt.category}
                  </span>
                </div>

                <h3 className="mt-3.5 font-display text-lg font-bold text-navy-950">
                  {opt.title}
                </h3>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold text-navy-950">
                    {formatInr(opt.priceInr)}
                  </span>
                  <span className="text-xs text-ink-400">total</span>
                </div>

                <div className="mt-3.5 space-y-2 border-t border-ink-100 pt-3 text-xs text-ink-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-ink-500">
                      <Clock className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" /> Travel time:
                    </span>
                    <span className="font-semibold text-navy-950">{formatDuration(opt.durationMinutes)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-ink-500">
                      <Plane className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" /> Layovers:
                    </span>
                    <span className="font-semibold text-navy-950">
                      {opt.stops === 0 ? 'Direct (0 stops)' : `${opt.stops} stop${opt.stops > 1 ? 's' : ''}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-ink-500">
                      <Info className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" /> Airport:
                    </span>
                    <span className="font-semibold text-navy-950">
                      {opt.primaryAirport ? 'Primary hub' : 'Regional / Nearby'}
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 rounded-lg bg-ink-50/80 p-3 text-xs text-ink-700 border border-ink-100/60">
                  <p className="font-semibold text-navy-900">Why this option:</p>
                  <p className="mt-0.5 leading-relaxed text-ink-600">{opt.whySelected}</p>
                </div>

                <div className="mt-2.5 text-xs text-ink-500">
                  <span className="font-semibold text-navy-900">Best for: </span>
                  {opt.bestSuitedFor}
                </div>
              </div>

              <div className="mt-4 border-t border-ink-100 pt-3 text-[11px] font-semibold text-electric-700">
                {opt.tradeoffHighlight}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
