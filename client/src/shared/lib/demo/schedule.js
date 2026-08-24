/**
 * Builds the flight schedule the demo serves.
 *
 * Mirrors `FlightSeeder::run` and `FlightSeeder::seedFareClasses`: the same
 * routes, the same departure slots, the same lead-time and slot price factors,
 * and the same cabin rules — wide-bodies sell four cabins, narrow-bodies two.
 *
 * Generated once per session from today's date, so the schedule is always
 * current no matter when the page is opened.
 */
import { AIRPORTS, FLEET, HUB, ROUTES, SCHEDULE_DAYS, SLOTS } from './network';

/** Deterministic pseudo-random in [0,1) — the same seed always gives the same seat map. */
function rand(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const pad = (value) => String(value).padStart(2, '0');

/**
 * Local wall-clock timestamp, no offset.
 *
 * The API deliberately emits schedules without a timezone: a departure board
 * shows local time, and attaching an offset would make the browser shift it
 * into the viewer's own zone.
 */
function stamp(date) {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

export function buildNetwork() {
  const airports = AIRPORTS.map(
    ([iata, nameEn, nameAr, cityEn, cityAr, countryEn, countryAr], index) => ({
      id: index + 1,
      iata,
      name: { en: nameEn, ar: nameAr },
      city: { en: cityEn, ar: cityAr },
      country: { en: countryEn, ar: countryAr },
    }),
  );

  const fleet = FLEET.map(([model, registration, rowsEconomy, rowsBusiness, seatsPerRow], index) => ({
    id: index + 1,
    model,
    registration,
    rowsEconomy,
    rowsBusiness,
    seatsPerRow,
    seatCount: (rowsEconomy + rowsBusiness) * seatsPerRow,
  }));

  const byIata = new Map(airports.map((airport) => [airport.iata, airport]));
  const hub = byIata.get(HUB);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const flights = [];
  let flightId = 1;
  let sequence = 100;

  for (const [iata, [minutes, basePrice, perDay]] of Object.entries(ROUTES)) {
    sequence += 4;
    const outboundNumber = `RH${sequence}`;
    const inboundNumber = `RH${sequence + 1}`;
    const outstation = byIata.get(iata);

    for (let day = 0; day < SCHEDULE_DAYS; day += 1) {
      for (let slot = 0; slot < perDay; slot += 1) {
        const aircraft = fleet[(day + slot + sequence) % fleet.length];

        const leadFactor = 1 + Math.max(0, 14 - day) * 0.02;
        const slotFactor = slot === 0 ? 0.88 : 1 + slot * 0.06;
        const price = Math.round(basePrice * leadFactor * slotFactor);

        const [hours, mins] = SLOTS[slot % SLOTS.length].split(':').map(Number);
        const departure = new Date(today);
        departure.setDate(departure.getDate() + day);
        departure.setHours(hours, mins, 0, 0);

        flights.push(
          makeFlight(flightId++, outboundNumber, aircraft, hub, outstation, departure, minutes, price),
        );

        const inbound = new Date(departure.getTime() + (minutes + 95) * 60_000);

        flights.push(
          makeFlight(flightId++, inboundNumber, aircraft, outstation, hub, inbound, minutes, price),
        );
      }
    }
  }

  return { airports, fleet, flights };
}

function makeFlight(id, flightNumber, aircraft, origin, destination, departure, minutes, price) {
  const arrival = new Date(departure.getTime() + minutes * 60_000);

  return {
    id,
    flightNumber,
    aircraftId: aircraft.id,
    originId: origin.id,
    destinationId: destination.id,
    departureAt: stamp(departure),
    arrivalAt: stamp(arrival),
    durationMinutes: minutes,
    basePrice: price,
    stops: 0,
    status: 'scheduled',
    fares: buildFares(id, aircraft, price),
  };
}

/** Wide-bodies (30+ economy rows) sell four cabins; narrow-bodies only two. */
function buildFares(flightId, aircraft, basePrice) {
  const wideBody = aircraft.rowsEconomy >= 30;

  const cabins = [
    ['economy', basePrice, aircraft.rowsEconomy * aircraft.seatsPerRow],
    ['business', Math.round(basePrice * 2.8), aircraft.rowsBusiness * aircraft.seatsPerRow],
  ];

  if (wideBody) {
    cabins.push(['premium', Math.round(basePrice * 1.6), 4 * aircraft.seatsPerRow]);
    cabins.push(['first', Math.round(basePrice * 4.5), 8]);
  }

  const order = ['economy', 'premium', 'business', 'first'];

  return cabins
    .map(([cabin, price, seatsTotal], index) => ({
      id: flightId * 10 + index,
      cabin,
      price,
      seatsTotal,
      seatsAvailable: Math.round((seatsTotal * (45 + Math.floor(rand(flightId + index) * 52))) / 100),
    }))
    .sort((a, b) => order.indexOf(a.cabin) - order.indexOf(b.cabin));
}

export { rand };
