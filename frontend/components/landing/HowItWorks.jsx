import { Search, Sliders, Scale, Bot } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Enter your journey',
    description: 'Specify your departure airport, one or multiple destination countries, dates, and budget.',
  },
  {
    number: '02',
    icon: Sliders,
    title: 'Multi-factor optimization',
    description: 'We evaluate nearby airport hubs, flex ±3 days, and optimal multi-city stop sequences.',
  },
  {
    number: '03',
    icon: Scale,
    title: 'Grounded trade-off analysis',
    description: 'Compare Cheapest, Fastest, and Best Balanced recommendations with transparent score breakdowns.',
  },
  {
    number: '04',
    icon: Bot,
    title: 'Ask Aero AI',
    description: 'Interact with Aero AI to explore layover trade-offs, nearby airport transfers, and budget breakdowns.',
  },
];

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-white py-16 lg:py-24 border-t border-ink-100"
    >
      <div className="section-wide w-full relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-electric-200 bg-electric-50 px-3.5 py-1 text-xs font-semibold text-electric-700">
            Intelligent Workflow
          </span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold text-ink-950">
            How AI FlightWise works
          </h2>
          <p className="mt-3 text-ink-600 leading-relaxed max-w-2xl mx-auto text-base">
            From raw itinerary inputs to explainable, high-conviction flight recommendations — one structured process in four clear steps.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative flex flex-col justify-between rounded-2xl border border-ink-100 bg-[#F8FAFC] p-6 transition-all duration-300 hover:border-electric-200 hover:bg-white hover:shadow-card lg:p-7"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold tracking-wider text-electric-700 bg-white border border-electric-200 rounded-full px-2.5 py-1 shadow-xs">
                      STEP {step.number}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric-50 text-electric-600 border border-electric-100 transition-colors group-hover:bg-electric-600 group-hover:text-white">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-ink-900 group-hover:text-electric-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { HowItWorks };
