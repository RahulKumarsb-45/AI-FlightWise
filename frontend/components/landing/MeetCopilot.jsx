import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';

/**
 * A static, presentational preview of the AI FlightWise Copilot chat.
 */
function CopilotPreview() {
  return (
    <figure className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
      <figcaption className="flex items-center gap-2.5 border-b border-ink-100 pb-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-horizon-700 text-white">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-ink-900">FlightWise Copilot</span>
          <span className="block text-xs text-ink-400">Example conversation</span>
        </span>
      </figcaption>

      <div className="mt-4 space-y-3">
        <div className="flex justify-start">
          <p className="max-w-[85%] rounded-xl bg-ink-50 px-3.5 py-2 text-sm leading-relaxed text-ink-800">
            <span className="sr-only">FlightWise Copilot said: </span>
            Hi! I&apos;m FlightWise Copilot. I can help you understand your flight options and decision trade-offs.
          </p>
        </div>
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-xl bg-horizon-700 px-3.5 py-2 text-sm leading-relaxed text-white">
            <span className="sr-only">You said: </span>
            Why is the balanced recommendation better for my trip?
          </p>
        </div>
        <div className="flex justify-start">
          <p className="max-w-[85%] rounded-xl bg-ink-50 px-3.5 py-2 text-sm leading-relaxed text-ink-800">
            <span className="sr-only">FlightWise Copilot said: </span>
            It saves ₹8,400 compared to the non-stop option while adding only a 1h 20m comfortable layover in Dubai.
          </p>
        </div>
      </div>
    </figure>
  );
}

function MeetCopilot() {
  return (
    <section className="bg-horizon-50 py-12 lg:flex lg:min-h-screen lg:items-center lg:py-14">
      <div className="section-wide w-full">
        <div className="grid items-center gap-10 lg:grid-cols-[9fr_11fr] lg:gap-16 xl:gap-20">
          <div className="mx-auto max-w-lg lg:mx-0">
            <h2 className="font-display text-display-sm text-ink-900">Meet FlightWise Copilot</h2>
            <p className="mt-2 text-lg text-horizon-700">Your AI flight decision partner</p>
            <p className="mt-4 max-w-md text-ink-600">
              Ask FlightWise Copilot about your flight options, compare trade-offs, and understand why one
              trip recommendation is better than another.
            </p>
            <p className="mt-3 max-w-md text-sm text-ink-500">
              Integrated directly into AI FlightWise — built to explain the
              recommendations and trade-offs found for your travel journey.
            </p>

            <Link href="/ai-agent" className={buttonVariants({ className: 'mt-6' })}>
              Ask FlightWise Copilot
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <CopilotPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

const MeetShreya = MeetCopilot;

export { MeetCopilot, MeetShreya };
