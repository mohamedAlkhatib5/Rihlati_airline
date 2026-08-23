import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../../app/routes/paths';
import { todayAsInputValue } from '../../../shared/lib/format';
import { INITIAL_BOOKING_FORM } from '../constants/bookingOptions';

/**
 * State, validation and submission for the flight search form.
 *
 * On success it navigates to the flights page with the search in the query
 * string, so results are shareable and survive a reload.
 *
 * @param {object} [initialValues] Pre-fills the form from the current URL.
 */
export function useBookingForm(initialValues) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [values, setValues] = useState(() => ({
    ...INITIAL_BOOKING_FORM,
    ...initialValues,
  }));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  const today = useMemo(() => todayAsInputValue(), []);
  const isRoundTrip = values.tripType === 'round';

  const updateField = useCallback((event) => {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
      // A one-way trip cannot keep a return date around.
      ...(name === 'tripType' && value === 'one' ? { returnDate: '' } : null),
    }));

    // Clear the field's error as soon as the visitor starts correcting it.
    setErrors((current) => {
      if (!current[name]) return current;
      const { [name]: _removed, ...rest } = current;
      return rest;
    });
  }, []);

  const validate = useCallback(() => {
    const nextErrors = {};
    const from = values.from.trim();
    const to = values.to.trim();

    if (!from) nextErrors.from = t('booking.errors.from');
    if (!to) nextErrors.to = t('booking.errors.to');

    if (from && to && from.toLowerCase() === to.toLowerCase()) {
      nextErrors.to = t('booking.errors.sameCity');
    }

    if (!values.departure) {
      nextErrors.departure = t('booking.errors.departure');
    } else if (values.departure < today) {
      nextErrors.departure = t('booking.errors.departureInPast');
    }

    if (
      isRoundTrip &&
      values.returnDate &&
      values.departure &&
      values.returnDate < values.departure
    ) {
      nextErrors.returnDate = t('booking.errors.returnBeforeDeparture');
    }

    return nextErrors;
  }, [values, today, isRoundTrip, t]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const nextErrors = validate();
      setErrors(nextErrors);

      if (Object.keys(nextErrors).length > 0) {
        setStatus({ type: 'error', message: t('booking.errors.summary') });
        return;
      }

      setStatus(null);

      const query = new URLSearchParams({
        from: values.from.trim(),
        to: values.to.trim(),
        departure: values.departure,
        passengers: values.passengers,
        cabin: values.travelClass,
      });

      if (isRoundTrip && values.returnDate) {
        query.set('returnDate', values.returnDate);
      }

      navigate(`${ROUTES.flights}?${query}`);
    },
    [validate, values, isRoundTrip, navigate, t],
  );

  return {
    values,
    errors,
    status,
    isRoundTrip,
    minDeparture: today,
    minReturn: values.departure || today,
    updateField,
    handleSubmit,
  };
}
