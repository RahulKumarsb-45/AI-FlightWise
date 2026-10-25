'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Plane, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { buttonVariants } from '@/components/ui/button-variants';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui/Dropdown';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/evaluations', label: 'AI Quality' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

// Aero AI navbar CTA
const COPILOT_CTA_LABEL = 'Ask Aero AI';
const COPILOT_CTA_BASE_CLASSES =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-electric-200/80 bg-gradient-to-r from-electric-50/80 via-white to-violet-50/80 px-4 py-1.5 text-sm font-semibold text-electric-700 shadow-soft transition-all duration-200 hover:border-electric-400 hover:shadow-glow-electric active:scale-[0.98]';

const LOGIN_BUTTON_CLASSES =
  'inline-flex items-center justify-center rounded-lg font-body text-sm font-medium h-9 px-3.5 border border-ink-200 bg-white/60 text-ink-700 transition-all hover:border-ink-300 hover:bg-white hover:text-ink-900 active:scale-[0.98]';

function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-white/90 backdrop-blur-md shadow-soft">
      <nav className="container-page flex h-[70px] items-center justify-between md:grid md:grid-cols-[auto_1fr_auto] md:gap-4">
        <a
          href="#main-content"
          className="sr-only rounded bg-white px-3 py-2 text-sm font-medium text-ink-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:shadow-card"
        >
          Skip to main content
        </a>

        <Link href="/" className="group flex items-center gap-2.5 font-display text-lg font-bold text-navy-900 transition-transform active:scale-[0.99]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-electric-600 via-electric-500 to-cyan-400 text-white shadow-soft transition-transform group-hover:scale-105">
            <Plane className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className="tracking-tight">
            AI Flight<span className="text-electric-600">Wise</span>
          </span>
        </Link>

        {/* True horizontal centering */}
        <div className="hidden items-center justify-self-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-600 transition-colors hover:text-electric-600"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3.5 justify-self-end md:flex">
          <Link href="/ai-agent" className={COPILOT_CTA_BASE_CLASSES}>
            <Sparkles className="h-3.5 w-3.5 text-electric-600" aria-hidden="true" />
            {COPILOT_CTA_LABEL}
          </Link>
          {!loading && !isAuthenticated && (
            <div className="flex items-center gap-2.5">
              <Link href="/login" className={LOGIN_BUTTON_CLASSES}>
                Login
              </Link>
              <Link href="/register?redirect=/" className={buttonVariants({ size: 'sm' })}>
                Get started
              </Link>
            </div>
          )}
          {!loading && isAuthenticated && (
            <Dropdown>
              <DropdownTrigger className="flex items-center gap-2 rounded-full border border-ink-200/80 bg-white/80 py-1 pl-1 pr-3 text-sm font-medium text-ink-700 shadow-soft hover:bg-ink-50">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-electric-600 to-violet-600 text-xs font-semibold text-white">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
                {user?.name?.split(' ')[0]}
              </DropdownTrigger>
              <DropdownContent align="end">
                <DropdownItem onSelect={() => router.push('/search')}>New search</DropdownItem>
                <DropdownItem onSelect={() => router.push('/dashboard')}>Dashboard</DropdownItem>
                <DropdownItem onSelect={() => router.push('/profile')}>Profile</DropdownItem>
                <DropdownItem onSelect={logout} className="text-danger-600">
                  Log out
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        aria-hidden={!mobileOpen}
        {...(mobileOpen ? {} : { inert: 'true' })}
        className={cn('overflow-hidden border-t border-ink-100 bg-white/95 backdrop-blur-md md:hidden', mobileOpen ? 'max-h-96' : 'max-h-0 border-t-0')}
      >
        <div className="container-page flex flex-col gap-1 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-electric-600"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/ai-agent"
            className={cn(COPILOT_CTA_BASE_CLASSES, 'mt-2 w-full justify-center py-2.5')}
            onClick={() => setMobileOpen(false)}
          >
            <Sparkles className="h-4 w-4 text-electric-600" aria-hidden="true" />
            {COPILOT_CTA_LABEL}
          </Link>
          <div className="mt-3 flex flex-col gap-2 border-t border-ink-100 pt-3">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className={cn(LOGIN_BUTTON_CLASSES, 'h-11 w-full text-[15px]')}>
                  Login
                </Link>
                <Link href="/register?redirect=/" className={buttonVariants({ className: 'w-full' })}>
                  Get started
                </Link>
              </>
            ) : (
              <button onClick={logout} className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
                Log out
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export { Navbar };
