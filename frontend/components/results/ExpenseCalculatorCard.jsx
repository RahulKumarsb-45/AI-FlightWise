'use client';

import { Calculator, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatInr } from '@/utils/format';

function formatRange(range) {
  if (!range) return 'Not enough data';
  if (range.min === range.max) return formatInr(range.min);
  return `${formatInr(range.min)}–${formatInr(range.max)}`;
}

function CategoryRow({ label, entry, isLoading }) {
  const value = isLoading
    ? 'Loading…'
    : entry.amountInr != null
      ? formatInr(entry.amountInr)
      : formatRange(entry.rangeInr);

  return (
    <div className="flex items-center justify-between border-b border-ink-100/80 py-3 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-navy-950">{label}</p>
        {entry.isEstimated && entry.isAvailable && (
          <span className="inline-block mt-0.5 text-[11px] text-ink-500 font-mono">
            Heuristic estimate
          </span>
        )}
        {entry.isEstimated && !entry.isAvailable && (
          <span className="inline-block mt-0.5 text-[11px] text-ink-400 font-mono">
            Not enough data yet
          </span>
        )}
        {!entry.isEstimated && (
          <span className="inline-block mt-0.5 text-[11px] text-electric-600 font-mono font-medium">
            Actual flight data
          </span>
        )}
      </div>
      <p className="font-mono text-sm font-semibold text-navy-950">{value}</p>
    </div>
  );
}

/**
 * User-facing Expense Calculator. Purely presentational: every number it
 * shows comes from `breakdown` (see utils/expenseCalculator.js), which
 * itself only reuses the real selected flight price plus the existing
 * Budget Optimizer / tourist-attraction estimates — nothing is computed or
 * invented in this component.
 */
function ExpenseCalculatorCard({ breakdown, isLoadingAttractions }) {
  if (!breakdown) return null;

  const { categories, totalTripExpenseInr, budgetInr, remainingBudgetInr, overBudgetInr, nights, travelers } = breakdown;

  const statusBadge =
    overBudgetInr != null
      ? { label: 'Over budget', variant: 'danger' }
      : remainingBudgetInr != null
        ? { label: 'Within budget', variant: 'route' }
        : { label: 'No budget set', variant: 'neutral' };

  return (
    <div className="rounded-2xl border border-ink-100/90 bg-white p-6 shadow-soft transition-all duration-200 hover:shadow-premium sm:p-7">
      <div className="flex items-center justify-between gap-2 border-b border-ink-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-electric-100 text-electric-700">
            <Calculator className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-navy-950">Estimated Trip Expenses</h2>
            <p className="text-xs text-ink-400">
              {travelers} traveler{travelers > 1 ? 's' : ''}
              {nights != null ? ` · ${nights} night${nights > 1 ? 's' : ''}` : ''}
            </p>
          </div>
        </div>
        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
      </div>

      <div className="mt-4">
        <CategoryRow label="Flight" entry={categories.flight} />
        <CategoryRow label="Hotel / accommodation" entry={categories.accommodation} />
        <CategoryRow label="Food & Dining" entry={categories.food} />
        <CategoryRow label="Local transport" entry={categories.localTransport} />
        <CategoryRow label="Tourist attractions / activities" entry={categories.attractions} isLoading={isLoadingAttractions} />
        <CategoryRow label="Miscellaneous" entry={categories.miscellaneous} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl border border-ink-100/80 bg-ink-50/70 p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-ink-500">Total estimated expense</p>
          <p className="font-mono text-lg font-bold text-navy-950 mt-1">{formatRange(totalTripExpenseInr)}</p>
        </div>
        {budgetInr != null && (
          <div>
            <p className="text-xs font-medium text-ink-500">Your planned budget</p>
            <p className="font-mono text-lg font-bold text-navy-950 mt-1">{formatInr(budgetInr)}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-ink-500">{overBudgetInr != null ? 'Amount over budget' : 'Remaining budget'}</p>
          <p className={`font-mono text-lg font-bold mt-1 ${overBudgetInr != null ? 'text-danger-600' : 'text-route-600'}`}>
            {overBudgetInr != null
              ? formatInr(overBudgetInr)
              : remainingBudgetInr != null
                ? formatInr(remainingBudgetInr)
                : '—'}
          </p>
        </div>
      </div>

      {!breakdown.hasFullEstimate && (
        <p className="mt-4 flex items-start gap-1.5 text-xs text-ink-400">
          <Info className="mt-0.5 h-3.5 w-3.5 text-ink-400 shrink-0" />
          {nights == null
            ? 'A one-way trip has no return date, so accommodation, food, and local-transport can’t be estimated for it.'
            : 'Some categories don’t have enough data yet to estimate.'}
        </p>
      )}

      <p className="mt-2.5 flex items-start gap-1.5 text-xs text-ink-400">
        <Info className="mt-0.5 h-3.5 w-3.5 text-ink-400 shrink-0" />
        {breakdown.note}
      </p>
    </div>
  );
}

export { ExpenseCalculatorCard };
