import { useEffect, useState } from 'react';
import { Container, Nav, Navbar, Offcanvas } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../../app/routes/paths';
import { prefetchRoute } from '../../../app/routes/routeLoaders';
import { PRIMARY_NAV } from '../../constants/navigation';
import { useIsScrolled } from '../../hooks/useIsScrolled';
import { useLanguage } from '../../../i18n/useLanguage';
import { cx } from '../../lib/classNames';
import { Logo } from '../brand/Logo';
import { NavActions } from './NavActions';
import './site-header.css';

const MENU_ID = 'primary-navigation';

export function SiteHeader() {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const { pathname } = useLocation();
  const isScrolled = useIsScrolled(24);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close the mobile menu whenever navigation happens.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <Navbar
      expand="lg"
      fixed="top"
      expanded={isMenuOpen}
      onToggle={setIsMenuOpen}
      className={cx('site-header', isScrolled && 'site-header--scrolled')}
    >
      <Container className="site-header__container">
        <Navbar.Brand
          as={NavLink}
          to={ROUTES.home}
          className="site-header__brand"
        >
          <Logo tone="light" />
        </Navbar.Brand>

        {/* react-bootstrap applies its own `aria-label` from the `label` prop
            after spreading, so the translated name has to go through `label`. */}
        <Navbar.Toggle
          aria-controls={MENU_ID}
          label={isMenuOpen ? t('common.closeMenu') : t('common.openMenu')}
          aria-expanded={isMenuOpen}
        />

        <Navbar.Offcanvas
          id={MENU_ID}
          aria-labelledby={`${MENU_ID}-title`}
          placement={isArabic ? 'start' : 'end'}
          className="site-header__panel"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={`${MENU_ID}-title`}>
              <Logo tone="dark" size="sm" />
            </Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body className="site-header__body">
            <Nav as="ul" className="site-header__links">
              {PRIMARY_NAV.map(({ path, labelKey, end }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    end={end}
                    // Fetch the target page's chunk as soon as there is intent
                    // to visit it, so the click itself renders instantly.
                    onMouseEnter={() => prefetchRoute(path)}
                    onFocus={() => prefetchRoute(path)}
                    className={({ isActive }) =>
                      cx('nav-link-item', isActive && 'nav-link-item--active')
                    }
                  >
                    <span>{t(labelKey)}</span>
                  </NavLink>
                </li>
              ))}
            </Nav>

            <NavActions />
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}
