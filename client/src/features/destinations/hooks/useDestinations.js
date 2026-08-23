import { useEffect, useState } from 'react';

import { api } from '../../../shared/lib/apiClient';
import { destinations as fallback } from '../data/destinations';

/**
 * Destinations from the API, with the bundled catalogue as a fallback.
 *
 * The marketing pages must still render if the API is unreachable — a visitor
 * should never meet an empty destinations page because a server restarted.
 */
export function useDestinations({ featured = false } = {}) {
  const [destinations, setDestinations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    api
      .get('/destinations', featured ? { featured: 1 } : undefined)
      .then((response) => {
        if (controller.signal.aborted) return;
        setDestinations(response.data);
        setIsFallback(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setDestinations(
          featured ? fallback.filter((item) => item.featured) : fallback,
        );
        setIsFallback(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [featured]);

  return { destinations: destinations ?? [], isLoading, isFallback };
}
