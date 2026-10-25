'use client';

import Link from 'next/link';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

const FAQS = [
  {
    id: 'real-flights',
    question: 'How does AI FlightWise compute flight recommendations?',
    answer:
      'AI FlightWise models real-world airline pricing, flight duration, and stopovers. It searches combinatorial date pairs (±3 days) and evaluates alternate hubs within 300km, ranking all candidates via multi-factor scoring (price, duration, stops, layovers) with transparent trade-off rationale.',
  },
  {
    id: 'nearby',
    question: 'How far do nearby airport checks reach?',
    answer:
      'Our engine discovers up to 3 alternate airport hubs within approximately 300km of your origin and destinations, factoring in road transit time and penalty scores so recommendations only suggest an alternate airport when the net monetary saving is genuinely worthwhile.',
  },
  {
    id: 'multi-city',
    question: 'How many countries can a multi-city circuit cover?',
    answer:
      'Up to 4 destination countries in a single optimized circuit. Our algorithm computes all N! sequence permutations, staggers dates, and evaluates flight legs to find the cheapest and fastest circuit order returning to your home airport.',
  },
];

function FAQPreview() {
  return (
    <section className="container-page py-16 lg:py-24 border-t border-ink-100">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-electric-200 bg-electric-50 px-3.5 py-1 text-xs font-semibold text-electric-700">
          <HelpCircle className="h-3 w-3 text-electric-600" />
          Clear Answers
        </span>
        <h2 className="mt-4 font-display text-display-sm text-navy-950 sm:text-display-md">
          Frequently asked questions
        </h2>
        <p className="mt-3 text-ink-500 leading-relaxed max-w-xl mx-auto">
          Everything you need to know about the optimization engine, airport discovery, and multi-city circuits.
        </p>
      </div>

      <div className="mx-auto mt-10 min-w-0 max-w-[75rem]">
        <Tabs defaultValue={FAQS[0].id} className="min-w-0">
          <TabsList className="w-full min-w-0 max-w-full justify-start overflow-x-auto rounded-xl bg-ink-100/70 p-1 border border-ink-200/50">
            {FAQS.map((faq) => (
              <TabsTrigger
                key={faq.id}
                value={faq.id}
                className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-electric-700 data-[state=active]:shadow-soft"
              >
                {faq.question}
              </TabsTrigger>
            ))}
          </TabsList>
          {FAQS.map((faq) => (
            <TabsContent
              key={faq.id}
              value={faq.id}
              className="mt-6 rounded-2xl border border-ink-100/80 bg-white p-7 shadow-soft"
            >
              <p className="text-base text-ink-600 leading-relaxed">{faq.answer}</p>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <p className="mt-10 text-center text-sm text-ink-400">
        <Link href="/faq" className="inline-flex items-center gap-1 text-electric-600 font-medium underline underline-offset-4 hover:text-electric-700">
          View all frequently asked questions
          <ArrowRight className="h-4 w-4" />
        </Link>
      </p>
    </section>
  );
}

export { FAQPreview };
