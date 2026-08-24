/**
 * A copy of the Rihlati API that runs inside the browser.
 *
 * Free static hosting cannot run Laravel or MySQL, so a public link would only
 * show the marketing pages: no flight search, no booking, no dashboard. This
 * module answers the same routes with the same response shapes, backed by
 * session state instead of a database.
 *
 * It activates only when `VITE_DEMO_MODE` is true. In a real deployment none
 * of this runs and `server/` stays the single source of truth.
 *
 * Faithful to the API where it matters:
 *   - Fares come from the schedule, never from the request.
 *   - Dashboard routes reject anyone who is not admin or staff.
 *   - PNRs and payment references are random.
 *
 * Not simulated: password hashing, rate limits, email. This is demonstration
 * data in one visitor's browser and it never leaves it.
 */
import { destinations as DESTINATIONS } from '../../../features/destinations/data/destinations';
import { DEMO_USERS, OFFERS } from './network';
import { buildNetwork, rand } from './schedule';

const CABIN_ORDER = ['economy', 'premium', 'business', 'first'];
const PNR_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';

export class DemoError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const randomCode = (length, alphabet = PNR_ALPHABET) =>
  Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((byte) => alphabet[byte % alphabet.length])
    .join('');

/* ------------------------------------------------------------------ state */

let db = null;

function boot() {
  const { airports, fleet, flights } = buildNetwork();

  const today = new Date();
  const iso = (offsetDays) => {
    const date = new Date(today);
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().slice(0, 10);
  };

  const bySlug = new Map(DESTINATIONS.map((destination) => [destination.id, destination]));

  const offers = OFFERS.map(([code, titleEn, titleAr, descEn, descAr, slug, type, value, days], index) => ({
    id: index + 1,
    code,
    title: { en: titleEn, ar: titleAr },
    description: { en: descEn, ar: descAr },
    discountType: type,
    discountValue: value,
    validFrom: iso(-5),
    validTo: iso(days),
    isActive: true,
    destination: slug && bySlug.has(slug)
      ? {
          id: slug,
          image: bySlug.get(slug).image,
          priceFrom: bySlug.get(slug).priceFrom,
          city: bySlug.get(slug).city,
        }
      : null,
  }));

  const state = {
    airports,
    airportsById: new Map(airports.map((airport) => [airport.id, airport])),
    fleet: new Map(fleet.map((aircraft) => [aircraft.id, aircraft])),
    flights,
    flightsById: new Map(flights.map((flight) => [flight.id, flight])),
    offers,
    bookings: [],
    messages: [],
    users: DEMO_USERS.map((user) => ({ ...user })),
    session: null,
    nextIds: { booking: 1, segment: 1, passenger: 1, message: 1, user: 100 },
  };

  seedHistory(state);
  return state;
}

/**
 * Past bookings so the dashboard has something to chart.
 *
 * Deterministic: the same twelve months of revenue every time the demo loads,
 * which keeps the charts stable while a visitor clicks around.
 */
