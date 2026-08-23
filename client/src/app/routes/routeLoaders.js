import { ROUTES } from './paths';

/**
 * Dynamic imports for every code-split route.
 *
 * They are declared once and reused for both `React.lazy` and prefetching, so
 * a chunk is already in the browser cache by the time the visitor clicks —
 * which is what removes the blank Suspense flash between pages.
 */
export const routeLoaders = {
  [ROUTES.flights]: () => import('../../features/flights/FlightsPage'),
  [ROUTES.destinations]: () =>
    import('../../features/destinations/DestinationsPage'),
  [ROUTES.about]: () => import('../../features/about/AboutPage'),
  [ROUTES.contact]: () => import('../../features/contact/ContactPage'),
  [ROUTES.notFound]: () => import('../../features/not-found/NotFoundPage'),
};

const started = new Set();

/** Warms one route's chunk. Safe to call repeatedly — it only fetches once. */
export function prefetchRoute(path) {
  const load = routeLoaders[path];
  if (!load || started.has(path)) return;

  started.add(path);
  load().catch(() => started.delete(path));
}

/** Warms every route once the browser is idle after the first paint. */
export function prefetchAllRoutes() {
  Object.keys(routeLoaders).forEach(prefetchRoute);
}
