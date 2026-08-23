import { ROUTES } from '../../app/routes/paths';

/**
 * Primary navigation. `labelKey` points at the i18n catalogue so the menu never
 * carries hard-coded copy.
 */
export const PRIMARY_NAV = [
  { path: ROUTES.home, labelKey: 'nav.home', end: true },
  { path: ROUTES.flights, labelKey: 'nav.flights' },
  { path: ROUTES.destinations, labelKey: 'nav.destinations' },
  { path: ROUTES.offers, labelKey: 'nav.offers' },
  { path: ROUTES.about, labelKey: 'nav.about' },
  { path: ROUTES.contact, labelKey: 'nav.contact' },
];
