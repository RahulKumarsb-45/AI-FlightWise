'use client';

import { Wallet, Info, TrendingUp, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatInr } from '@/utils/format';

const STATUS_META = {
  comfortable: { label: 'Comfortable', variant: 'route' },
  tight: { label: 'Tight', variant: 'amber' },
  over: { label: 'Over budget', variant: 'danger' },
  unknown: { label: 'Estimate unavailable', variant: 'neutral' },
};

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-ink-50/60 border border-ink-100/60 p-3.5">
      <p className="text-xs font-medium text-ink-400">{label}</p>
      <p className="font-mono text-base font-bold text-navy-950 mt-1">{value}</p>
    </div>
  );
}

function formatRange(range) {
  if (!range) return '—';
  if (range.min === range.max) return formatInr(range.min);
  return `${formatInr(range.min)}–${formatInr(range.max)}`;
}

function BudgetInsightCard({ insight, suggestion, attractionsEstimate, isLoadingAttractions }) {
  if (!insight && !suggestion) return null;

  const statusMeta = insight ? STATUS_META[insight.status] || STATUS_META.unknown : null;
  const categories = insight?.categoryBreakdown;

  const estimatedTotalWithAttractions =
    insight?.estimatedTotalTripCostInr && attractionsEstimate
      ? {
          min: insight.estimatedTotalTripCostInr.min + attractionsEstimate.min,
          max: insight.estimatedTotalTripCostInr.max + attractionsEstimate.max,
        }
      : insight?.estimatedTotalTripCostInr;

  return (
    <div className="rounded-2xl border border-ink-100/90 bg-white p-6 shadow-soft transition-all duration-200 hover:shadow-premium sm:p-7">
      <div className="flex items-center justify-between gap-2 border-b border-ink-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-electric-100 text-electric-700">
            <Wallet className="h-4 w-4" />
          </span>
          <h2 className="font-display text-lg font-bold text-navy-950">Budget Optimization & Living Costs</h2>
        </div>
        {statusMeta && <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>}
      </div>

      {insight && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total budget" value={formatInr(insight.budgetInr)} />
            <Stat label="Flight" value={formatInr(insight.flightCostInr)} />
            <Stat label="Est. accommodation" value={categories ? formatRange(categories.accommodation) : '—'} />
            <Stat label="Est. food" value={categories ? formatRange(categories.food) : '—'} />
            <Stat label="Est. local travel" value={categories ? formatRange(categories.localTransport) : '—'} />
            {isLoadingAttractions && <Stat label="Est. attractions" value="Loading…" />}
            {!isLoadingAttractions && attractionsEstimate && (
              <Stat label="Est. attractions" value={formatRange(attractionsEstimate)} />
            )}
            <Stat
              label="Est. total trip cost"
              value={estimatedTotalWithAttractions ? formatRange(estimatedTotalWithAttractions) : '—'}
            />
            <Stat
              label={insight.remainingAfterFlightInr < 0 ? 'Over budget by' : 'Remaining budget'}
              value={formatInr(Math.abs(insight.remainingAfterFlightInr))}
            />
          </div>

          {insight.nights != null && (
            <p className="mt-3.5 text-xs text-ink-400">
              Estimates cover {insight.nights} night{insight.nights > 1 ? 's' : ''}
              {attractionsEstimate
                ? `, including ~${attractionsEstimate.basedOnCount} nearby attraction${
                    attractionsEstimate.basedOnCount > 1 ? 's' : ''
                  } with known price levels`
                : ''}
              .
            </p>
          )}

          {insight.fitSummary && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-electric-100 bg-gradient-to-r from-electric-50/80 via-white to-violet-50/80 p-3.5 text-sm text-electric-950">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-electric-600" />
              <span>
                <span className="font-semibold text-electric-700">Smart recommendation: </span>
                {insight.fitSummary}
              </span>
            </div>
          )}
        </>
      )}

      {suggestion && (
        <div className="mt-3.5 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 text-sm text-amber-900">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>{suggestion.message}</span>
        </div>
      )}

      {insight?.note && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-ink-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
          {insight.note}
        </p>
      )}
    </div>
  );
}

export { BudgetInsightCard };
