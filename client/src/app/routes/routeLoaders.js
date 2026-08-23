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
  [ROUTES.offers]: () => import('../../features/offers/OffersPage'),
  [ROUTES.booking]: () => import('../../features/booking/BookingPage'),
  [ROUTES.confirmation]: () =>
    import('../../features/booking/ConfirmationPage'),
  [ROUTES.manageBooking]: () =>
    import('../../features/manage-booking/ManageBookingPage'),
  [ROUTES.about]: () => import('../../features/about/AboutPage'),
  [ROUTES.contact]: () => import('../../features/contact/ContactPage'),
  [ROUTES.login]: () => import('../../features/auth/LoginPage'),
  [ROUTES.notFound]: () => import('../../features/not-found/NotFoundPage'),
};

/**
 * Dashboard chunks are deliberately excluded from idle prefetching: a visitor
 * who never signs in should not download the admin bundle at all.
 */
export const dashboardLoaders = {
  layout: () => import('../../features/admin/AdminLayout'),
  overview: () => import('../../features/admin/DashboardPage'),
  flights: () => import('../../features/admin/FlightsPage'),
  manifest: () => import('../../features/admin/ManifestPage'),
  bookings: () => import('../../features/admin/BookingsPage'),
};

const started = new Set();

/** Warms one route's chunk. Safe to call repeatedly — it only fetches once. */
export function prefetchRoute(path) {
  const load = routeLoaders[path];
  if (!load || started.has(path)) return;

  started.add(path);
  load().catch(() => started.delete(path));
}

/**
 * Warms the public routes once the browser is idle.
 *
 * The confirmation page is left out: it is only ever reached from the booking
 * flow, which has already pulled in its chunk.
 */
export function prefetchAllRoutes() {
  Object.keys(routeLoaders)
    .filter((path) => path !== ROUTES.confirmation)
    .forEach(prefetchRoute);
}
