export const TRIP_TYPES = [
  { value: 'round', labelKey: 'booking.roundTrip' },
  { value: 'one', labelKey: 'booking.oneWay' },
];

export const TRAVEL_CLASSES = [
  { value: 'economy', labelKey: 'booking.class.economy' },
  { value: 'premium', labelKey: 'booking.class.premium' },
  { value: 'business', labelKey: 'booking.class.business' },
  { value: 'first', labelKey: 'booking.class.first' },
];

export const PASSENGER_OPTIONS = [1, 2, 3, 4, 5, 6];

export const INITIAL_BOOKING_FORM = {
  tripType: 'round',
  from: '',
  to: '',
  departure: '',
  returnDate: '',
  passengers: '1',
  travelClass: 'economy',
};
