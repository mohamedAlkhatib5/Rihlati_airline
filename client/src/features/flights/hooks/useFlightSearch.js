import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { searchFlights } from '../api/flightsApi';

/** Query keys the search endpoint understands. */
const SEARCH_KEYS = [
  'from',
  'to',
  'departure',
  'returnDate',
  'passengers',
  'cabin',
  'sort',
  'maxPrice',
];

/** Reads the search from the URL, so results are shareable and survive reload. */
export function useFlightSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const params = Object.fromEntries(
    SEARCH_KEYS.map((key) => [key, searchParams.get(key) ?? '']).filter(
      ([, value]) => value !== '',
    ),
  );

  const hasSearch = Boolean(params.from && params.to && params.departure);
  const key = JSON.stringify(params);

  useEffect(() => {
    if (!hasSearch) {
      setResults(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    searchFlights(JSON.parse(key))
      .then((response) => {
        if (controller.signal.aborted) return;
        setResults(response.data);
        setMeta(response.meta);
      })
      .catch((caught) => {
        if (!controller.signal.aborted) setError(caught);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [key, hasSearch]);

  /** Merges a partial change into the query string, keeping the rest intact. */
  const updateSearch = useCallback(
    (changes) => {
      const next = new URLSearchParams(searchParams);

      Object.entries(changes).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined)
          next.delete(key);
        else next.set(key, value);
      });

      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return {
    params,
    hasSearch,
    results,
    meta,
    error,
    isLoading,
    updateSearch,
    isRoundTrip: Boolean(params.returnDate),
  };
}