function seedHistory(state) {
  const departed = state.flights.filter((flight) => flight.fares.length > 0);
  const names = [
    ['Layla', 'Haddad'], ['Omar', 'Nasser'], ['Sara', 'Khalil'], ['Yusuf', 'Rahman'],
    ['Nour', 'Aziz'], ['Karim', 'Saleh'], ['Hana', 'Darwish'], ['Adam', 'Farouk'],
    ['Mariam', 'Zayed'], ['Tariq', 'Mansour'], ['Dina', 'Sami'], ['Rami', 'Habib'],
  ];
  const statuses = ['confirmed', 'confirmed', 'confirmed', 'completed', 'completed', 'pending', 'cancelled'];

  for (let index = 0; index < 140; index += 1) {
    const flight = departed[Math.floor(rand(index * 3 + 1) * departed.length)];
    const fare = flight.fares[Math.floor(rand(index * 5 + 2) * flight.fares.length)];
    const travellers = 1 + Math.floor(rand(index * 7 + 3) * 3);
    const [firstName, lastName] = names[index % names.length];

    const created = new Date();
    created.setDate(created.getDate() - Math.floor(rand(index * 11 + 4) * 330));

    const subtotal = fare.price * travellers;
    const status = statuses[index % statuses.length];

    const booking = {
      id: state.nextIds.booking++,
      pnr: randomCode(6),
      status,
      tripType: 'one',
      contactEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      contactPhone: '+971 50 000 0000',
      currency: 'USD',
      subtotalAmount: subtotal,
      discountAmount: 0,
      totalAmount: subtotal,
      createdAt: created.toISOString(),
      offerCode: null,
      userId: null,
      segments: [
        {
          id: state.nextIds.segment++,
          direction: 'outbound',
          cabin: fare.cabin,
          flightId: flight.id,
        },
      ],
      passengers: Array.from({ length: travellers }, (_, seat) => ({
        id: state.nextIds.passenger++,
        segmentId: state.nextIds.segment - 1,
        firstName: seat === 0 ? firstName : names[(index + seat) % names.length][0],
        lastName,
        fullName: `${seat === 0 ? firstName : names[(index + seat) % names.length][0]} ${lastName}`,
        type: 'adult',
        seatNumber: `${10 + ((index + seat) % 30)}${'ABCDEF'[(index + seat) % 6]}`,
        checkedIn: rand(index + seat) > 0.55,
        passportNumber: `P${randomCode(7, '0123456789')}`,
      })),
      payment: {
        reference: `PAY-${randomCode(8)}`,
        status: 'paid',
        amount: subtotal,
        method: 'card',
        cardBrand: 'Visa',
        cardLast4: String(1000 + Math.floor(rand(index * 13) * 9000)).slice(0, 4),
        paidAt: created.toISOString(),
      },
    };

    state.bookings.push(booking);
  }

  state.bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const subjects = [
    ['Group booking for twelve', 'We are travelling as a group of twelve to Istanbul in March. Can you hold seats together?'],
    ['Special assistance', 'My mother uses a wheelchair. What assistance is available at Dubai?'],
    ['Baggage allowance', 'How much checked baggage is included in a premium economy fare to London?'],
    ['Refund status', 'I cancelled last week and would like to check where the refund is.'],
  ];

  state.messages = subjects.map(([subject, body], index) => {
    const created = new Date();
    created.setDate(created.getDate() - index * 2);

    return {
      id: state.nextIds.message++,
      name: names[index][0] + ' ' + names[index][1],
      email: `${names[index][0].toLowerCase()}@example.com`,
      subject,
      message: body,
      status: index < 2 ? 'new' : 'read',
      created_at: created.toISOString(),
    };
  });
}

const store = () => (db ??= boot());

export function resetDemo() {
  db = null;
}

/* -------------------------------------------------------------- shaping */

function airportShape(airport) {
  return {
    iata: airport.iata,
    city: airport.city,
    country: airport.country,
    name: airport.name,
  };
}

function flightShape(state, flight, fares = flight.fares) {
  const aircraft = state.fleet.get(flight.aircraftId);

  return {
    id: flight.id,
    flightNumber: flight.flightNumber,
    departureAt: flight.departureAt,
    arrivalAt: flight.arrivalAt,
    durationMinutes: flight.durationMinutes,
    stops: flight.stops,
    status: flight.status,
    basePrice: flight.basePrice,
    aircraft: { model: aircraft.model, registration: aircraft.registration },
    origin: airportShape(state.airportsById.get(flight.originId)),
    destination: airportShape(state.airportsById.get(flight.destinationId)),
    fares: fares.map((fare) => ({
      id: fare.id,
      cabin: fare.cabin,
      price: fare.price,
      seatsAvailable: fare.seatsAvailable,
      seatsTotal: fare.seatsTotal,
    })),
  };
}

function bookingShape(state, booking, { includePassport = false } = {}) {
  return {
    pnr: booking.pnr,
    status: booking.status,
    tripType: booking.tripType,
    contactEmail: booking.contactEmail,
    contactPhone: booking.contactPhone,
    currency: booking.currency,
    subtotalAmount: booking.subtotalAmount,
    discountAmount: booking.discountAmount,
    totalAmount: booking.totalAmount,
    createdAt: booking.createdAt,
    offerCode: booking.offerCode,
    segments: booking.segments.map((segment) => ({
      id: segment.id,
      direction: segment.direction,
      cabin: segment.cabin,
      flight: flightShape(state, state.flightsById.get(segment.flightId)),
    })),
    passengers: booking.passengers.map((passenger) => ({
      id: passenger.id,
      segmentId: passenger.segmentId,
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      fullName: passenger.fullName,
      type: passenger.type,
      seatNumber: passenger.seatNumber,
      checkedIn: passenger.checkedIn,
      ...(includePassport ? { passportNumber: passenger.passportNumber } : null),
    })),
    payment: booking.payment,
  };
}

