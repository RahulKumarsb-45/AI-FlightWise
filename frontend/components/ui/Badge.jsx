import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono border', {
  variants: {
    variant: {
      neutral: 'bg-ink-100 text-ink-700 border-ink-200/60',
      horizon: 'bg-horizon-50 text-horizon-700 border-horizon-200/60',
      amber: 'bg-amber-50 text-amber-800 border-amber-200/70',
      route: 'bg-route-50 text-route-700 border-route-200/70',
      danger: 'bg-danger-50 text-danger-600 border-danger-200/70',
      electric: 'bg-electric-50 text-electric-700 border-electric-200/70',
      cyan: 'bg-cyan-50 text-cyan-800 border-cyan-200/70',
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
      sky: 'bg-sky-50 text-sky-700 border-sky-200/70',
    },
  },
  defaultVariants: { variant: 'neutral' },
});

function Badge({ className, variant, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
