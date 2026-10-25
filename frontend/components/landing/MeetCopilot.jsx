import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, Bot, ShieldCheck } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';

/**
 * A sleek interactive-style presentational preview of the Aero AI chat.
 */
function AeroAIPreview() {
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-navy-700/60 bg-navy-900/90 p-5 shadow-premium backdrop-blur-md">
      {/* Ambient background glow */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-electric-500/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" aria-hidden="true" />

      <figcaption className="relative flex items-center justify-between border-b border-navy-800 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-cyan-400/40 bg-navy-950 shadow-soft">
            <Image
              src="/images/aero-ai-avatar.png"
              alt="Aero AI"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
              Aero AI
              <span className="inline-flex items-center rounded-full bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-300">
                Decision Copilot
              </span>
            </span>
            <span className="block text-xs text-ink-400">Grounded Flight Intelligence</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-route-400">
          <span className="inline-block h-2 w-2 rounded-full bg-route-400 animate-pulse"></span>
          <span>Online</span>
        </div>
      </figcaption>

      <div className="relative mt-4 space-y-3.5">
        <div className="flex justify-start">
          <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-navy-700/70 bg-navy-800/80 p-3.5 text-sm leading-relaxed text-ink-100 shadow-sm">
            <span className="sr-only">Aero AI said: </span>
            <p className="font-medium text-cyan-300 text-xs mb-1">Aero AI</p>
            Hello! I&apos;m Aero AI. I can explain trade-offs between cheapest, fastest, and balanced flight routes, calculate realistic trip budgets, or check nearby airports for you.
          </div>
        </div>

        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-electric-600 to-violet-600 p-3.5 text-sm leading-relaxed text-white shadow-soft">
            <span className="sr-only">You said: </span>
            Why is the balanced recommendation better for my trip to Singapore?
          </div>
        </div>

        <div className="flex justify-start">
          <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-navy-700/70 bg-navy-800/80 p-3.5 text-sm leading-relaxed text-ink-100 shadow-sm">
            <span className="sr-only">Aero AI said: </span>
            <p className="font-medium text-cyan-300 text-xs mb-1">Aero AI</p>
            It saves <span className="font-semibold text-white">₹8,400</span> compared to the direct flight while adding only a 1h 20m comfortable transfer in Kuala Lumpur. Total travel time is just 7h 10m.
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-navy-800/80 pt-3 text-xs text-ink-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          No fabricated prices or speculative claims
        </span>
        <span className="text-ink-400">Real-time explainability</span>
      </div>
    </figure>
  );
}

function MeetCopilot() {
  return (
    <section className="relative overflow-hidden bg-navy-950 py-16 lg:py-24 border-t border-navy-800">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 h-96 w-96 rounded-full bg-electric-600/10 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="section-wide w-full relative">
        <div className="grid items-center gap-10 lg:grid-cols-[9fr_11fr] lg:gap-16 xl:gap-20">
          <div className="mx-auto max-w-lg lg:mx-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Aero AI Assistant
            </span>

            <h2 className="mt-4 font-display text-display-sm text-white sm:text-display-md">
              Meet Aero AI
            </h2>
            <p className="mt-2 text-lg font-medium text-cyan-300">
              Smarter flights. Better decisions.
            </p>
            <p className="mt-4 max-w-md text-ink-300 leading-relaxed">
              Ask Aero AI about your flight alternatives, compare hidden trade-offs, and understand why one trip recommendation beats another.
            </p>
            <p className="mt-3 max-w-md text-sm text-ink-400 leading-relaxed">
              Integrated natively into AI FlightWise — built to explain the recommendations, nearby airport savings, and multi-city circuits found for your itinerary.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/ai-agent" className={buttonVariants({ variant: 'cyan', size: 'lg' })}>
                Ask Aero AI
                <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
              </Link>
              <Link href="/evaluations" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'border-navy-700 bg-navy-900/60 text-ink-200 hover:bg-navy-800' })}>
                View AI Benchmark
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <AeroAIPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

const MeetAeroAI = MeetCopilot;

export { MeetCopilot, MeetAeroAI };
