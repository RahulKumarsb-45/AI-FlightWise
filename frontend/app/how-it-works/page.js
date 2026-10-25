import Link from 'next/link';
import { ArrowRight, MapPinned, CalendarRange, Route, ScrollText } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { BackButton } from '@/components/common/BackButton';
import { buttonVariants } from '@/components/ui/button-variants';

export const metadata = { title: 'How It Works' };

const STEPS = [
  {
    number: '01',
    title: 'Tell us your trip',
    description: 'Origin, destinations, dates and budget.',
    detail:
      'Start with as little as an origin city and where you want to go. Add dates, a budget in ₹, and how many people are travelling — the optimizer works with whatever you give it.',
  },
  {
    number: '02',
    title: 'Optimize routes and dates',
    description: 'Nearby airports, flexible dates and multi-city routes.',
    detail:
      'Behind the scenes we expand your search across nearby airports, check a window of flexible dates, and — for multi-country trips — try different route orderings, all within a time budget that keeps searches fast.',
  },
  {
    number: '03',
    title: 'Compare recommendations',
    description: 'See the best options and understand the trade-offs.',
    detail:
      'Every result is scored on price, duration, and number of stops. Cheapest, fastest, and balanced picks are called out so you can see the trade-offs at a glance instead of scrolling a long list.',
  },
  {
    number: '04',
    title: 'Ask Shreya AI',
    description: 'Ask Shreya AI why an option is better and get clear decision guidance.',
    detail:
      'Ask Shreya AI about your flight options in plain language — why one trip beats another, what a nearby-airport swap actually saves, or how to fit your budget constraints.',
  },
];

const WHY_IT_WORKS = [
  {
    icon: MapPinned,
    title: 'Nearby airport expansion',
    description:
      'Flying from Delhi? We also check Jaipur and Chandigarh. A 2-hour drive can mean a ₹6,000 saving on the flight itself.',
  },
  {
    icon: CalendarRange,
    title: 'Flexible date search',
    description: 'Give us a ±3 day window and we search every combination — not just the exact date you typed in.',
  },
  {
    icon: Route,
    title: 'Multi-city routing',
    description: 'Plan a circuit across up to 4 countries. We work out the order and dates that keep travel time sane.',
  },
  {
    icon: ScrollText,
    title: 'A reason for every pick',
    description: 'No black-box ranking. Every recommendation says exactly what it costs more or less, and why.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <BackButton />
      <main id="main-content">
        <section className="container-page py-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-electric-50 px-3 py-1 text-xs font-semibold text-electric-700 border border-electric-200/60 mb-3">
              Decision Architecture
            </span>
            <h1 className="font-display text-display-md text-ink-900">How AI FlightWise Works</h1>
            <p className="mt-3 text-ink-500 leading-relaxed max-w-xl mx-auto">
              From raw itinerary constraints to transparent recommendations you understand — one intelligent flow, four rigorous steps.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="flex h-full flex-col rounded-2xl border border-ink-100/90 bg-white p-6 shadow-soft transition-all hover:border-electric-300 hover:shadow-premium lg:p-7"
              >
                <span className="font-mono text-xs font-bold tracking-wider text-electric-600 bg-electric-50 rounded-lg px-2.5 py-1 w-fit border border-electric-100">
                  STEP {step.number}
                </span>
                <h2 className="mt-4 font-display text-lg font-bold text-ink-900">{step.title}</h2>
                <p className="mt-1.5 text-xs font-semibold leading-relaxed text-electric-700">{step.description}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-page bg-[#F0F6FF]/70 py-16 text-ink-900 rounded-3xl my-8 border border-electric-100">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-extrabold text-ink-950">What actually changes your fare</h2>
            <p className="mt-3 text-ink-600 text-base leading-relaxed">
              Four optimization levers standard OTA portals ignore because evaluating permutations requires real computation.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
            {WHY_IT_WORKS.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-white bg-white/95 p-6 lg:p-7 shadow-soft hover:shadow-card transition-all">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-electric-50 text-electric-600 border border-electric-100">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-page py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-display text-display-sm text-ink-900">Ready to optimize your next flight?</h2>
            <p className="mt-3 text-ink-500">
              Run a live search across nearby airports and date windows, or consult Shreya AI for personalized itinerary guidance.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/search" className={buttonVariants({ variant: 'primary', size: 'lg', className: 'w-full sm:w-auto shadow-glow-electric' })}>
                Start Flight Search
                <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
              </Link>
              <Link href="/ai-agent" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'w-full sm:w-auto' })}>
                Ask Shreya AI
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
