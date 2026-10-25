import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { SearchForm } from '@/components/search/SearchForm';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Plan & Optimize Flight Journey',
  description: 'Search and optimize flights with nearby airports, flexible dates, and multi-city route permutations on AI FlightWise.',
};

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="container-page max-w-5xl py-12 lg:py-16">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-electric-200 bg-electric-50 px-3.5 py-1 text-xs font-semibold text-electric-700">
            <Sparkles className="h-3.5 w-3.5 text-electric-600" />
            Flight Decision Engine
          </span>
          <h1 className="mt-4 font-display text-display-sm font-bold text-navy-950 sm:text-display-md">
            Where are we optimizing today?
          </h1>
          <p className="mt-3 text-ink-500 leading-relaxed max-w-xl mx-auto">
            A single search evaluates nearby alternate airport hubs, flexible 7-day date brackets, and optimal multi-city circuits.
          </p>
        </div>
        <SearchForm />
      </main>
      <Footer />
    </>
  );
}
