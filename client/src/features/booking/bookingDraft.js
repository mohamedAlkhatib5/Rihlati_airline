/**
 * The in-progress booking.
 *
 * Held in `sessionStorage` rather than React state so a reload part-way
 * through the wizard does not throw the traveller back to the search results,
 * and cleared as soon as the booking is confirmed.
 */
const KEY = 'rihlati-booking-draft';

const EMPTY = {
  outbound: null, // { flightId, fareId, cabin, price, flight }
  return: null,
  passengerCount: 1,
  passengers: [],
  seats: { outbound: [], return: [] },
  contact: { email: '', phone: '' },
  offerCode: '',
  discount: 0,
};

export function readDraft() {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeDraft(draft) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // A full or disabled store must not break the booking flow.
  }
  return draft;
}

export function clearDraft() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Ignored for the same reason as above.
  }
}

/** Total before any discount, for the chosen cabins and party size. */
export function draftSubtotal(draft) {
  const legs = (draft.outbound?.price ?? 0) + (draft.return?.price ?? 0);
  return legs * (draft.passengerCount || 1);
}

export const isDraftBookable = (draft) => Boolean(draft.outbound?.fareId);
