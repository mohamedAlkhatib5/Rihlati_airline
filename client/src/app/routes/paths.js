/** Every route in the app, declared once so links can never drift. */
export const ROUTES = {
  home: '/',
  flights: '/flights',
  destinations: '/destinations',
  offers: '/offers',
  booking: '/booking',
  confirmation: '/booking/confirmed/:pnr',
  manageBooking: '/manage-booking',
  about: '/about',
  contact: '/contact',
  login: '/login',

  admin: '/admin',
  adminFlights: '/admin/flights',
  adminManifest: '/admin/flights/:flightId/manifest',
  adminBookings: '/admin/bookings',

  notFound: '*',
};

/** Anchors used for in-page navigation from the footer. */
export const SECTIONS = {
  services: 'services',
  newsletter: 'newsletter',
};

/** The dashboard renders in its own shell, without the marketing chrome. */
export const isDashboardPath = (pathname) => pathname.startsWith(ROUTES.admin);

/**
 * Routes that open with a dark photographic hero.
 *
 * The header floats transparently over those; everywhere else it needs a solid
 * background, or white nav links would sit on a pale page and vanish.
 */
const DARK_HERO_ROUTES = [
  ROUTES.home,
  ROUTES.flights,
  ROUTES.destinations,
  ROUTES.offers,
  ROUTES.about,
  ROUTES.contact,
  ROUTES.manageBooking,
  ROUTES.login,
];

export const hasDarkHero = (pathname) =>
  DARK_HERO_ROUTES.includes(pathname.replace(/\/$/, '') || '/');
