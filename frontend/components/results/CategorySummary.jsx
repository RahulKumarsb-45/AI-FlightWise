import { IndianRupee, Zap, Scale } from 'lucide-react';
import { formatInr, formatDuration } from '@/utils/format';
import { cn } from '@/lib/utils';

const CATEGORY_META = {
  cheapest: {
    icon: IndianRupee,
    label: 'Cheapest',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    card: 'border-emerald-200/80 hover:border-emerald-300',
  },
  fastest: {
    icon: Zap,
    label: 'Fastest',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    card: 'border-amber-200/80 hover:border-amber-300',
  },
  balanced: {
    icon: Scale,
    label: 'Best Balanced',
    badge: 'bg-gradient-to-r from-electric-50 to-violet-50 text-electric-700 border-electric-200',
    card: 'border-electric-300 ring-1 ring-electric-400/20 shadow-soft',
  },
};

function CategorySummary({ categories }) {
  const entries = Object.entries(categories).filter(([, v]) => v);
  if (entries.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {entries.map(([key, cat]) => {
        const meta = CATEGORY_META[key] || CATEGORY_META.balanced;
        const Icon = meta.icon;
        return (
          <div
            key={key}
            className={cn(
              'flex flex-col justify-between rounded-xl border bg-white p-5 shadow-soft transition-all duration-200 hover:shadow-card',
              meta.card
            )}
          >
            <div>
              <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', meta.badge)}>
                <Icon className="h-3.5 w-3.5" /> {meta.label}
              </span>
              <p className="mt-3 font-mono text-2xl font-bold text-navy-950">{formatInr(cat.totalPriceInr)}</p>
              <p className="text-xs text-ink-400 mt-0.5">{formatDuration(cat.totalDurationMinutes)} total travel time</p>
            </div>
            {cat.explanation && (
              <p className="mt-3 border-t border-ink-100 pt-2.5 text-xs leading-relaxed text-ink-600">
                {cat.explanation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { CategorySummary };
