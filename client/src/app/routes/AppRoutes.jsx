import { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';

import { PageLoader } from '../../shared/components/ui/PageLoader';
import { ROUTES } from './paths';
import { routeLoaders } from './routeLoaders';

/**
 * Home ships in the initial bundle because it is the entry point for almost
 * every visit. The rest are code-split and prefetched while the browser is
 * idle (see `App`), so navigation stays instant without a loading flash.
 */
import HomePage from '../../features/home/HomePage';

const FlightsPage = lazy(routeLoaders[ROUTES.flights]);
const DestinationsPage = lazy(routeLoaders[ROUTES.destinations]);
const AboutPage = lazy(routeLoaders[ROUTES.about]);
const ContactPage = lazy(routeLoaders[ROUTES.contact]);
const NotFoundPage = lazy(routeLoaders[ROUTES.notFound]);

export function AppRoutes() {
  const location = useLocation();

  return (
    // AnimatePresence must own the keyed child, so the outgoing page can finish
    // its exit animation before React unmounts it.
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.flights} element={<FlightsPage />} />
          <Route path={ROUTES.destinations} element={<DestinationsPage />} />
          <Route path={ROUTES.about} element={<AboutPage />} />
          <Route path={ROUTES.contact} element={<ContactPage />} />
          <Route path={ROUTES.notFound} element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
