import { MapPinned, CalendarRange, Route, ScrollText, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: MapPinned,
    title: 'Nearby airport expansion',
    badge: 'Up to 300km',
    description:
      'Flying from Delhi? We also evaluate Jaipur and Chandigarh. A short connection or drive can unlock ₹6,000+ savings on international airfare.',
  },
  {
    icon: CalendarRange,
    title: 'Flexible date bracket',
    badge: '±3 Days Window',
    description:
      'Provide a flexible window and our engine searches combinatorial pairs across outbound and return legs to capture seasonal tariff dips.',
  },
  {
    icon: Route,
    title: 'Multi-city circuit routing',
    badge: 'Up to 4 Countries',
    description:
      'Plan complex multi-country trips. The optimizer permutes orderings and aligns dates to minimize cumulative duration and transit fatigue.',
  },
  {
    icon: ScrollText,
    title: 'Transparent trade-off logic',
    badge: '100% Grounded',
    description:
      'No black-box recommendations. Every flight option displays exact price deltas, layover trade-offs, and persona fit breakdowns.',
  },
];

function Features() {
  return (
    <section className="bg-paper py-16 lg:py-24 border-t border-ink-100">
      <div className="section-wide w-full">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-electric-200 bg-electric-50 px-3.5 py-1 text-xs font-semibold text-electric-700">
            <Sparkles className="h-3 w-3 text-electric-600" />
            Decision Intelligence
          </span>
          <h2 className="mt-4 font-display text-display-sm text-navy-950 sm:text-display-md">
            What actually transforms your fare
          </h2>
          <p className="mt-3 text-ink-500 leading-relaxed max-w-2xl mx-auto">
            Traditional flight search tools only query exact dates and single airports. AI FlightWise evaluates four multi-dimensional levers simultaneously.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col justify-between rounded-2xl border border-ink-100/90 bg-white p-6 shadow-soft transition-all duration-300 hover:border-electric-200 hover:shadow-premium"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-electric-50 to-violet-50 text-electric-600 border border-electric-100 transition-transform group-hover:scale-105">
                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="rounded-full bg-ink-50 border border-ink-100/80 px-2.5 py-0.5 text-[11px] font-medium text-ink-600">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-navy-950 group-hover:text-electric-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Features };
