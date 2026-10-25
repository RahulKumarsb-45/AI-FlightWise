'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PageSpinner } from '@/components/ui/Spinner';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, authError, restoreSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if authentication check has settled AND user is genuinely unauthenticated
    if (!loading && !isAuthenticated && authError?.type === 'unauthenticated') {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, authError, router]);

  if (loading) {
    return <PageSpinner label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    if (authError?.type === 'network_error') {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Connection Issue</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Unable to verify your session due to a temporary network problem. Please check your connection.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => restoreSession()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => router.replace('/login')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <PageSpinner label="Redirecting to login..." />;
  }

  return children;
}

export { ProtectedRoute };
