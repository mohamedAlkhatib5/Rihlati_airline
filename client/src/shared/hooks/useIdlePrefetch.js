import { useEffect } from 'react';

/**
 * Runs `task` once the browser has spare time after the first paint.
 *
 * Used to warm route chunks without competing with the initial render.
 */
export function useIdlePrefetch(task, timeout = 2000) {
  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(task, { timeout });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(task, 1200);
    return () => window.clearTimeout(id);
  }, [task, timeout]);
}
