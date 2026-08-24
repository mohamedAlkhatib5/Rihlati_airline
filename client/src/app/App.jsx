import { DemoNotice } from '../shared/components/feedback/DemoNotice';
import { ScrollManager } from '../shared/components/layout/ScrollManager';
import { useIdlePrefetch } from '../shared/hooks/useIdlePrefetch';
import { AppRoutes } from './routes/AppRoutes';
import { prefetchAllRoutes } from './routes/routeLoaders';
import './app.css';

export default function App() {
  // Warm every public route chunk once the first paint is done, so moving
  // between pages never falls back to a loading screen.
  useIdlePrefetch(prefetchAllRoutes);

  return (
    <div className="app-shell">
      <ScrollManager />
      <AppRoutes />
      <DemoNotice />
    </div>
  );
}
