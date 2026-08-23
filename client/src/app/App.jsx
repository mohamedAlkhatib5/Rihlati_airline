import { MAIN_CONTENT_ID } from '../shared/constants/dom';
import { ScrollManager } from '../shared/components/layout/ScrollManager';
import { SiteFooter } from '../shared/components/layout/SiteFooter';
import { SiteHeader } from '../shared/components/layout/SiteHeader';
import { SkipLink } from '../shared/components/layout/SkipLink';
import { useIdlePrefetch } from '../shared/hooks/useIdlePrefetch';
import { AppRoutes } from './routes/AppRoutes';
import { prefetchAllRoutes } from './routes/routeLoaders';
import './app.css';

export default function App() {
  // Warm every route chunk once the first paint is done, so moving between
  // pages never falls back to a loading screen.
  useIdlePrefetch(prefetchAllRoutes);

  return (
    <div className="app-shell">
      <SkipLink />
      <ScrollManager />
      <SiteHeader />

      {/* `tabIndex={-1}` lets the skip link and route changes move focus here. */}
      <main id={MAIN_CONTENT_ID} className="app-main" tabIndex={-1}>
        <AppRoutes />
      </main>

      <SiteFooter />
    </div>
  );
}
