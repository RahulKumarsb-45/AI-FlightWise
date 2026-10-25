'use client';

import { useEffect } from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error('[Global ErrorBoundary caught error]:', error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertOctagon className="h-10 w-10 text-danger-500" />
      <h1 className="font-display text-2xl text-ink-900">
        Something went wrong
      </h1>
      <p className="max-w-sm text-ink-500">
        An unexpected error occurred while loading this page. You can try again, or head back to the homepage.
      </p>
      {process.env.NODE_ENV !== 'production' && error?.message && (
        <p className="max-w-xl text-center text-xs bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-200 font-mono">
          {error.message}
        </p>
      )}
      <Button onClick={() => reset()}>Try again</Button>
    </main>
  );
}