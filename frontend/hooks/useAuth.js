'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { authService } from '@/services/authService';
import { setSessionExpiredHandler } from '@/lib/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // In-flight restoration deduplication
  const restorePromiseRef = useRef(null);

  /**
   * Restore the existing session.
   * Runs once on initial app load, and can be invoked manually if needed.
   */
  const restoreSession = useCallback(async () => {
    if (restorePromiseRef.current) {
      return restorePromiseRef.current;
    }

    restorePromiseRef.current = (async () => {
      try {
        const token = await authService.silentRefresh();
        if (token) {
          try {
            const { user: me, subscription: sub } = await authService.me();
            setUser(me);
            setSubscription(sub);
            setAuthError(null);
            return me;
          } catch (err) {
            if (err?.status === 401 || err?.status === 403) {
              setUser(null);
              setSubscription(null);
              setAuthError({ type: 'unauthenticated' });
            } else {
              setAuthError({ type: 'network_error', message: err?.message || 'Network error' });
            }
            return null;
          }
        } else {
          // Silent refresh returned null (401 session invalid / no refresh cookie)
          setUser(null);
          setSubscription(null);
          setAuthError({ type: 'unauthenticated' });
          return null;
        }
      } catch (err) {
        // Network error during silentRefresh()
        setAuthError({ type: 'network_error', message: err?.message || 'Network error' });
        return null;
      } finally {
        setLoading(false);
        restorePromiseRef.current = null;
      }
    })();

    return restorePromiseRef.current;
  }, []);

  // Restore session once on initial app load
  useEffect(() => {
    let cancelled = false;

    // Listen for automatic token expiration from API client
    setSessionExpiredHandler(() => {
      if (!cancelled) {
        setUser(null);
        setSubscription(null);
        setAuthError({ type: 'unauthenticated' });
      }
    });

    restoreSession();

    return () => {
      cancelled = true;
      setSessionExpiredHandler(null);
    };
  }, [restoreSession]);

  /**
   * Normal email/password login.
   */
  const login = useCallback(async (credentials) => {
    const loggedInUser = await authService.login(credentials);
    setUser(loggedInUser);
    setAuthError(null);

    try {
      const { subscription: sub } = await authService.me();
      setSubscription(sub);
    } catch {
      // Subscription is non-critical.
    }

    return loggedInUser;
  }, []);

  /**
   * Register a new user.
   */
  const register = useCallback(async (details) => {
    return authService.register(details);
  }, []);

  /**
   * Logout the current user.
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setSubscription(null);
      setAuthError(null);
    }
  }, []);

  /**
   * Re-fetch user and subscription without reloading the page.
   * Used after successful payment/subscription updates.
   */
  const refetchUser = useCallback(async () => {
    try {
      const { user: me, subscription: sub } = await authService.me();
      setUser(me);
      setSubscription(sub);
    } catch {
      // Keep existing state if request fails
    }
  }, []);

  /**
   * Memoized context value prevents unnecessary re-renders.
   */
  const value = useMemo(
    () => ({
      user,
      subscription,
      loading,
      authError,
      login,
      register,
      logout,
      restoreSession,
      refetchUser,
      isAuthenticated: !!user,
    }),
    [
      user,
      subscription,
      loading,
      authError,
      login,
      register,
      logout,
      restoreSession,
      refetchUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return ctx;
}