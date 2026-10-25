import Link from 'next/link';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';
import { formatInr } from '@/utils/format';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    tagline: 'Explore the flight decision engine',
    features: ['5 optimized searches / month', '1 saved trip with timeline', 'Cheapest, fastest & balanced picks', 'Basic trade-off score breakdown'],
  },
  {
    name: 'Pro',
    price: 499,
    tagline: 'For travelers seeking maximum savings',
    highlighted: true,
    features: ['Unlimited searches & permutations', 'Unlimited saved & shared trips', 'Multi-city routing (up to 4 countries)', 'Priority nearby airport expansion (300km)', 'Aero AI assistant access'],
  },
  {
    name: 'Business',
    price: 1499,
    tagline: 'For group trips & corporate travel',
    features: ['Everything in Pro', 'Multiple traveler profiles & shared budgets', 'Export itineraries to PDF', 'Priority optimization compute'],
  },
];

function PricingPreview() {
  return (
    <section className="container-page py-16 lg:py-24 border-t border-ink-100">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-electric-200 bg-electric-50 px-3.5 py-1 text-xs font-semibold text-electric-700">
          <Sparkles className="h-3 w-3 text-electric-600" />
          Transparent Value
        </span>
        <h2 className="mt-4 font-display text-display-sm text-navy-950 sm:text-display-md">
          Simple, ₹-first pricing
        </h2>
        <p className="mt-3 text-ink-500 leading-relaxed max-w-xl mx-auto">
          Start free to explore how optimization works. Upgrade only when you want unlimited multi-city circuits and Aero AI assistance.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
        {PLANS.map((plan, index) => (
          <div
            key={plan.name}
            className={
              (plan.highlighted
                ? 'relative flex h-full flex-col rounded-2xl border-2 border-electric-500 bg-white p-7 shadow-premium'
                : 'flex h-full flex-col rounded-2xl border border-ink-100/90 bg-white p-7 shadow-soft hover:shadow-card transition-shadow') +
              (index === PLANS.length - 1
                ? ' sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-sm lg:col-span-1 lg:mx-0 lg:max-w-none'
                : '')
            }
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-electric-600 to-violet-600 px-3.5 py-0.5 text-xs font-semibold text-white shadow-soft">
                Most Popular
              </span>
            )}
            <h3 className="font-display text-xl font-bold text-navy-950">{plan.name}</h3>
            <p className="mt-1 text-sm text-ink-500">{plan.tagline}</p>
            <div className="mt-5 pb-5 border-b border-ink-100">
              <span className="font-mono text-4xl font-bold text-navy-950">
                {plan.price === 0 ? 'Free' : formatInr(plan.price)}
              </span>
              {plan.price > 0 && <span className="text-sm font-normal text-ink-500"> / month</span>}
            </div>

            <ul className="mt-5 space-y-3 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-ink-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-route-500" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className={buttonVariants({
                variant: plan.highlighted ? 'primary' : 'outline',
                className: 'mt-8 w-full',
              })}
            >
              {plan.price === 0 ? 'Start Free' : 'Get Started with ' + plan.name}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-ink-400">
        <Link href="/pricing" className="text-electric-600 font-medium underline underline-offset-4 hover:text-electric-700">
          Compare all detailed feature tiers →
        </Link>
      </p>
    </section>
  );
}

export { PricingPreview };
