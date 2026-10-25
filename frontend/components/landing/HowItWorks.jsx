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
      className="relative overflow-hidden bg-navy-900 py-16 lg:py-24 border-t border-navy-800"
    >
      <div className="section-wide w-full relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Intelligent Workflow
          </span>
          <h2 className="mt-3 font-display text-display-sm text-white sm:text-display-md">
            How AI FlightWise works
          </h2>
          <p className="mt-3 text-ink-300 leading-relaxed max-w-2xl mx-auto">
            From raw route inputs to explainable, high-conviction flight recommendations — one structured process in four clear steps.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative flex flex-col justify-between rounded-2xl border border-navy-700/60 bg-navy-800/60 p-6 transition-all duration-300 hover:border-cyan-500/50 hover:bg-navy-800 hover:shadow-premium lg:p-7"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 rounded-full px-2.5 py-1">
                      {step.number}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-700/60 text-ink-300 group-hover:text-cyan-400 transition-colors">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-300">
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
