import { useState } from 'react';
import { Plane, TicketPercent } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatCurrency } from '../../../shared/lib/format';
import { useLanguage } from '../../../i18n/useLanguage';

const clockTime = (value) => value.slice(11, 16);
const dayLabel = (value) => value.slice(0, 10);

/**
 * Sticky itinerary and price breakdown.
 *
 * Every line the traveller is being charged for is visible before they pay —
 * no total that appears only at the last step.
 */
export function FareSummary({
  outbound,
  returnLeg,
  passengerCount,
  subtotal,
  discount,
  offerCode,
  onApplyOffer,
  offerError,
}) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [code, setCode] = useState(offerCode ?? '');
  const [isApplying, setIsApplying] = useState(false);

  const money = (value) => formatCurrency(value, language);

  const applyCode = async (event) => {
    event.preventDefault();
    setIsApplying(true);
    await onApplyOffer(code.trim());
    setIsApplying(false);
  };

  const leg = (label, selection) =>
    selection && (
      <div className="fare-summary__leg" key={label}>
        <p className="fare-summary__leg-label">
          <Plane size={15} aria-hidden="true" />
          {label}
        </p>
        <p className="fare-summary__route">
          {selection.flight.origin?.iata} → {selection.flight.destination?.iata}
        </p>
        <p className="fare-summary__detail">
          {selection.flight.flightNumber} ·{' '}
          {dayLabel(selection.flight.departureAt)} ·{' '}
          {clockTime(selection.flight.departureAt)}
        </p>
        <p className="fare-summary__detail">
          {t(`booking.class.${selection.cabin}`)} · {money(selection.price)}{' '}
          {t('bookingFlow.perTraveller')}
        </p>
      </div>
    );

  return (
    <aside className="fare-summary" aria-label={t('bookingFlow.summary')}>
      <h2>{t('bookingFlow.summary')}</h2>

      {leg(t('search.outbound'), outbound)}
      {leg(t('search.return'), returnLeg)}

      <form className="fare-summary__offer" onSubmit={applyCode}>
        <label htmlFor="offer-code">
          <TicketPercent size={15} aria-hidden="true" />
          {t('bookingFlow.promoCode')}
        </label>
        <div>
          <input
            id="offer-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="SUMMER25"
          />
          <button
            type="submit"
            className="secondary-action"
            disabled={isApplying}
          >
            {t('bookingFlow.apply')}
          </button>
        </div>
        {offerError && (
          <p className="fare-summary__offer-error">{offerError}</p>
        )}
      </form>

      <dl className="fare-summary__totals">
        <div>
          <dt>{t('bookingFlow.travellers')}</dt>
          <dd>{passengerCount}</dd>
        </div>
        <div>
          <dt>{t('bookingFlow.subtotal')}</dt>
          <dd>{money(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="fare-summary__discount">
            <dt>{t('bookingFlow.discount')}</dt>
            <dd>−{money(discount)}</dd>
          </div>
        )}
        <div className="fare-summary__total">
          <dt>{t('bookingFlow.total')}</dt>
          <dd>{money(subtotal - discount)}</dd>
        </div>
      </dl>
    </aside>
  );
}
