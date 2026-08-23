import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorState } from '../../../shared/components/ui/ErrorState';
import { cx } from '../../../shared/lib/classNames';
import { fetchSeatMap } from '../../flights/api/flightsApi';

/**
 * Interactive seat picker for one flight and cabin.
 *
 * Seats are grouped into rows with an aisle gap, and each seat is a real
 * button carrying its own accessible name — so the map is usable with a
 * keyboard and a screen reader, not only with a mouse.
 */
export function SeatMap({ flightId, cabin, seatCount, selected, onChange }) {
  const { t } = useTranslation();
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchSeatMap(flightId, cabin)
      .then((response) => !cancelled && setMap(response.data))
      .catch((caught) => !cancelled && setError(caught))
      .finally(() => !cancelled && setIsLoading(false));

    return () => {
      cancelled = true;
    };
  }, [flightId, cabin]);

  const toggleSeat = (seat) => {
    if (selected.includes(seat)) {
      onChange(selected.filter((value) => value !== seat));
      return;
    }

    // Once the party is seated, a new pick replaces the oldest choice rather
    // than being silently ignored.
    onChange(
      selected.length >= seatCount
        ? [...selected.slice(1), seat]
        : [...selected, seat],
    );
  };

  if (isLoading) {
    return <p className="seat-map__status">{t('common.loading')}</p>;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  const rows = Object.entries(
    map.seats.reduce((grouped, seat) => {
      (grouped[seat.row] ??= []).push(seat);
      return grouped;
    }, {}),
  );

  const aisleAfter = Math.ceil(map.seatsPerRow / 2);

  return (
    <div className="seat-map">
      <div className="seat-map__legend">
        <span>
          <i className="seat-swatch seat-swatch--free" />{' '}
          {t('bookingFlow.seatFree')}
        </span>
        <span>
          <i className="seat-swatch seat-swatch--taken" />{' '}
          {t('bookingFlow.seatTaken')}
        </span>
        <span>
          <i className="seat-swatch seat-swatch--chosen" />{' '}
          {t('bookingFlow.seatChosen')}
        </span>
      </div>

      <p className="seat-map__hint">
        {t('bookingFlow.seatHint', {
          count: seatCount,
          chosen: selected.length,
        })}
      </p>

      <div className="seat-map__cabin">
        {rows.map(([row, seats]) => (
          <div className="seat-row" key={row}>
            <span className="seat-row__number">{row}</span>

            {seats.map((seat, index) => {
              const isChosen = selected.includes(seat.seat);

              return (
                <span className="seat-row__cell" key={seat.seat}>
                  <button
                    type="button"
                    className={cx(
                      'seat',
                      !seat.available && 'seat--taken',
                      isChosen && 'seat--chosen',
                    )}
                    disabled={!seat.available}
                    aria-pressed={isChosen}
                    aria-label={t('bookingFlow.seatLabel', {
                      seat: seat.seat,
                      state: t(
                        seat.available
                          ? isChosen
                            ? 'bookingFlow.seatChosen'
                            : 'bookingFlow.seatFree'
                          : 'bookingFlow.seatTaken',
                      ),
                    })}
                    onClick={() => toggleSeat(seat.seat)}
                  >
                    {seat.letter}
                  </button>
                  {index + 1 === aisleAfter && <span className="seat-aisle" />}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
