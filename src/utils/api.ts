import { API_URL } from '../config';

// Global refresh promise to deduplicate simultaneous 401 requests
let refreshPromise: Promise<string | null> | null = null;

export interface StoredTokens {
  token: string | null;
  refreshToken: string | null;
}

/**
 * Retrieve saved JWT access token and refresh token from localStorage
 */
export const getStoredTokens = (): StoredTokens => {
  if (typeof window === 'undefined') return { token: null, refreshToken: null };
  const token = localStorage.getItem('onwear_token') || localStorage.getItem('shopnest_token');
  const refreshToken = localStorage.getItem('onwear_refresh_token') || localStorage.getItem('shopnest_refresh_token');
  return { token, refreshToken };
};

/**
 * Save access token, refresh token and user info into localStorage
 */
export const setStoredTokens = (token: string, refreshToken?: string, user?: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('onwear_token', token);
  localStorage.setItem('shopnest_token', token);
  if (refreshToken) {
    localStorage.setItem('onwear_refresh_token', refreshToken);
    localStorage.setItem('shopnest_refresh_token', refreshToken);
  }
  if (user) {
    localStorage.setItem('onwear_user', JSON.stringify(user));
  }
  window.dispatchEvent(new CustomEvent('auth:session-updated', { detail: { token, refreshToken, user } }));
};

/**
 * Clean up all session tokens on logout or permanent expiration
 */
export const clearStoredTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('onwear_token');
  localStorage.removeItem('shopnest_token');
  localStorage.removeItem('onwear_refresh_token');
  localStorage.removeItem('shopnest_refresh_token');
  localStorage.removeItem('onwear_user');
  window.dispatchEvent(new CustomEvent('auth:logout'));
};

/**
 * Perform a silent token refresh using the stored refresh token.
 * Uses a single shared Promise so concurrent 401s do not trigger multiple refresh calls.
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  const { refreshToken } = getStoredTokens();
  if (!refreshToken) {
    return null;
  }

  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.token) {
        const newToken = data.data.token;
        const newRefreshToken = data.data.refreshToken || refreshToken;
        setStoredTokens(newToken, newRefreshToken, data.data.user);
        return newToken;
      } else {
        clearStoredTokens();
        return null;
      }
    } catch (err) {
      console.error('[SilentRefresh] Error refreshing access token:', err);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Intelligent fetch wrapper with automatic Authorization header and silent 401 token refresh retry.
 */
export const authFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const { token } = getStoredTokens();

  const headers = new Headers(init?.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const modifiedInit: RequestInit = {
    ...init,
    headers
  };

  let response: Response;
  try {
    response = await fetch(input, modifiedInit);
  } catch (err) {
    throw err;
  }

  // If 401 Unauthorized, attempt silent refresh and retry
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryHeaders = new Headers(init?.headers || {});
      retryHeaders.set('Authorization', `Bearer ${newToken}`);
      return await fetch(input, {
        ...init,
        headers: retryHeaders
      });
    } else {
      // If refresh failed and this is an admin route in browser, redirect to login
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        window.location.href = `/login?expired=true&redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }
  }

  return response;
};
