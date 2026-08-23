import { Plane, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatCurrency } from '../../../shared/lib/format';
import { useLanguage } from '../../../i18n/useLanguage';

const clockTime = (value) => value.slice(11, 16);
const dayLabel = (value) => value.slice(0, 10);

const STATUS_TONES = {
  confirmed: 'good',
  completed: 'info',
  pending: 'warning',
  cancelled: 'critical',
};

/** Itinerary, travellers, seats and payment for one booking. */
export function BookingDetails({ booking }) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  // A round trip repeats each traveller once per segment, so travellers are
  // grouped by segment id — the seat belongs to one specific flight.
  const segments = booking.segments ?? [];
  const travellersBySegment = (booking.passengers ?? []).reduce(
    (grouped, passenger) => {
      (grouped[passenger.segmentId] ??= []).push(passenger);
      return grouped;
    },
    {},
  );

  return (
    <div className="booking-details">
      <div className="booking-details__status">
        <span
          className={`booking-status booking-status--${STATUS_TONES[booking.status]}`}
        >
          {t(`admin.status.${booking.status}`)}
        </span>
        <span>
          {t('bookingFlow.reference')}: <strong>{booking.pnr}</strong>
        </span>
      </div>

      {segments.map((segment) => {
        const seats = travellersBySegment[segment.id] ?? [];

        return (
          <section className="booking-details__segment" key={segment.id}>
            <header>
              <h2>
                <Plane size={17} aria-hidden="true" />
                {t(
                  segment.direction === 'return'
                    ? 'search.return'
                    : 'search.outbound',
                )}
              </h2>
              <span>{t(`booking.class.${segment.cabin}`)}</span>
            </header>

            <div className="booking-details__flight">
              <div>
                <p className="booking-details__time">
                  {clockTime(segment.flight.departureAt)}
                </p>
                <p className="booking-details__place">
                  {segment.flight.origin?.city?.en} (
                  {segment.flight.origin?.iata})
                </p>
                <p className="booking-details__date">
                  {dayLabel(segment.flight.departureAt)}
                </p>
              </div>

              <div className="booking-details__arrow" aria-hidden="true">
                {segment.flight.flightNumber}
              </div>

              <div>
                <p className="booking-details__time">
                  {clockTime(segment.flight.arrivalAt)}
                </p>
                <p className="booking-details__place">
                  {segment.flight.destination?.city?.en} (
                  {segment.flight.destination?.iata})
                </p>
                <p className="booking-details__date">
                  {dayLabel(segment.flight.arrivalAt)}
                </p>
              </div>
            </div>

            {seats.length > 0 && (
              <ul className="booking-details__passengers">
                {seats.map((passenger) => (
                  <li key={passenger.id}>
                    <User size={15} aria-hidden="true" />
                    <span>{passenger.fullName}</span>
                    <strong>
                      {passenger.seatNumber ?? t('bookingFlow.seatAtCheckIn')}
                    </strong>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {booking.payment && (
        <section className="booking-details__payment">
          <h2>{t('bookingFlow.payment')}</h2>
          <dl>
            <div>
              <dt>{t('bookingFlow.method')}</dt>
              <dd>
                {booking.payment.cardBrand} ····{booking.payment.cardLast4}
              </dd>
            </div>
            <div>
              <dt>{t('bookingFlow.reference')}</dt>
              <dd className="booking-details__code">
                {booking.payment.reference}
              </dd>
            </div>
            <div>
              <dt>{t('bookingFlow.subtotal')}</dt>
              <dd>{formatCurrency(booking.subtotalAmount, language)}</dd>
            </div>
            {booking.discountAmount > 0 && (
              <div>
                <dt>{t('bookingFlow.discount')}</dt>
                <dd>−{formatCurrency(booking.discountAmount, language)}</dd>
              </div>
            )}
            <div className="booking-details__grand">
              <dt>{t('bookingFlow.total')}</dt>
              <dd>{formatCurrency(booking.totalAmount, language)}</dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}
