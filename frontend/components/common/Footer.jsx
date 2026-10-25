import Link from 'next/link';
import { Plane, Sparkles } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { href: '/search', label: 'Search Flights' },
    { href: '/how-it-works', label: 'How it works' },
    { href: '/ai-agent', label: 'Aero AI Assistant' },
    { href: '/pricing', label: 'Pricing Plans' },
    { href: '/evaluations', label: 'AI Quality Benchmark' },
  ],
  Platform: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'Frequently Asked Questions' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms & Conditions' },
  ],
};

function Footer() {
  return (
    <footer className="border-t border-navy-800 bg-navy-950 text-ink-300">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2.5 font-display text-xl font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-electric-600 via-electric-500 to-cyan-400 text-white shadow-soft">
              <Plane className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span>
              AI Flight<span className="text-cyan-400">Wise</span>
            </span>
          </Link>
          <p className="mt-3.5 max-w-sm text-sm leading-relaxed text-ink-400">
            Smarter Flights. Better Decisions. AI-powered flight decision platform with transparent trade-off analysis, nearby airport routing, and Aero AI assistance.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-ink-400">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            <span>Powered by grounded scoring algorithms & multi-city optimization</span>
          </div>
        </div>

        {Object.entries(FOOTER_LINKS).map(([section, links]) => (
          <div key={section}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-200">{section}</h3>
            <ul className="mt-3.5 space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-400 transition-colors hover:text-cyan-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-navy-800/80 py-6">
        <div className="container-page flex flex-col items-center justify-between gap-3 text-xs text-ink-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} AI FlightWise. Built as a portfolio project — not an airline or live booking agency.
          </p>
          <p className="flex items-center gap-1.5 text-ink-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-route-400"></span>
            All flight decision algorithms operational
          </p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
