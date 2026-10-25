'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPinned,
  CalendarRange,
  Route,
  Sparkles,
  TrendingDown,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';
import { useAuth } from '@/hooks/useAuth';

const CAPABILITIES = [
  { icon: MapPinned, title: 'Nearby Hubs', desc: 'Checks alternate airports within 300km' },
  { icon: CalendarRange, title: 'Flexible Dates', desc: '±3 days combinatorial fare search' },
  { icon: Route, title: 'Multi-City Circuits', desc: 'Optimal routing across up to 4 countries' },
];

function Hero() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <section className="relative overflow-hidden bg-navy-950 text-white min-h-[640px] lg:min-h-[720px] flex items-center">
      {/* Background aviation image with cinematic dark gradient overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-aviation.jpg"
          alt="Modern commercial passenger aircraft flying above twilight clouds"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] md:object-[60%_center] lg:object-center opacity-45 lg:opacity-55"
        />
        {/* Responsive dark gradient overlays for guaranteed WCAG AA text contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-navy-950/95 via-navy-950/80 to-navy-950/95 lg:bg-gradient-to-r lg:from-navy-950/98 lg:via-navy-950/85 lg:to-navy-950/40"
        />
      </div>

      <div className="container-page relative z-10 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Brand, Tagline, Value Prop, CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 xl:col-span-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/50 px-3.5 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
              <span>AI FlightWise · Decision Intelligence</span>
            </div>

            <h1 className="mt-4 font-display text-display-md sm:text-display-lg lg:text-display-xl font-bold tracking-tight text-white">
              Smarter Flights.
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-electric-400 to-violet-400 bg-clip-text text-transparent">
                Better Decisions.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-balance text-base sm:text-lg text-ink-300 leading-relaxed">
              Stop sifting through chaotic flight listings. AI FlightWise evaluates nearby airports, flexible dates, and multi-city circuits — then explains exactly why each recommendation beats the rest.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/search"
                className={`${buttonVariants({ variant: 'cyan', size: 'lg' })} w-full sm:w-auto shadow-glow-cyan`}
              >
                Start Flight Search
                <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
              </Link>
              <Link
                href="/ai-agent"
                className={`${buttonVariants({ variant: 'outline', size: 'lg' })} w-full sm:w-auto border-navy-700 bg-navy-900/60 text-white backdrop-blur-md hover:bg-navy-800`}
              >
                <Sparkles className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                Ask Aero AI
              </Link>
            </div>

            {/* Trust and Key Capability Badges */}
            <div className="mt-10 pt-6 border-t border-navy-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-800/90 text-cyan-400 border border-navy-700/60">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{title}</p>
                    <p className="text-[11px] text-ink-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Live Decision Intelligence Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 xl:col-span-5"
          >
            <div className="relative rounded-2xl border border-navy-700/80 bg-navy-900/90 p-5 shadow-premium backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-300">
                    Decision Matrix Preview
                  </span>
                </div>
                <span className="rounded-full bg-navy-800 px-2 py-0.5 font-mono text-[11px] text-cyan-300">
                  DEL → LHR
                </span>
              </div>

              {/* Recommendation Options Comparison */}
              <div className="mt-4 space-y-2.5">
                {/* Balanced Pick (Highlighted) */}
                <div className="relative rounded-xl border border-cyan-400/50 bg-gradient-to-r from-navy-800/90 to-navy-900/90 p-3.5 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-gradient-to-r from-electric-500 to-cyan-400 px-2 py-0.5 text-[10px] font-bold text-navy-950">
                        BEST BALANCED
                      </span>
                      <span className="text-xs text-ink-300">1 Stop (1h 15m)</span>
                    </div>
                    <span className="font-mono text-base font-bold text-white">₹44,500</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
                    <span className="flex items-center gap-1 text-cyan-300">
                      <TrendingDown className="h-3 w-3" /> Saves ₹12,300 vs direct
                    </span>
                    <span className="font-mono text-[11px] text-ink-300">Score 94/100</span>
                  </div>
                </div>

                {/* Cheapest Option */}
                <div className="rounded-xl border border-navy-800 bg-navy-950/60 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink-300">CHEAPEST</span>
                    <span className="font-mono text-sm font-semibold text-ink-200">₹39,800</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-ink-400">
                    <span>2 Stops (6h 40m layover)</span>
                    <span className="font-mono text-[11px]">Score 81/100</span>
                  </div>
                </div>

                {/* Fastest Option */}
                <div className="rounded-xl border border-navy-800 bg-navy-950/60 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink-300">FASTEST</span>
                    <span className="font-mono text-sm font-semibold text-ink-200">₹56,800</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-ink-400">
                    <span>Non-stop (8h 50m)</span>
                    <span className="font-mono text-[11px]">Score 88/100</span>
                  </div>
                </div>
              </div>

              {/* Grounded Rationale Callout */}
              <div className="mt-4 rounded-xl border border-navy-700/50 bg-navy-950/70 p-3 text-xs leading-relaxed text-ink-300">
                <p className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                  <span>
                    <strong className="text-white">Why Balanced Wins:</strong> You save ₹12,300 with only 1h 15m additional transit, keeping total duration under 10.5 hours.
                  </span>
                </p>
              </div>

              <div className="mt-3.5 text-center">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Run your own route optimization →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export { Hero };
