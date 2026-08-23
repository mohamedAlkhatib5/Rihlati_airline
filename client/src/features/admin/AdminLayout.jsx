import { useState } from 'react';
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Plane,
  Ticket,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../app/routes/paths';
import { Logo } from '../../shared/components/brand/Logo';
import { cx } from '../../shared/lib/classNames';
import { useAuth } from '../auth/useAuth';
import './styles/admin.css';

const NAV = [
  {
    to: ROUTES.admin,
    end: true,
    icon: LayoutDashboard,
    labelKey: 'admin.nav.overview',
  },
  { to: ROUTES.adminFlights, icon: Plane, labelKey: 'admin.nav.flights' },
  { to: ROUTES.adminBookings, icon: Ticket, labelKey: 'admin.nav.bookings' },
];

export function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <div className={cx('admin', isSidebarOpen && 'admin--sidebar-open')}>
      <aside className="admin__sidebar">
        <div className="admin__brand">
          <Logo tone="light" size="sm" showTagline={false} />
          <span className="admin__brand-tag">{t('admin.title')}</span>
        </div>

        <nav className="admin__nav" aria-label={t('admin.title')}>
          {NAV.map(({ to, end, icon: Icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                cx('admin__nav-link', isActive && 'admin__nav-link--active')
              }
            >
              <Icon size={19} aria-hidden="true" />
              <span>{t(labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin__user">
          <p className="admin__user-name">{user?.name}</p>
          <p className="admin__user-role">{t(`admin.roles.${user?.role}`)}</p>
          <button
            type="button"
            className="admin__signout"
            onClick={handleSignOut}
          >
            <LogOut size={17} aria-hidden="true" />
            {t('admin.signOut')}
          </button>
        </div>
      </aside>

      <div className="admin__main">
        <header className="admin__topbar">
          <button
            type="button"
            className="admin__menu-toggle"
            onClick={() => setIsSidebarOpen((open) => !open)}
            aria-expanded={isSidebarOpen}
            aria-label={t(
              isSidebarOpen ? 'common.closeMenu' : 'common.openMenu',
            )}
          >
            {isSidebarOpen ? <Menu size={20} /> : <Menu size={20} />}
          </button>

          <p className="admin__date">
            <CalendarDays size={17} aria-hidden="true" />
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          <NavLink to={ROUTES.home} className="admin__back">
            {t('admin.viewSite')}
          </NavLink>
        </header>

        <main className="admin__content">
          <Outlet />
        </main>
      </div>

      {isSidebarOpen && (
        <button
          type="button"
          className="admin__scrim"
          aria-label={t('common.closeMenu')}
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={20} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
