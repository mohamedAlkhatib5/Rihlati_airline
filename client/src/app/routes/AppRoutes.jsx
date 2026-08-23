import { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';

import { PageLoader } from '../../shared/components/ui/PageLoader';
import { RequireDashboardAccess } from '../../features/auth/components/RequireDashboardAccess';
import { SiteChrome } from '../../shared/components/layout/SiteChrome';
import { ROUTES } from './paths';
import { dashboardLoaders, routeLoaders } from './routeLoaders';

/**
 * Home ships in the initial bundle because it is the entry point for almost
 * every visit. The rest are code-split and prefetched while the browser is
 * idle (see `App`), so navigation stays instant without a loading flash.
 */
import HomePage from '../../features/home/HomePage';

const FlightsPage = lazy(routeLoaders[ROUTES.flights]);
const DestinationsPage = lazy(routeLoaders[ROUTES.destinations]);
const OffersPage = lazy(routeLoaders[ROUTES.offers]);
const BookingPage = lazy(routeLoaders[ROUTES.booking]);
const ConfirmationPage = lazy(routeLoaders[ROUTES.confirmation]);
const ManageBookingPage = lazy(routeLoaders[ROUTES.manageBooking]);
const AboutPage = lazy(routeLoaders[ROUTES.about]);
const ContactPage = lazy(routeLoaders[ROUTES.contact]);
const LoginPage = lazy(routeLoaders[ROUTES.login]);
const NotFoundPage = lazy(routeLoaders[ROUTES.notFound]);

const AdminLayout = lazy(() =>
  dashboardLoaders.layout().then((module) => ({ default: module.AdminLayout })),
);
const DashboardPage = lazy(dashboardLoaders.overview);
const AdminFlightsPage = lazy(dashboardLoaders.flights);
const AdminManifestPage = lazy(dashboardLoaders.manifest);
const AdminBookingsPage = lazy(dashboardLoaders.bookings);

export function AppRoutes() {
  const location = useLocation();

  return (
    // AnimatePresence must own the keyed child, so the outgoing page can finish
    // its exit animation before React unmounts it.
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Marketing and booking — header, footer and page transitions. */}
          <Route element={<SiteChrome />}>
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.flights} element={<FlightsPage />} />
            <Route path={ROUTES.destinations} element={<DestinationsPage />} />
            <Route path={ROUTES.offers} element={<OffersPage />} />
            <Route path={ROUTES.booking} element={<BookingPage />} />
            <Route path={ROUTES.confirmation} element={<ConfirmationPage />} />
            <Route
              path={ROUTES.manageBooking}
              element={<ManageBookingPage />}
            />
            <Route path={ROUTES.about} element={<AboutPage />} />
            <Route path={ROUTES.contact} element={<ContactPage />} />
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.notFound} element={<NotFoundPage />} />
          </Route>

          {/* Dashboard — its own shell, gated on role. */}
          <Route element={<RequireDashboardAccess />}>
            <Route path={ROUTES.admin} element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="flights" element={<AdminFlightsPage />} />
              <Route
                path="flights/:flightId/manifest"
                element={<AdminManifestPage />}
              />
              <Route path="bookings" element={<AdminBookingsPage />} />
            </Route>
          </Route>
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
