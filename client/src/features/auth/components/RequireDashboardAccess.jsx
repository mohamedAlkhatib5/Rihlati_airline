import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { PageLoader } from '../../../shared/components/ui/PageLoader';
import { ROUTES } from '../../../app/routes/paths';
import { useAuth } from '../useAuth';

/**
 * Guards the dashboard.
 *
 * This is a convenience gate, not a security boundary — the API checks the
 * role on every request. Hiding the UI simply avoids showing a viewer screens
 * that would only return 403.
 */
export function RequireDashboardAccess() {
  const { canAccessDashboard, isRestoring } = useAuth();
  const location = useLocation();

  if (isRestoring) return <PageLoader />;

  if (!canAccessDashboard) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
