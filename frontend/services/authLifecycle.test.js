import { test } from 'node:test';
import assert from 'node:assert/strict';
import { api, setAccessToken, getAccessToken, setSessionExpiredHandler } from '../lib/apiClient.js';
import { authService } from './authService.js';

test('authLifecycle: silentRefresh deduplicates concurrent refresh calls into a single network request', async () => {
  let fetchCallCount = 0;
  const originalFetch = global.fetch;

  global.fetch = async (url, opts) => {
    if (url.includes('/auth/refresh')) {
      fetchCallCount++;
      // Simulate network latency
      await new Promise((r) => setTimeout(r, 50));
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { accessToken: 'new-mock-jwt-token' },
        }),
      };
    }
    return originalFetch(url, opts);
  };

  try {
    setAccessToken(null);
    // Fire 3 simultaneous silent refresh requests
    const [res1, res2, res3] = await Promise.all([
      authService.silentRefresh(),
      authService.silentRefresh(),
      authService.silentRefresh(),
    ]);

    assert.equal(fetchCallCount, 1, 'Only one network call should be made for concurrent refreshes');
    assert.equal(res1, 'new-mock-jwt-token');
    assert.equal(res2, 'new-mock-jwt-token');
    assert.equal(res3, 'new-mock-jwt-token');
    assert.equal(getAccessToken(), 'new-mock-jwt-token');
  } finally {
    global.fetch = originalFetch;
    setAccessToken(null);
  }
});

test('authLifecycle: concurrent API requests share a single refresh operation when token is missing/expired', async () => {
  let refreshCalls = 0;
  const originalFetch = global.fetch;

  global.fetch = async (url, opts) => {
    if (url.includes('/auth/refresh')) {
      refreshCalls++;
      await new Promise((r) => setTimeout(r, 30));
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { accessToken: 'refreshed-token-abc' },
        }),
      };
    }

    if (url.includes('/test-resource')) {
      const authHeader = opts?.headers?.Authorization;
      if (!authHeader || authHeader === 'Bearer expired-token') {
        return {
          ok: false,
          status: 401,
          clone: () => ({
            json: async () => ({ errorCode: 'AUTH_TOKEN_EXPIRED' }),
          }),
          json: async () => ({ errorCode: 'AUTH_TOKEN_EXPIRED', message: 'Token expired' }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: 'resource-ok' }),
      };
    }

    return originalFetch(url, opts);
  };

  try {
    setAccessToken('expired-token');

    // Run 2 parallel requests that hit 401
    const [result1, result2] = await Promise.all([
      api.get('/test-resource'),
      api.get('/test-resource'),
    ]);

    assert.equal(refreshCalls, 1, 'Exactly one token refresh should have executed for concurrent expired requests');
    assert.equal(result1.data, 'resource-ok');
    assert.equal(result2.data, 'resource-ok');
    assert.equal(getAccessToken(), 'refreshed-token-abc');
  } finally {
    global.fetch = originalFetch;
    setAccessToken(null);
  }
});

test('authLifecycle: network failure during silent refresh does NOT invoke onSessionExpired', async () => {
  let sessionExpiredCalled = false;
  setSessionExpiredHandler(() => {
    sessionExpiredCalled = true;
  });

  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    if (url.includes('/auth/refresh')) {
      throw new TypeError('Failed to fetch (network offline)');
    }
  };

  try {
    let threw = false;
    try {
      await authService.silentRefresh();
    } catch (e) {
      threw = true;
      assert(e instanceof TypeError);
    }

    assert.equal(threw, true, 'Network error should propagate');
    assert.equal(sessionExpiredCalled, false, 'Session must not be marked expired due to a network glitch');
  } finally {
    global.fetch = originalFetch;
    setSessionExpiredHandler(null);
    setAccessToken(null);
  }
});

test('authLifecycle: genuine 401 on refresh triggers onSessionExpired and clears access token', async () => {
  let sessionExpiredCalled = false;
  setSessionExpiredHandler(() => {
    sessionExpiredCalled = true;
  });

  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    if (url.includes('/auth/refresh')) {
      return {
        ok: false,
        status: 401,
        json: async () => ({
          errorCode: 'AUTH_TOKEN_EXPIRED',
          message: 'Refresh token expired',
        }),
      };
    }
  };

  try {
    setAccessToken('stale-token');
    const token = await authService.silentRefresh();

    assert.equal(token, null, 'Must return null when session is expired');
    assert.equal(sessionExpiredCalled, true, 'onSessionExpired must be triggered on 401');
    assert.equal(getAccessToken(), null, 'Access token must be cleared');
  } finally {
    global.fetch = originalFetch;
    setSessionExpiredHandler(null);
    setAccessToken(null);
  }
});

test('authLifecycle: logout clears in-memory access token and calls /auth/logout', async () => {
  let logoutCalled = false;
  const originalFetch = global.fetch;

  global.fetch = async (url, opts) => {
    if (url.includes('/auth/logout')) {
      logoutCalled = true;
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      };
    }
    return originalFetch(url, opts);
  };

  try {
    setAccessToken('active-user-token');
    assert.equal(getAccessToken(), 'active-user-token');

    await authService.logout();

    assert.equal(logoutCalled, true);
    assert.equal(getAccessToken(), null, 'Access token must be cleared on logout');
  } finally {
    global.fetch = originalFetch;
    setAccessToken(null);
  }
});
