import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { api } from '../../../shared/lib/apiClient';
import { useApiResource } from '../../../shared/hooks/useApiResource';

/** `datetime-local` needs `YYYY-MM-DDTHH:mm` with no zone. */
const toInputValue = (value) => (value ? value.slice(0, 16) : '');

const EMPTY = {
  flightNumber: '',
  aircraftId: '',
  originAirportId: '',
  destinationAirportId: '',
  departureAt: '',
  arrivalAt: '',
  basePrice: '',
  stops: 0,
  status: 'scheduled',
};

/**
 * Create / edit a flight, including its cabin pricing.
 *
 * Server-side validation errors are mapped back onto the matching field, so a
 * rejected save says exactly which input to correct.
 */
export function FlightFormModal({ flight, onClose, onSaved }) {
  const { t } = useTranslation();
  const { data: options } = useApiResource('/admin/options');

  const [values, setValues] = useState(EMPTY);
  const [fares, setFares] = useState([
    { cabin: 'economy', price: '', seatsTotal: '' },
    { cabin: 'business', price: '', seatsTotal: '' },
  ]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(flight?.id);

  useEffect(() => {
    if (!flight?.id || !options) return;

    const airports = options.airports ?? [];
    const findId = (iata) =>
      airports.find((airport) => airport.iata === iata)?.id ?? '';

    setValues({
      flightNumber: flight.flightNumber ?? '',
      aircraftId:
        options.aircraft?.find(
          (item) => item.registration === flight.aircraft?.registration,
        )?.id ?? '',
      originAirportId: findId(flight.origin?.iata),
      destinationAirportId: findId(flight.destination?.iata),
      departureAt: toInputValue(flight.departureAt),
      arrivalAt: toInputValue(flight.arrivalAt),
      basePrice: flight.basePrice ?? '',
      stops: flight.stops ?? 0,
      status: flight.status ?? 'scheduled',
    });

    if (flight.fares?.length) {
      setFares(
        flight.fares.map((fare) => ({
          cabin: fare.cabin,
          price: fare.price,
          seatsTotal: fare.seatsTotal,
        })),
      );
    }
  }, [flight, options]);

  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const airports = useMemo(() => options?.airports ?? [], [options]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const updateFare = (index, key, value) => {
    setFares((current) =>
      current.map((fare, position) =>
        position === index ? { ...fare, [key]: value } : fare,
      ),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);
    setErrors({});

    const payload = {
      ...values,
      aircraftId: Number(values.aircraftId),
      originAirportId: Number(values.originAirportId),
      destinationAirportId: Number(values.destinationAirportId),
      basePrice: Number(values.basePrice),
      stops: Number(values.stops),
      departureAt: values.departureAt.replace('T', ' '),
      arrivalAt: values.arrivalAt.replace('T', ' '),
      fares: fares
        .filter((fare) => fare.price && fare.seatsTotal)
        .map((fare) => ({
          cabin: fare.cabin,
          price: Number(fare.price),
          seatsTotal: Number(fare.seatsTotal),
        })),
    };

    try {
      const response = isEditing
        ? await api.put(`/admin/flights/${flight.id}`, payload)
        : await api.post('/admin/flights', payload);

      onSaved(response.message);
    } catch (caught) {
      setErrors(caught.errors ?? {});
      setFormError(caught.message);
    } finally {
      setIsSaving(false);
    }
  };

  const fieldError = (name) => errors[name]?.[0];

  return (
    <div className="modal-backdrop">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="flight-form-title"
      >
        <header className="modal-card__head">
          <h2 id="flight-form-title">
            {t(
              isEditing
                ? 'admin.flights.editTitle'
                : 'admin.flights.createTitle',
            )}
          </h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label={t('admin.close')}
          >
            <X size={19} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flight-form" noValidate>
          <div className="flight-form__grid">
            <label htmlFor="flightNumber">
              {t('admin.form.flightNumber')}
              <input
                id="flightNumber"
                name="flightNumber"
                value={values.flightNumber}
                onChange={updateField}
                maxLength={8}
                required
              />
              {fieldError('flightNumber') && (
                <span>{fieldError('flightNumber')}</span>
              )}
            </label>

            <label htmlFor="aircraftId">
              {t('admin.form.aircraft')}
              <select
                id="aircraftId"
                name="aircraftId"
                value={values.aircraftId}
                onChange={updateField}
                required
              >
                <option value="">—</option>
                {(options?.aircraft ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.model} · {item.registration}
                  </option>
                ))}
              </select>
              {fieldError('aircraftId') && (
                <span>{fieldError('aircraftId')}</span>
              )}
            </label>

            <label htmlFor="originAirportId">
              {t('admin.form.origin')}
              <select
                id="originAirportId"
                name="originAirportId"
                value={values.originAirportId}
                onChange={updateField}
                required
              >
                <option value="">—</option>
                {airports.map((airport) => (
                  <option key={airport.id} value={airport.id}>
                    {airport.iata} · {airport.city}
                  </option>
                ))}
              </select>
              {fieldError('originAirportId') && (
                <span>{fieldError('originAirportId')}</span>
              )}
            </label>

            <label htmlFor="destinationAirportId">
              {t('admin.form.destination')}
              <select
                id="destinationAirportId"
                name="destinationAirportId"
                value={values.destinationAirportId}
                onChange={updateField}
                required
              >
                <option value="">—</option>
                {airports.map((airport) => (
                  <option key={airport.id} value={airport.id}>
                    {airport.iata} · {airport.city}
                  </option>
                ))}
              </select>
              {fieldError('destinationAirportId') && (
                <span>{fieldError('destinationAirportId')}</span>
              )}
            </label>

            <label htmlFor="departureAt">
              {t('admin.form.departure')}
              <input
                id="departureAt"
                name="departureAt"
                type="datetime-local"
                value={values.departureAt}
                onChange={updateField}
                required
              />
              {fieldError('departureAt') && (
                <span>{fieldError('departureAt')}</span>
              )}
            </label>

            <label htmlFor="arrivalAt">
              {t('admin.form.arrival')}
              <input
                id="arrivalAt"
                name="arrivalAt"
                type="datetime-local"
                value={values.arrivalAt}
                onChange={updateField}
                required
              />
              {fieldError('arrivalAt') && (
                <span>{fieldError('arrivalAt')}</span>
              )}
            </label>

            <label htmlFor="basePrice">
              {t('admin.form.basePrice')}
              <input
                id="basePrice"
                name="basePrice"
                type="number"
                min="1"
                value={values.basePrice}
                onChange={updateField}
                required
              />
              {fieldError('basePrice') && (
                <span>{fieldError('basePrice')}</span>
              )}
            </label>

            <label htmlFor="status">
              {t('admin.table.status')}
              <select
                id="status"
                name="status"
                value={values.status}
                onChange={updateField}
              >
                {(options?.statuses ?? []).map((value) => (
                  <option key={value} value={value}>
                    {t(`admin.flightStatus.${value}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="flight-form__fares">
            <legend>{t('admin.form.cabins')}</legend>

            {fares.map((fare, index) => (
              <div className="flight-form__fare" key={fare.cabin}>
                <span className="flight-form__cabin">
                  {t(`booking.class.${fare.cabin}`)}
                </span>
                <label htmlFor={`fare-price-${fare.cabin}`}>
                  <span className="visually-hidden">
                    {t('admin.form.price')}
                  </span>
                  <input
                    id={`fare-price-${fare.cabin}`}
                    type="number"
                    min="1"
                    placeholder={t('admin.form.price')}
                    value={fare.price}
                    onChange={(event) =>
                      updateFare(index, 'price', event.target.value)
                    }
                  />
                </label>
                <label htmlFor={`fare-seats-${fare.cabin}`}>
                  <span className="visually-hidden">
                    {t('admin.form.seats')}
                  </span>
                  <input
                    id={`fare-seats-${fare.cabin}`}
                    type="number"
                    min="1"
                    placeholder={t('admin.form.seats')}
                    value={fare.seatsTotal}
                    onChange={(event) =>
                      updateFare(index, 'seatsTotal', event.target.value)
                    }
                  />
                </label>
              </div>
            ))}
          </fieldset>

          {formError && (
            <p className="admin-notice admin-notice--error" role="alert">
              {formError}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="admin-button" onClick={onClose}>
              {t('admin.cancel')}
            </button>
            <button
              type="submit"
              className="admin-button admin-button--primary"
              disabled={isSaving}
            >
              {isSaving ? t('admin.saving') : t('admin.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
