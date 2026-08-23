import { Plane } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { formatCurrency } from '../../../shared/lib/format';
import { cx } from '../../../shared/lib/classNames';
import { useLanguage } from '../../../i18n/useLanguage';

/** `2026-09-02T02:15:00` → `02:15`, without letting the browser shift zones. */
const clockTime = (value) => value.slice(11, 16);
const dayLabel = (value) => value.slice(0, 10);

const duration = (minutes) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

/**
 * One flight, with a selectable fare per cabin.
 *
 * The cheapest fare is highlighted, because that is what the price shown in
 * search results refers to.
 */
export function FlightCard({ flight, selectedFareId, onSelectFare }) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const fares = [...(flight.fares ?? [])].sort((a, b) => a.price - b.price);

  return (
    <motion.article
      className={cx(
        'flight-card',
        fares.some((fare) => fare.id === selectedFareId) &&
          'flight-card--selected',
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="flight-card__route">
        <div className="flight-card__endpoint">
          <p className="flight-card__time">{clockTime(flight.departureAt)}</p>
          <p className="flight-card__code">{flight.origin?.iata}</p>
          <p className="flight-card__city">{flight.origin?.city?.en}</p>
        </div>

        <div className="flight-card__path" aria-hidden="true">
          <span className="flight-card__duration">
            {duration(flight.durationMinutes)}
          </span>
          <span className="flight-card__line">
            <Plane size={16} />
          </span>
          <span className="flight-card__stops">
            {flight.stops === 0
              ? t('search.direct')
              : t('search.stops', { count: flight.stops })}
          </span>
        </div>

        <div className="flight-card__endpoint flight-card__endpoint--end">
          <p className="flight-card__time">{clockTime(flight.arrivalAt)}</p>
          <p className="flight-card__code">{flight.destination?.iata}</p>
          <p className="flight-card__city">{flight.destination?.city?.en}</p>
        </div>
      </div>

      <div className="flight-card__meta">
        <span className="flight-card__number">{flight.flightNumber}</span>
        <span>{flight.aircraft?.model}</span>
        <span>{dayLabel(flight.departureAt)}</span>
      </div>

      <div className="flight-card__fares">
        {fares.map((fare, index) => (
          <button
            key={fare.id}
            type="button"
            className={cx(
              'fare-option',
              index === 0 && 'fare-option--best',
              fare.id === selectedFareId && 'fare-option--selected',
            )}
            onClick={() => onSelectFare(flight, fare)}
            aria-pressed={fare.id === selectedFareId}
          >
            <span className="fare-option__cabin">
              {t(`booking.class.${fare.cabin}`)}
            </span>
            <span className="fare-option__price">
              {formatCurrency(fare.price, language)}
            </span>
            <span className="fare-option__seats">
              {t('search.seatsLeft', { count: fare.seatsAvailable })}
            </span>
          </button>
        ))}
      </div>
    </motion.article>
  );
}
