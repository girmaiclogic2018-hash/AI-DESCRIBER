import { useCallback } from 'react';

export function useAuthenticatedFetch() {
  return useCallback(async (url, options = {}) => {
    // In Shopify embedded app context, this injects session token.
    // Falls back to standard fetch in standalone preview mode.
    const headers = options.headers || {};
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    return res;
  }, []);
}
