'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  MapPinned,
  CalendarRange,
  Route,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  Plane,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';
import { Badge } from '@/components/ui/Badge';

const CAPABILITIES = [
  { icon: MapPinned, title: 'Nearby Hubs', desc: 'Checks alternate airports within 300km' },
  { icon: CalendarRange, title: 'Flexible Dates', desc: '±3 days window for tariff dips' },
  { icon: Route, title: 'Multi-City Circuits', desc: 'Optimal routing across up to 4 countries' },
];

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#EEF4FF]/70 via-[#F8FAFC] to-[#FFFFFF] text-ink-900 min-h-[640px] lg:min-h-[720px] flex items-center border-b border-ink-100">
      {/* Premium aviation photography background with localized readability gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/hero-aviation.jpg"
          alt="Modern commercial passenger aircraft flying through clear blue skies"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[85%_center] sm:object-[80%_center] md:object-[75%_center] lg:object-[85%_center] opacity-80 md:opacity-85"
        />
        {/* Localized gradient overlay: solid light neutral behind text on left, translucent to clear over the aircraft on right */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-white/95 lg:bg-gradient-to-r lg:from-white lg:via-white/92 lg:via-50% lg:to-white/20"
        />
      </div>

      <div className="container-page relative z-10 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Brand, Tagline, Value Prop, CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 xl:col-span-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-electric-200 bg-white/90 px-3.5 py-1 text-xs font-semibold text-electric-700 shadow-xs backdrop-blur-sm">
              <Plane className="h-3.5 w-3.5 text-electric-600" aria-hidden="true" />
              <span>AI FlightWise · Intelligent Route Planning</span>
            </div>

            <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-ink-950 leading-[1.12]">
              Smarter Flights.
              <br />
              <span className="text-electric-600">Better Decisions.</span>
            </h1>

            <p className="mt-5 max-w-xl text-balance text-base sm:text-lg text-ink-600 leading-relaxed">
              Stop sifting through chaotic flight listings. AI FlightWise evaluates nearby alternate airports, flexible date brackets, and multi-city circuits — then explains exactly why each recommendation beats the rest.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/search"
                className={`${buttonVariants({ variant: 'primary', size: 'lg' })} w-full sm:w-auto shadow-soft`}
              >
                Start Flight Search
                <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
              </Link>
              <Link
                href="/how-it-works"
                className={`${buttonVariants({ variant: 'outline', size: 'lg' })} w-full sm:w-auto bg-white hover:bg-ink-50 text-ink-800`}
              >
                How It Works
              </Link>
            </div>

            {/* Trust and Key Capability Badges */}
            <div className="mt-10 pt-6 border-t border-ink-100 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-2.5 rounded-xl border border-ink-100 bg-white/90 p-3 shadow-xs">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-electric-50 text-electric-600 border border-electric-100">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink-900">{title}</p>
                    <p className="text-[11px] text-ink-500 leading-tight mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Illustrative Flight Recommendation Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="lg:col-span-5 xl:col-span-5"
          >
            <div className="relative rounded-2xl border border-ink-200/90 bg-white p-6 shadow-premium">
              <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-electric-600 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    Recommendation Preview
                  </span>
                </div>
                <span className="rounded-full bg-electric-50 border border-electric-100 px-2.5 py-0.5 font-mono text-xs font-semibold text-electric-700">
                  DEL → LHR
                </span>
              </div>

              {/* Recommendation Options Comparison */}
              <div className="mt-4 space-y-3">
                {/* Balanced Pick (Highlighted) */}
                <div className="relative rounded-xl border border-electric-400 bg-electric-50/60 p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-electric-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                        BEST BALANCED
                      </span>
                      <span className="text-xs font-medium text-ink-700">1 Stop (1h 15m DOH)</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-ink-950">₹44,500</span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-xs text-ink-600">
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <TrendingDown className="h-3.5 w-3.5 text-emerald-600" /> Saves ₹12,300 vs direct
                    </span>
                    <span className="text-xs text-ink-500">10h 15m total</span>
                  </div>
                </div>

                {/* Cheapest Option */}
                <div className="rounded-xl border border-ink-100 bg-paper-50 p-3 text-xs transition-colors hover:border-ink-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink-700">CHEAPEST OPTION</span>
                    <span className="font-mono text-sm font-semibold text-ink-900">₹39,800</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-ink-500">
                    <span>2 Stops (6h 40m layovers)</span>
                    <span>17h 20m total</span>
                  </div>
                </div>

                {/* Fastest Option */}
                <div className="rounded-xl border border-ink-100 bg-paper-50 p-3 text-xs transition-colors hover:border-ink-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink-700">FASTEST OPTION</span>
                    <span className="font-mono text-sm font-semibold text-ink-900">₹56,800</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-ink-500">
                    <span>Non-stop direct flight</span>
                    <span>8h 50m total</span>
                  </div>
                </div>
              </div>

              {/* Grounded Rationale Callout */}
              <div className="mt-4 rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 text-xs leading-relaxed text-emerald-950">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    <strong className="font-semibold text-emerald-900">Why Balanced Wins:</strong> You save ₹12,300 compared to direct options with only a 1h 15m transfer, keeping total journey under 10.5 hours.
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-ink-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-ink-400">
                  Illustrative recommendation example
                </span>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-1 font-semibold text-electric-600 hover:text-electric-700 transition-colors"
                >
                  Run live optimization →
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