const userShape = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  isActive: true,
  canAccessDashboard: user.role === 'admin' || user.role === 'staff',
  createdAt: new Date(2026, 0, 1).toISOString(),
});

/* ------------------------------------------------------------- guards */

function currentUser(state) {
  return state.session ? state.users.find((user) => user.id === state.session) ?? null : null;
}

function requireDashboard(state) {
  const user = currentUser(state);
  if (!user) throw new DemoError(401, 'Unauthenticated.');
  if (user.role !== 'admin' && user.role !== 'staff') {
    throw new DemoError(403, 'This account cannot access the dashboard.');
  }
  return user;
}

function requireAdmin(state) {
  const user = requireDashboard(state);
  if (user.role !== 'admin') throw new DemoError(403, 'Administrators only.');
  return user;
}

/* -------------------------------------------------------------- helpers */

function resolveAirport(state, term) {
  const value = String(term ?? '').trim().toLowerCase();
  if (!value) return null;

  return (
    state.airports.find((airport) => airport.iata.toLowerCase() === value) ??
    state.airports.find(
      (airport) =>
        airport.city.en.toLowerCase().startsWith(value) ||
        airport.city.ar.startsWith(term.trim()),
    ) ??
    null
  );
}

function paginate(rows, page = 1, perPage = 20) {
  const currentPage = Math.max(1, Number(page) || 1);
  const size = Math.min(100, Number(perPage) || 20);
  const start = (currentPage - 1) * size;

  return {
    items: rows.slice(start, start + size),
    meta: {
      currentPage,
      lastPage: Math.max(1, Math.ceil(rows.length / size)),
      perPage: size,
      total: rows.length,
    },
  };
}

const monthKey = (iso) => iso.slice(0, 7);

/* --------------------------------------------------------------- routes */

