import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { todayAsInputValue } from '../../../shared/lib/format';
import { INITIAL_BOOKING_FORM } from '../constants/bookingOptions';

/**
 * State, validation and submission for the flight search form.
 *
 * Keeping this out of the component makes the rules testable on their own and
 * leaves `<BookingForm>` responsible only for rendering.
 */
export function useBookingForm() {
  const { t } = useTranslation();
  const [values, setValues] = useState(INITIAL_BOOKING_FORM);
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

      // Replaced by a call to the flight-search API in a later phase.
      setStatus({
        type: 'success',
        message: t('booking.success', {
          from: values.from.trim(),
          to: values.to.trim(),
        }),
      });
    },
    [validate, values, t],
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
