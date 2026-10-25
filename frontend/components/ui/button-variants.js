import { cva } from 'class-variance-authority';

/**
 * Deliberately NOT in a 'use client' file. buttonVariants is a plain function
 * (no hooks, no browser APIs) — it just computes a class string. If this lived
 * inside Button.jsx (which needs 'use client' for its interactive behavior),
 * Server Components importing buttonVariants directly would receive an inert
 * RSC client-reference placeholder instead of a callable function ("x is not
 * a function" at render/serialize time), since only React components — not
 * plain utility exports — can cross the server/client boundary that way.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-body font-medium transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:scale-100',
  {
    variants: {
      variant: {
        primary: 'bg-electric-600 text-white hover:bg-electric-700 shadow-soft hover:shadow-glow-electric',
        accent: 'bg-gradient-to-r from-electric-600 to-violet-600 text-white hover:from-electric-700 hover:to-violet-700 shadow-soft',
        cyan: 'bg-gradient-to-r from-electric-600 to-cyan-600 text-white font-semibold hover:from-electric-700 hover:to-cyan-700 shadow-soft',
        outline: 'border border-ink-200 bg-white text-ink-800 hover:bg-ink-50 hover:border-ink-300 shadow-xs',
        ghost: 'bg-transparent text-ink-700 hover:bg-ink-50 hover:text-ink-900',
        link: 'bg-transparent text-electric-600 underline-offset-4 hover:underline p-0 h-auto',
        danger: 'bg-danger-500 text-white hover:bg-danger-600 shadow-soft',
      },
      size: {
        sm: 'h-9 px-3.5 text-sm',
        md: 'h-11 px-5 text-[15px]',
        lg: 'h-13 px-7 text-base font-semibold',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);
