/** Every route in the app, declared once so links can never drift. */
export const ROUTES = {
  home: '/',
  flights: '/flights',
  destinations: '/destinations',
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
