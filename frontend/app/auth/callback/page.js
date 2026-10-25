'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { trackLogin } from '@/lib/analytics';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const handledRef = useRef(false);

  useEffect(() => {
    if (loading || handledRef.current) return;

    if (isAuthenticated && user) {
      handledRef.current = true;
      trackLogin({ method: 'oauth' });
      router.replace('/dashboard');
    } else {
      handledRef.current = true;
      router.replace('/login?error=oauth_failed');
    }
  }, [loading, isAuthenticated, user, router]);

  return <PageSpinner label="Finishing sign-in..." />;
}