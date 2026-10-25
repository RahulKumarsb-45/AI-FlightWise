import Link from 'next/link';
import { Suspense } from 'react';
import { Plane } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RouteArc } from '@/components/common/RouteArc';
import { PageSpinner } from '@/components/ui/Spinner';

export const metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2 bg-paper-50">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="group inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-electric-600 to-cyan-500 text-white shadow-soft transition-transform group-hover:scale-105">
              <Plane className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-tight text-ink-950">AI FlightWise</span>
              <span className="text-[10px] font-medium tracking-wider text-ink-400 uppercase -mt-1">Decision Intelligence</span>
            </div>
          </Link>

          <h1 className="mt-8 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-500">Log in to access your saved trips, price alerts, and Aero AI conversations.</p>

          <div className="mt-8">
            <Suspense fallback={<PageSpinner />}>
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-6 text-center text-sm text-ink-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-electric-600 hover:text-electric-700 hover:underline">
              Create free account
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden flex-col justify-between border-l border-navy-800 bg-navy-950 p-12 text-white lg:flex relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-electric-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <span className="rounded-full bg-navy-900/90 border border-navy-700 px-3 py-1 text-xs font-semibold text-cyan-300">
            Intelligent Flight Matrix
          </span>
          <span className="text-xs text-ink-400">v2.4 Production</span>
        </div>

        <div className="relative z-10 my-auto py-12 text-center">
          <div className="mx-auto max-w-md">
            <RouteArc width={420} height={160} showPlane />
            <h2 className="mt-6 font-display text-2xl font-bold text-white">
              Smarter Flights. Better Decisions.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-300">
              Stop guessing between 30 tabs. AI FlightWise transparently compares price, layovers, and alternate airports with multi-factor scoring.
            </p>
          </div>
        </div>

        <div className="relative z-10 border-t border-navy-800/80 pt-6 flex items-center justify-between text-xs text-ink-400">
          <span>Real airline prices & validated routes</span>
          <span>Powered by Aero AI</span>
        </div>
      </div>
    </main>
  );
}
