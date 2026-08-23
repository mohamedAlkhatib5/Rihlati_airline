import { useCallback, useEffect, useState } from 'react';

import { api } from '../../../shared/lib/apiClient';

/**
 * Fetches a read-only API resource and tracks its loading and error state.
 *
 * Returns `reload` so a screen can refresh after a mutation without a full
 * page navigation.
 */
export function useApiResource(path, params) {
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Serialised so the effect re-runs when a filter changes, not on every render.
  const key = JSON.stringify(params ?? {});

  const load = useCallback(
    async (signal) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get(path, JSON.parse(key));
        if (signal?.aborted) return;
        setData(response.data ?? response);
        setMeta(response.meta ?? null);
      } catch (caught) {
        if (!signal?.aborted) setError(caught);
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [path, key],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { data, meta, error, isLoading, reload: () => load() };
}