const routes = [
  ['GET', /^\/health$/, () => ({ status: 'ok', service: 'Rihlati (demo)', time: new Date().toISOString() })],

  /* ------------------------------------------------------------ public */

  ['GET', /^\/destinations$/, (state, _m, _b, query) => {
    const featured = query.get('featured');
    const rows = featured ? DESTINATIONS.filter((item) => item.featured) : DESTINATIONS;
    return { data: rows };
  }],

  ['GET', /^\/destinations\/([^/]+)$/, (state, match) => {
    const destination = DESTINATIONS.find((item) => item.id === match[1]);
    if (!destination) throw new DemoError(404, 'Destination not found.');
    return { data: destination };
  }],

  ['GET', /^\/flights\/search$/, (state, _m, _b, query) => {
    const origin = resolveAirport(state, query.get('from'));
    const destination = resolveAirport(state, query.get('to'));
    const departure = query.get('departure');
    const returnDate = query.get('returnDate');
    const passengers = Math.max(1, Number(query.get('passengers')) || 1);
    const cabin = query.get('cabin');
    const maxPrice = query.get('maxPrice') ? Number(query.get('maxPrice')) : null;
    const maxStops = query.get('maxStops') ? Number(query.get('maxStops')) : null;
    const sort = query.get('sort') ?? 'departure';

    if (!origin || !destination) {
      return { message: 'We do not fly from or to that city yet.', data: { outbound: [], return: [] } };
    }

    const leg = (fromId, toId, date) => {
      if (!date) return [];

      return state.flights
        .filter((flight) => flight.originId === fromId && flight.destinationId === toId)
        .filter((flight) => flight.departureAt.slice(0, 10) === date)
        .filter((flight) => maxStops === null || flight.stops <= maxStops)
        .map((flight) => {
          const fares = flight.fares
            .filter((fare) => fare.seatsAvailable >= passengers)
            .filter((fare) => !cabin || fare.cabin === cabin)
            .filter((fare) => maxPrice === null || fare.price <= maxPrice)
            .sort((a, b) => a.price - b.price);

          return { flight, fares };
        })
        .filter(({ fares }) => fares.length > 0)
        .sort((a, b) => {
          if (sort === 'price') return a.flight.basePrice - b.flight.basePrice;
          if (sort === 'duration') return a.flight.durationMinutes - b.flight.durationMinutes;
          return a.flight.departureAt.localeCompare(b.flight.departureAt);
        })
        .slice(0, 40)
        .map(({ flight, fares }) => flightShape(state, flight, fares));
    };

    const outbound = leg(origin.id, destination.id, departure);
    const inbound = returnDate ? leg(destination.id, origin.id, returnDate) : [];

    return {
      data: { outbound, return: inbound },
      meta: {
        origin: origin.iata,
        destination: destination.iata,
        passengers,
        outboundCount: outbound.length,
        returnCount: inbound.length,
      },
    };
  }],

  ['GET', /^\/flights\/(\d+)\/seat-map$/, (state, match, _b, query) => {
    const flight = state.flightsById.get(Number(match[1]));
    if (!flight) throw new DemoError(404, 'Flight not found.');

    const cabin = query.get('cabin') ?? 'economy';
    const aircraft = state.fleet.get(flight.aircraftId);
    const fare = flight.fares.find((candidate) => candidate.cabin === cabin);
    if (!fare) throw new DemoError(422, 'That cabin is not sold on this flight.', { cabin: ['Unavailable'] });

    const letters = 'ABCDEFGHJK'.slice(0, aircraft.seatsPerRow).split('');
    const rows = Math.ceil(fare.seatsTotal / aircraft.seatsPerRow);
    const startRow = CABIN_ORDER.indexOf(cabin) * 20 + 1;

    const taken = new Set(
      state.bookings
        .filter((booking) => booking.segments.some((segment) => segment.flightId === flight.id))
        .flatMap((booking) => booking.passengers.map((passenger) => passenger.seatNumber)),
    );

    const seats = [];
    for (let row = 0; row < rows; row += 1) {
      for (const letter of letters) {
        const number = startRow + row;
        const seat = `${number}${letter}`;
        seats.push({
          seat,
          row: number,
          letter,
          available: !taken.has(seat) && rand(flight.id + number + letter.charCodeAt(0)) > 0.25,
        });
      }
    }

    return {
      data: {
        flightNumber: flight.flightNumber,
        cabin,
        seatsPerRow: aircraft.seatsPerRow,
        seats,
      },
    };
  }],

  ['GET', /^\/offers$/, (state) => ({ data: state.offers })],

  ['POST', /^\/offers\/validate$/, (state, _m, body) => {
    const code = String(body?.code ?? '').trim().toUpperCase();
    const offer = state.offers.find((candidate) => candidate.code === code && candidate.isActive);

    if (!offer) throw new DemoError(422, 'That promotion code is not valid.', { code: ['Unknown code.'] });

    const subtotal = Number(body?.subtotal ?? 0);
    const discount = offer.discountType === 'percent'
      ? Math.round((subtotal * offer.discountValue) / 100)
      : Math.min(offer.discountValue, subtotal);

    return { data: { ...offer, discount } };
  }],

  ['POST', /^\/contact$/, (state, _m, body) => {
    if (!body?.message || String(body.message).trim().length < 10) {
      throw new DemoError(422, 'The given data was invalid.', { message: ['Tell us a little more.'] });
    }

    state.messages.unshift({
      id: state.nextIds.message++,
      name: body.name,
      email: body.email,
      subject: body.subject ?? 'General enquiry',
      message: body.message,
      status: 'new',
      created_at: new Date().toISOString(),
    });

    return { message: 'Thank you. Our team will reply shortly.' };
  }],

  ['POST', /^\/newsletter$/, () => ({ message: 'You are subscribed.' })],

  /* ---------------------------------------------------------- bookings */

  ['POST', /^\/bookings$/, (state, _m, body) => {
    const travellers = body?.passengers ?? [];
    if (travellers.length === 0) throw new DemoError(422, 'Add at least one passenger.');

    const findFare = (fareId) => {
      for (const flight of state.flights) {
        const fare = flight.fares.find((candidate) => candidate.id === Number(fareId));
        if (fare) return { flight, fare };
      }
      return null;
    };

    const outbound = findFare(body.outboundFareId);
    if (!outbound) throw new DemoError(422, 'That fare is no longer available.');

    const inbound = body.returnFareId ? findFare(body.returnFareId) : null;

    // Prices come from the schedule, never from the request.
    const subtotal =
      outbound.fare.price * travellers.length +
      (inbound ? inbound.fare.price * travellers.length : 0);

    let discount = 0;
    let offerCode = null;

    if (body.offerCode) {
      const offer = state.offers.find(
        (candidate) => candidate.code === String(body.offerCode).trim().toUpperCase(),
      );
      if (offer) {
        offerCode = offer.code;
        discount = offer.discountType === 'percent'
          ? Math.round((subtotal * offer.discountValue) / 100)
          : Math.min(offer.discountValue, subtotal);
      }
    }

    const user = currentUser(state);
    const now = new Date().toISOString();

    const makeSegment = (leg, direction, seats) => {
      const segmentId = state.nextIds.segment++;

      return {
        segment: { id: segmentId, direction, cabin: leg.fare.cabin, flightId: leg.flight.id },
        passengers: travellers.map((traveller, index) => ({
          id: state.nextIds.passenger++,
          segmentId,
          firstName: traveller.firstName,
          lastName: traveller.lastName,
          fullName: `${traveller.firstName} ${traveller.lastName}`,
          type: traveller.type ?? 'adult',
          seatNumber: seats?.[index] ?? null,
          checkedIn: false,
          passportNumber: traveller.passportNumber ?? null,
        })),
      };
    };

    const legs = [makeSegment(outbound, 'outbound', body.seats?.outbound)];
    if (inbound) legs.push(makeSegment(inbound, 'return', body.seats?.return));

    const total = subtotal - discount;

    const booking = {
      id: state.nextIds.booking++,
      pnr: randomCode(6),
      status: 'confirmed',
      tripType: inbound ? 'round' : 'one',
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone ?? null,
      currency: 'USD',
      subtotalAmount: subtotal,
      discountAmount: discount,
      totalAmount: total,
      createdAt: now,
      offerCode,
      userId: user?.id ?? null,
      segments: legs.map((leg) => leg.segment),
      passengers: legs.flatMap((leg) => leg.passengers),
      payment: {
        reference: `PAY-${randomCode(8)}`,
        status: 'paid',
        amount: total,
        method: body.payment?.method ?? 'card',
        cardBrand: body.payment?.cardBrand ?? null,
        cardLast4: body.payment?.cardLast4 ?? null,
        paidAt: now,
      },
    };

    state.bookings.unshift(booking);

    return {
      message: 'Your booking is confirmed. A confirmation email is on its way.',
      data: bookingShape(state, booking),
    };
  }],

  ['GET', /^\/bookings\/([^/]+)$/, (state, match) => {
    const pnr = decodeURIComponent(match[1]).toUpperCase();
    const booking = state.bookings.find((candidate) => candidate.pnr === pnr);
    if (!booking) throw new DemoError(404, 'We could not find a booking with that reference.');

    return { data: bookingShape(state, booking) };
  }],

  ['POST', /^\/bookings\/([^/]+)\/cancel$/, (state, match) => {
    const pnr = decodeURIComponent(match[1]).toUpperCase();
    const booking = state.bookings.find((candidate) => candidate.pnr === pnr);
    if (!booking) throw new DemoError(404, 'We could not find a booking with that reference.');
    if (booking.status === 'cancelled') throw new DemoError(422, 'This booking is already cancelled.');

    booking.status = 'cancelled';

    return { message: 'Your booking has been cancelled.', data: bookingShape(state, booking) };
  }],

  /* -------------------------------------------------------------- auth */

  ['POST', /^\/auth\/login$/, (state, _m, body) => {
    const email = String(body?.email ?? '').toLowerCase();
    const user = state.users.find((candidate) => candidate.email.toLowerCase() === email);

    if (!user || user.password !== body?.password) {
      throw new DemoError(422, 'Email or password is incorrect.');
    }

    state.session = user.id;

    return {
      user: userShape(user),
      access_token: `demo.${user.id}`,
      refresh_token: `demo-refresh.${user.id}`,
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }],

  ['POST', /^\/auth\/register$/, (state, _m, body) => {
    const email = String(body?.email ?? '').toLowerCase();

    if (state.users.some((candidate) => candidate.email.toLowerCase() === email)) {
      throw new DemoError(422, 'That email is already registered.', { email: ['Already taken.'] });
    }

    const user = {
      id: state.nextIds.user++,
      name: body.name,
      email,
      password: body.password,
      role: 'customer',
      phone: body.phone ?? null,
    };

    state.users.push(user);
    state.session = user.id;

    return {
      user: userShape(user),
      access_token: `demo.${user.id}`,
      refresh_token: `demo-refresh.${user.id}`,
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }],

  ['POST', /^\/auth\/refresh$/, (state, _m, body) => {
    const id = Number(String(body?.refresh_token ?? '').split('.')[1]);
    const user = state.users.find((candidate) => candidate.id === id);
    if (!user) throw new DemoError(401, 'Session expired.');

    state.session = user.id;

    return {
      user: userShape(user),
      access_token: `demo.${user.id}`,
      refresh_token: `demo-refresh.${user.id}`,
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }],

  ['POST', /^\/auth\/logout$/, (state) => {
    state.session = null;
    return { message: 'Signed out.' };
  }],

  ['GET', /^\/auth\/me$/, (state) => {
    const user = currentUser(state);
    if (!user) throw new DemoError(401, 'Unauthenticated.');
    return { data: userShape(user) };
  }],

  /* ------------------------------------------------------------- admin */

  ['GET', /^\/admin\/stats$/, (state) => {
    requireDashboard(state);

    const paid = state.bookings.filter((booking) => ['confirmed', 'completed'].includes(booking.status));
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = today.slice(0, 7);

    const paidThisMonth = paid.filter((booking) => monthKey(booking.createdAt) === thisMonth);
    const revenueTotal = paid.reduce((sum, booking) => sum + booking.totalAmount, 0);

    const byMonth = new Map();
    for (const booking of paid) {
      const key = monthKey(booking.createdAt);
      const entry = byMonth.get(key) ?? { month: key, revenue: 0, bookings: 0 };
      entry.revenue += booking.totalAmount;
      entry.bookings += 1;
      byMonth.set(key, entry);
    }

    const bookingsByStatus = {};
    for (const booking of state.bookings) {
      bookingsByStatus[booking.status] = (bookingsByStatus[booking.status] ?? 0) + 1;
    }

    const routeCounts = new Map();
    const cabinMix = {};

    for (const booking of state.bookings) {
      for (const segment of booking.segments) {
        const flight = state.flightsById.get(segment.flightId);
        const origin = state.airportsById.get(flight.originId);
        const destination = state.airportsById.get(flight.destinationId);
        const key = `${origin.iata}-${destination.iata}`;

        const entry = routeCounts.get(key) ?? {
          route: key,
          originCity: origin.city.en,
          destinationCity: destination.city.en,
          bookings: 0,
        };
        entry.bookings += 1;
        routeCounts.set(key, entry);

        cabinMix[segment.cabin] = (cabinMix[segment.cabin] ?? 0) + 1;
      }
    }

    const upcoming = state.flights.filter((flight) => flight.departureAt >= today).length;

    return {
      data: {
        kpis: {
          bookingsToday: state.bookings.filter((b) => b.createdAt.slice(0, 10) === today).length,
          bookingsThisMonth: state.bookings.filter((b) => monthKey(b.createdAt) === thisMonth).length,
          revenueThisMonth: paidThisMonth.reduce((sum, b) => sum + b.totalAmount, 0),
          revenueTotal,
          averageBookingValue: paid.length ? Math.round(revenueTotal / paid.length) : 0,
          passengers: state.bookings.reduce((sum, b) => sum + b.passengers.length, 0),
          upcomingFlights: upcoming,
          unreadMessages: state.messages.filter((message) => message.status === 'new').length,
        },
        bookingsByStatus,
        revenueByMonth: [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month)),
        topRoutes: [...routeCounts.values()].sort((a, b) => b.bookings - a.bookings).slice(0, 8),
        cabinMix,
        recentBookings: state.bookings.slice(0, 8).map((booking) => ({
          pnr: booking.pnr,
          contact_email: booking.contactEmail,
          status: booking.status,
          total_amount: booking.totalAmount,
          created_at: booking.createdAt,
        })),
      },
    };
  }],

  ['GET', /^\/admin\/options$/, (state) => {
    requireDashboard(state);

    return {
      data: {
        airports: state.airports.map((airport) => ({
          id: airport.id,
          iata: airport.iata,
          city: airport.city.en,
          country: airport.country.en,
        })),
        aircraft: [...state.fleet.values()].map((aircraft) => ({
          id: aircraft.id,
          model: aircraft.model,
          registration: aircraft.registration,
          rows_economy: aircraft.rowsEconomy,
          rows_business: aircraft.rowsBusiness,
          seats_per_row: aircraft.seatsPerRow,
        })),
        cabins: CABIN_ORDER,
        statuses: ['scheduled', 'delayed', 'departed', 'arrived', 'cancelled'],
      },
    };
  }],

  ['GET', /^\/admin\/flights$/, (state, _m, _b, query) => {
    requireDashboard(state);

    const term = (query.get('q') ?? '').trim().toLowerCase();
    const status = query.get('status');

    const rows = state.flights
      .filter((flight) => !status || flight.status === status)
      .filter((flight) => {
        if (!term) return true;
        const origin = state.airportsById.get(flight.originId);
        const destination = state.airportsById.get(flight.destinationId);
        return (
          flight.flightNumber.toLowerCase().includes(term) ||
          origin.iata.toLowerCase().includes(term) ||
          destination.iata.toLowerCase().includes(term) ||
          origin.city.en.toLowerCase().includes(term) ||
          destination.city.en.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => a.departureAt.localeCompare(b.departureAt));

    const { items, meta } = paginate(rows, query.get('page'), query.get('perPage') ?? 12);

    return { data: items.map((flight) => flightShape(state, flight)), meta };
  }],

  ['GET', /^\/admin\/flights\/(\d+)\/manifest$/, (state, match) => {
    requireDashboard(state);

    const flight = state.flightsById.get(Number(match[1]));
    if (!flight) throw new DemoError(404, 'Flight not found.');

    const aircraft = state.fleet.get(flight.aircraftId);
    const origin = state.airportsById.get(flight.originId);
    const destination = state.airportsById.get(flight.destinationId);

    const passengers = state.bookings
      .filter((booking) => booking.status !== 'cancelled')
      .flatMap((booking) =>
        booking.segments
          .filter((segment) => segment.flightId === flight.id)
          .flatMap((segment) =>
            booking.passengers
              .filter((passenger) => passenger.segmentId === segment.id)
              .map((passenger) => ({
                id: passenger.id,
                segmentId: segment.id,
                firstName: passenger.firstName,
                lastName: passenger.lastName,
                fullName: passenger.fullName,
                type: passenger.type,
                seatNumber: passenger.seatNumber,
                checkedIn: passenger.checkedIn,
                passportNumber: passenger.passportNumber,
                cabin: segment.cabin,
                booking: {
                  pnr: booking.pnr,
                  status: booking.status,
                  contactEmail: booking.contactEmail,
                },
              })),
          ),
      );

    const byCabin = {};
    for (const passenger of passengers) {
      byCabin[passenger.cabin] = (byCabin[passenger.cabin] ?? 0) + 1;
    }

    return {
      data: {
        flight: {
          id: flight.id,
          flightNumber: flight.flightNumber,
          status: flight.status,
          departureAt: flight.departureAt,
          arrivalAt: flight.arrivalAt,
          route: `${origin.iata}-${destination.iata}`,
          origin: { iata: origin.iata, city: origin.city.en },
          destination: { iata: destination.iata, city: destination.city.en },
          aircraft: aircraft.model,
          capacity: aircraft.seatCount,
        },
        summary: {
          passengers: passengers.length,
          checkedIn: passengers.filter((passenger) => passenger.checkedIn).length,
          loadFactor: aircraft.seatCount
            ? Math.round((passengers.length / aircraft.seatCount) * 1000) / 10
            : 0,
          byCabin,
        },
        passengers,
      },
    };
  }],

  ['GET', /^\/admin\/bookings$/, (state, _m, _b, query) => {
    requireDashboard(state);

    const term = (query.get('q') ?? '').trim().toLowerCase();
    const status = query.get('status');

    const rows = state.bookings
      .filter((booking) => !status || booking.status === status)
      .filter((booking) => {
        if (!term) return true;
        return (
          booking.pnr.toLowerCase().includes(term) ||
          booking.contactEmail.toLowerCase().includes(term) ||
          booking.passengers.some((passenger) => passenger.fullName.toLowerCase().includes(term))
        );
      });

    const { items, meta } = paginate(rows, query.get('page'), query.get('perPage') ?? 15);

    return {
      data: items.map((booking) => bookingShape(state, booking, { includePassport: true })),
      meta,
    };
  }],

  ['GET', /^\/admin\/bookings\/([^/]+)$/, (state, match) => {
    requireDashboard(state);

    const booking = state.bookings.find(
      (candidate) => candidate.pnr === match[1] || String(candidate.id) === match[1],
    );
    if (!booking) throw new DemoError(404, 'Booking not found.');

    return { data: bookingShape(state, booking, { includePassport: true }) };
  }],

  ['PATCH', /^\/admin\/bookings\/([^/]+)\/status$/, (state, match, body) => {
    requireAdmin(state);

    const booking = state.bookings.find(
      (candidate) => candidate.pnr === match[1] || String(candidate.id) === match[1],
    );
    if (!booking) throw new DemoError(404, 'Booking not found.');

    booking.status = body.status;
    return { data: bookingShape(state, booking, { includePassport: true }) };
  }],

  ['GET', /^\/admin\/messages$/, (state, _m, _b, query) => {
    requireDashboard(state);

    const status = query.get('status');
    const rows = status ? state.messages.filter((message) => message.status === status) : state.messages;
    const { items, meta } = paginate(rows, query.get('page'), query.get('perPage') ?? 20);

    return { data: items, ...meta, meta };
  }],

  ['GET', /^\/admin\/users$/, (state, _m, _b, query) => {
    requireDashboard(state);
    const { items, meta } = paginate(state.users.map(userShape), query.get('page'), query.get('perPage'));
    return { data: items, meta };
  }],

  ['GET', /^\/admin\/audit-logs$/, (state) => {
    requireDashboard(state);
    return { data: [], meta: { currentPage: 1, lastPage: 1, perPage: 20, total: 0 } };
  }],

  ['POST', /^\/admin\/flights$/, (state, _m, body) => {
    requireAdmin(state);

    const aircraft = state.fleet.get(Number(body.aircraftId)) ?? [...state.fleet.values()][0];
    const flight = {
      id: Math.max(...state.flights.map((candidate) => candidate.id)) + 1,
      flightNumber: body.flightNumber,
      aircraftId: aircraft.id,
      originId: Number(body.originAirportId),
      destinationId: Number(body.destinationAirportId),
      departureAt: body.departureAt,
      arrivalAt: body.arrivalAt,
      durationMinutes: Number(body.durationMinutes ?? 0),
      basePrice: Number(body.basePrice ?? 0),
      stops: Number(body.stops ?? 0),
      status: body.status ?? 'scheduled',
      fares: [],
    };

    state.flights.push(flight);
    state.flightsById.set(flight.id, flight);

    return { data: flightShape(state, flight) };
  }],

  ['PUT', /^\/admin\/flights\/(\d+)$/, (state, match, body) => {
    requireAdmin(state);

    const flight = state.flightsById.get(Number(match[1]));
    if (!flight) throw new DemoError(404, 'Flight not found.');

    Object.assign(flight, {
      ...(body.flightNumber && { flightNumber: body.flightNumber }),
      ...(body.status && { status: body.status }),
      ...(body.departureAt && { departureAt: body.departureAt }),
      ...(body.arrivalAt && { arrivalAt: body.arrivalAt }),
      ...(body.basePrice !== undefined && { basePrice: Number(body.basePrice) }),
    });

    return { data: flightShape(state, flight) };
  }],

  ['DELETE', /^\/admin\/flights\/(\d+)$/, (state, match) => {
    requireAdmin(state);

    const id = Number(match[1]);
    const index = state.flights.findIndex((flight) => flight.id === id);
    if (index === -1) throw new DemoError(404, 'Flight not found.');

    state.flights.splice(index, 1);
    state.flightsById.delete(id);

    return { message: 'Flight removed.' };
  }],
];

/** Routes the request to its handler and mimics a little network latency. */
export async function handleDemoRequest(method, path, body, params) {
  await new Promise((resolve) => setTimeout(resolve, 220));

  const state = store();
  const [pathname, search = ''] = path.split('?');
  const query = new URLSearchParams(search);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  }

  for (const [verb, pattern, handler] of routes) {
    if (verb !== method) continue;

    const match = pattern.exec(pathname);
    if (!match) continue;

    return handler(state, match, body, query);
  }

  throw new DemoError(404, `No route matches ${method} ${pathname}`);
}
