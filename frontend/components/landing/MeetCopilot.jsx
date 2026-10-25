import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';

/**
 * A sleek light travel concierge preview of the Shreya AI chat.
 */
function ShreyaAIPreview() {
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-ink-200/90 bg-white p-6 shadow-premium">
      <figcaption className="relative flex items-center justify-between border-b border-ink-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-electric-200 bg-electric-50 shadow-xs">
            <Image
              src="/images/shreya-ai-avatar.png"
              alt="Shreya AI Assistant Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="flex items-center gap-2 text-sm font-bold text-ink-900">
              Shreya AI
              <span className="inline-flex items-center rounded-full bg-electric-50 border border-electric-200/60 px-2 py-0.5 text-[11px] font-semibold text-electric-700">
                Travel Concierge
              </span>
            </span>
            <span className="block text-xs text-ink-500">Grounded Flight Decision Partner</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 rounded-full px-2.5 py-0.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active</span>
        </div>
      </figcaption>

      <div className="relative mt-5 space-y-3.5">
        <div className="flex justify-start">
          <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-ink-100 bg-[#F8FAFC] p-4 text-sm leading-relaxed text-ink-800 shadow-xs">
            <span className="sr-only">Shreya AI said: </span>
            <p className="font-bold text-electric-700 text-xs mb-1">Shreya AI</p>
            Hello! I&apos;m Shreya AI. I can explain trade-offs between cheapest, fastest, and balanced flight routes, calculate realistic trip budgets, or check nearby alternate airports for you.
          </div>
        </div>

        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-electric-600 p-4 text-sm leading-relaxed text-white shadow-soft">
            <span className="sr-only">You said: </span>
            Why is the balanced recommendation better for my trip to Singapore?
          </div>
        </div>

        <div className="flex justify-start">
          <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-ink-100 bg-[#F8FAFC] p-4 text-sm leading-relaxed text-ink-800 shadow-xs">
            <span className="sr-only">Shreya AI said: </span>
            <p className="font-bold text-electric-700 text-xs mb-1">Shreya AI</p>
            It saves <span className="font-bold text-ink-950">₹8,400</span> compared to the direct flight while adding only a 1h 20m comfortable transfer in Kuala Lumpur. Total travel time is just 7h 10m.
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-3.5 text-xs text-ink-500">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          No fabricated prices or speculative claims
        </span>
        <span className="text-ink-400">Plain-language explainability</span>
      </div>
    </figure>
  );
}

function MeetCopilot() {
  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-24 border-t border-ink-100">
      <div className="section-wide w-full relative">
        <div className="grid items-center gap-10 lg:grid-cols-[9fr_11fr] lg:gap-16 xl:gap-20">
          <div className="mx-auto max-w-lg lg:mx-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-electric-200 bg-electric-50 px-3.5 py-1 text-xs font-semibold text-electric-700">
              <Sparkles className="h-3.5 w-3.5 text-electric-600" aria-hidden="true" />
              Shreya AI Assistant
            </span>

            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold text-ink-950">
              Meet Shreya AI, your flight decision partner
            </h2>
            <p className="mt-2 text-lg font-semibold text-electric-600">
              Smarter flights. Better decisions.
            </p>
            <p className="mt-4 max-w-md text-ink-600 leading-relaxed text-base">
              Ask Shreya AI about your flight alternatives, compare hidden trade-offs, and understand why one trip recommendation beats another in clear, everyday language.
            </p>
            <p className="mt-3 max-w-md text-sm text-ink-500 leading-relaxed">
              Integrated natively into AI FlightWise — built to explain the recommendations, nearby airport savings, and multi-city circuits found for your itinerary.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/ai-agent" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                Ask Shreya AI
                <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
              </Link>
              <Link href="/how-it-works" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'bg-white hover:bg-ink-50 text-ink-800' })}>
                How It Works
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <ShreyaAIPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

const MeetAeroAI = MeetCopilot;

export { MeetCopilot, MeetAeroAI };
