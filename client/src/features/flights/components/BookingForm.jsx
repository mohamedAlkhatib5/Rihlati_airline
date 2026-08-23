import { CloudSun, Search } from 'lucide-react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { FormField } from '../../../shared/components/ui/FormField';
import { StatusMessage } from '../../../shared/components/ui/StatusMessage';
import { cx } from '../../../shared/lib/classNames';
import {
  PASSENGER_OPTIONS,
  TRAVEL_CLASSES,
  TRIP_TYPES,
} from '../constants/bookingOptions';
import { useBookingForm } from '../hooks/useBookingForm';

/**
 * Flight search panel, shared by the home page and the flights page.
 *
 * Every control is wrapped in `<FormField>`, which supplies the matching
 * `id`/`for` pair plus `aria-invalid` and `aria-describedby` wiring.
 */
export function BookingForm({ compact = false, initialValues }) {
  const { t } = useTranslation();
  const {
    values,
    errors,
    status,
    isRoundTrip,
    minDeparture,
    minReturn,
    updateField,
    handleSubmit,
  } = useBookingForm(
    initialValues && {
      from: initialValues.from,
      to: initialValues.to,
      departure: initialValues.departure,
      returnDate: initialValues.returnDate ?? '',
      passengers: initialValues.passengers ?? '1',
      travelClass: initialValues.cabin ?? 'economy',
      tripType: initialValues.returnDate ? 'round' : 'one',
    },
  );

  return (
    <section
      className={cx('booking-panel', compact && 'booking-panel--compact')}
      aria-labelledby="booking-panel-title"
    >
      <header className="booking-panel__header">
        <div>
          <span className="eyebrow">{t('booking.eyebrow')}</span>
          <h2 id="booking-panel-title">{t('booking.title')}</h2>
        </div>
        <p className="booking-panel__badge">
          <CloudSun size={18} aria-hidden="true" />
          {t('booking.badge')}
        </p>
      </header>

      <Form onSubmit={handleSubmit} noValidate>
        <Row className="g-3">
          <Col xl={2} md={4}>
            <FormField
              controlId="booking-trip-type"
              label={t('booking.tripType')}
            >
              {(field) => (
                <Form.Select
                  name="tripType"
                  value={values.tripType}
                  onChange={updateField}
                  {...field}
                >
                  {TRIP_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </Form.Select>
              )}
            </FormField>
          </Col>

          <Col xl={2} md={4}>
            <FormField
              controlId="booking-from"
              label={t('booking.from')}
              error={errors.from}
            >
              {(field) => (
                <Form.Control
                  name="from"
                  value={values.from}
                  onChange={updateField}
                  placeholder={t('booking.fromPlaceholder')}
                  autoComplete="off"
                  {...field}
                />
              )}
            </FormField>
          </Col>

          <Col xl={2} md={4}>
            <FormField
              controlId="booking-to"
              label={t('booking.to')}
              error={errors.to}
            >
              {(field) => (
                <Form.Control
                  name="to"
                  value={values.to}
                  onChange={updateField}
                  placeholder={t('booking.toPlaceholder')}
                  autoComplete="off"
                  {...field}
                />
              )}
            </FormField>
          </Col>

          <Col xl={2} md={4}>
            <FormField
              controlId="booking-departure"
              label={t('booking.departure')}
              error={errors.departure}
            >
              {(field) => (
                <Form.Control
                  type="date"
                  name="departure"
                  value={values.departure}
                  onChange={updateField}
                  min={minDeparture}
                  {...field}
                />
              )}
            </FormField>
          </Col>

          <Col xl={2} md={4}>
            <FormField
              controlId="booking-return"
              label={t('booking.returnDate')}
              error={errors.returnDate}
            >
              {(field) => (
                <Form.Control
                  type="date"
                  name="returnDate"
                  value={values.returnDate}
                  onChange={updateField}
                  min={minReturn}
                  disabled={!isRoundTrip}
                  {...field}
                />
              )}
            </FormField>
          </Col>

          <Col xl={2} md={4}>
            <FormField
              controlId="booking-passengers"
              label={t('booking.passengers')}
            >
              {(field) => (
                <Form.Select
                  name="passengers"
                  value={values.passengers}
                  onChange={updateField}
                  {...field}
                >
                  {PASSENGER_OPTIONS.map((count) => (
                    <option key={count} value={count}>
                      {t('booking.passengerCount', { count })}
                    </option>
                  ))}
                </Form.Select>
              )}
            </FormField>
          </Col>

          <Col md={6}>
            <FormField
              controlId="booking-class"
              label={t('booking.travelClass')}
            >
              {(field) => (
                <Form.Select
                  name="travelClass"
                  value={values.travelClass}
                  onChange={updateField}
                  {...field}
                >
                  {TRAVEL_CLASSES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </Form.Select>
              )}
            </FormField>
          </Col>

          <Col md={6} className="d-flex align-items-end">
            <Button type="submit" className="primary-action w-100">
              <Search size={18} aria-hidden="true" />
              {t('booking.submit')}
            </Button>
          </Col>
        </Row>
      </Form>

      <AnimatePresence>
        {status && (
          <StatusMessage key={status.message} status={status.type}>
            {status.message}
          </StatusMessage>
        )}
      </AnimatePresence>
    </section>
  );
}
