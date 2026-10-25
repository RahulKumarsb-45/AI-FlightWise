import Link from 'next/link';
import { Plane, Sparkles } from 'lucide-react';

const FOOTER_LINKS = {
  'Flight Travel': [
    { href: '/search', label: 'Flight Search & Optimizer' },
    { href: '/how-it-works', label: 'How Optimization Works' },
    { href: '/ai-agent', label: 'Aero AI Travel Concierge' },
    { href: '/pricing', label: 'Pricing & Plans' },
  ],
  'Platform': [
    { href: '/about', label: 'About Us' },
    { href: '/faq', label: 'Frequently Asked Questions' },
    { href: '/contact', label: 'Contact & Support' },
    { href: '/analytics', label: 'PM Workspace (Analytics)' },
  ],
  'Legal & Trust': [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms & Conditions' },
  ],
};

function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-[#F8FAFC] text-ink-600">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2.5 font-display text-xl font-bold text-ink-950">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric-600 text-white shadow-soft">
              <Plane className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span>
              AI Flight<span className="text-electric-600">Wise</span>
            </span>
          </Link>
          <p className="mt-3.5 max-w-sm text-sm leading-relaxed text-ink-500">
            Smarter Flights. Better Decisions. AI-powered flight decision platform with transparent trade-off analysis, nearby airport routing, and Aero AI assistance.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-ink-500">
            <Sparkles className="h-3.5 w-3.5 text-electric-600" aria-hidden="true" />
            <span>Multi-factor optimization across price, duration, and airport hubs</span>
          </div>
        </div>

        {Object.entries(FOOTER_LINKS).map(([section, links]) => (
          <div key={section}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">{section}</h3>
            <ul className="mt-4 space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-600 transition-colors hover:text-electric-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ink-100 py-6">
        <div className="container-page flex flex-col items-center justify-between gap-3 text-xs text-ink-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} AI FlightWise. Built as an advanced flight optimization portfolio project.
          </p>
          <p className="flex items-center gap-1.5 text-ink-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Flight optimization engine operational
          </p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
