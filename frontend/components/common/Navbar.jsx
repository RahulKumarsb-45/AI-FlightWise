'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Menu,
  X,
  Plane,
  Sparkles,
  BarChart3,
  MessageSquare,
  Map,
  FileCheck2,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { buttonVariants } from '@/components/ui/button-variants';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui/Dropdown';
import { cn } from '@/lib/utils';

const PRIMARY_LINKS = [
  { href: '/search', label: 'Flight Search' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

const PM_WORKSPACE_LINKS = [
  { href: '/analytics', label: 'Product Analytics', icon: BarChart3, desc: 'Funnels & route telemetry' },
  { href: '/feedback', label: 'Customer Feedback', icon: MessageSquare, desc: 'Thematic clusters & evidence' },
  { href: '/copilot', label: 'PM Decision Copilot', icon: Sparkles, desc: 'Evidence PRDs & RICE scoring' },
  { href: '/roadmap', label: 'Product Roadmap', icon: Map, desc: 'Now / Next / Later initiatives' },
  { href: '/decisions', label: 'Decision Log', icon: FileCheck2, desc: 'Auditable ADRs & trade-offs' },
];

const PM_WORKSPACE_BADGE_CLASSES =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-ink-200 bg-ink-50/80 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-all duration-200 hover:border-electric-300 hover:bg-electric-50/50 hover:text-electric-700 active:scale-[0.98]';

const LOGIN_BUTTON_CLASSES =
  'inline-flex items-center justify-center rounded-lg font-body text-xs font-medium h-9 px-3.5 border border-ink-200 bg-white text-ink-700 transition-all hover:border-ink-300 hover:bg-ink-50 hover:text-ink-900 active:scale-[0.98] shadow-xs';

function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur-md shadow-xs">
      <nav className="container-page flex h-[72px] items-center justify-between md:grid md:grid-cols-[auto_1fr_auto] md:gap-6">
        <a
          href="#main-content"
          className="sr-only rounded bg-white px-3 py-2 text-sm font-medium text-ink-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:shadow-card"
        >
          Skip to main content
        </a>

        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-display text-lg font-bold text-ink-950 transition-transform active:scale-[0.99]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-electric-600 text-white shadow-soft transition-transform group-hover:scale-105">
            <Plane className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className="tracking-tight text-ink-900">
            AI Flight<span className="text-electric-600">Wise</span>
          </span>
        </Link>

        {/* Primary Consumer Navigation Links & Aero AI Button */}
        <div className="hidden items-center justify-self-center gap-5 lg:gap-7 md:flex">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-600 transition-colors hover:text-electric-600"
            >
              {link.label}
            </Link>
          ))}

          {/* Premium Aero AI Button */}
          <Link
            href="/ai-agent"
            id="nav-aero-ai-btn"
            title="Open Aero AI"
            aria-label="Open Aero AI"
            className="group relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-electric-600 via-sky-600 to-electric-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-electric-600/20 transition-all duration-200 hover:shadow-md hover:shadow-electric-600/30 hover:scale-[1.03] active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-electric-500/50"
          >
            <Sparkles className="h-3.5 w-3.5 text-sky-200 transition-transform duration-200 group-hover:rotate-12" aria-hidden="true" />
            <span className="tracking-wider font-display font-semibold">AI</span>
          </Link>

          {/* PM Workspace Dropdown - Clearly separated */}
          <Dropdown>
            <DropdownTrigger className="flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-electric-600 bg-ink-50 px-2.5 py-1 rounded-full border border-ink-200/60 transition-colors">
              <span>PM Workspace</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownTrigger>
            <DropdownContent align="center" className="w-72 p-2 space-y-1 bg-white border border-ink-100 shadow-premium rounded-xl">
              <div className="px-2.5 py-1.5 text-xs font-bold text-ink-500 uppercase tracking-wider border-b border-ink-100">
                Product Management Suite
              </div>
              {PM_WORKSPACE_LINKS.map((pm) => {
                const Icon = pm.icon;
                return (
                  <DropdownItem
                    key={pm.href}
                    onSelect={() => router.push(pm.href)}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-ink-50 cursor-pointer transition-colors"
                  >
                    <Icon className="h-4 w-4 text-electric-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-xs text-ink-900">{pm.label}</div>
                      <div className="text-xs text-ink-500">{pm.desc}</div>
                    </div>
                  </DropdownItem>
                );
              })}
            </DropdownContent>
          </Dropdown>
        </div>

        {/* Right CTA & Profile */}
        <div className="hidden items-center gap-3 justify-self-end md:flex">
          <Link
            href="/search"
            className={buttonVariants({ variant: 'primary', size: 'sm', className: 'h-9 px-4 text-xs font-semibold' })}
          >
            Search Flights
          </Link>

          {!loading && !isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link href="/login" className={LOGIN_BUTTON_CLASSES}>
                Login
              </Link>
              <Link
                href="/register?redirect=/"
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'h-9 text-xs px-3.5' })}
              >
                Sign up
              </Link>
            </div>
          )}

          {!loading && isAuthenticated && (
            <Dropdown>
              <DropdownTrigger className="flex items-center gap-2 rounded-full border border-ink-200 bg-white py-1 pl-1.5 pr-3 text-xs font-medium text-ink-700 shadow-xs hover:bg-ink-50">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-electric-600 text-[11px] font-semibold text-white">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span>{user?.name?.split(' ')[0] || 'Account'}</span>
                <ChevronDown className="h-3 w-3 text-ink-400" />
              </DropdownTrigger>
              <DropdownContent align="end" className="w-52 p-1.5 bg-white border border-ink-100 shadow-premium rounded-xl">
                <DropdownItem onSelect={() => router.push('/search')}>New Flight Search</DropdownItem>
                <DropdownItem onSelect={() => router.push('/dashboard')}>Saved Trips</DropdownItem>
                <DropdownItem onSelect={() => router.push('/profile')}>Profile & Preferences</DropdownItem>
                <div className="border-t border-ink-100 my-1" />
                <DropdownItem onSelect={logout} className="text-danger-600">
                  Log out
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
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

      {/* Mobile Drawer Menu */}
      <div
        id="mobile-menu"
        aria-hidden={!mobileOpen}
        {...(mobileOpen ? {} : { inert: 'true' })}
        className={cn(
          'overflow-y-auto border-t border-ink-100 bg-white md:hidden transition-all duration-300',
          mobileOpen ? 'max-h-[85vh] py-4' : 'max-h-0 border-t-0 py-0'
        )}
      >
        <div className="container-page flex flex-col gap-1">
          <div className="text-[11px] font-bold text-ink-400 uppercase tracking-wider px-3 mb-1">
            Flight Travel
          </div>
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50 hover:text-electric-600"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Aero AI Button */}
          <Link
            href="/ai-agent"
            id="mobile-nav-aero-ai-btn"
            title="Open Aero AI"
            aria-label="Open Aero AI"
            className="my-1 flex items-center justify-between rounded-xl border border-electric-200/80 bg-gradient-to-r from-electric-50 to-sky-50 px-3.5 py-2.5 text-sm font-semibold text-electric-900 transition-all hover:bg-electric-100/70"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-electric-600 text-white shadow-xs">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span>Aero AI Assistant</span>
            </div>
            <span className="rounded-full bg-electric-600 px-2 py-0.5 text-[11px] font-bold text-white tracking-wide">
              AI
            </span>
          </Link>

          <div className="text-[11px] font-bold text-ink-400 uppercase tracking-wider px-3 mt-4 mb-1">
            PM Workspace
          </div>
          {PM_WORKSPACE_LINKS.map((pm) => (
            <Link
              key={pm.href}
              href={pm.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-electric-600 flex items-center justify-between"
              onClick={() => setMobileOpen(false)}
            >
              <span>{pm.label}</span>
              <span className="text-[10px] text-ink-400">{pm.desc}</span>
            </Link>
          ))}

          <div className="mt-4 flex flex-col gap-2 border-t border-ink-100 pt-3">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className={cn(LOGIN_BUTTON_CLASSES, 'h-10 w-full text-sm')}>
                  Login
                </Link>
                <Link href="/register?redirect=/" className={buttonVariants({ className: 'w-full h-10 text-sm' })}>
                  Get started free
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm text-ink-700 font-medium">
                  Saved Trips & Dashboard
                </Link>
                <button onClick={logout} className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export { Navbar };
