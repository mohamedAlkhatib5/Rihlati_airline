import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Container, Form } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../app/routes/paths';
import { FormField } from '../../shared/components/ui/FormField';
import { PageTransition } from '../../shared/components/layout/PageTransition';
import { StatusMessage } from '../../shared/components/ui/StatusMessage';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useLanguage } from '../../i18n/useLanguage';
import { createBooking, validateOffer } from './api/bookingApi';
import { BookingSteps } from './components/BookingSteps';
import { FareSummary } from './components/FareSummary';
import { PassengerFields } from './components/PassengerFields';
import { PaymentFields, detectBrand } from './components/PaymentFields';
import { SeatMap } from './components/SeatMap';
import {
  clearDraft,
  draftSubtotal,
  isDraftBookable,
  readDraft,
  writeDraft,
} from './bookingDraft';
import './styles/booking.css';

const STEPS = [
  { key: 'travellers', labelKey: 'bookingFlow.steps.travellers' },
  { key: 'seats', labelKey: 'bookingFlow.steps.seats' },
  { key: 'payment', labelKey: 'bookingFlow.steps.payment' },
];

const emptyPassenger = () => ({
  firstName: '',
  lastName: '',
  type: 'adult',
  dateOfBirth: '',
  passportNumber: '',
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function BookingPage() {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  useDocumentTitle('bookingFlow.title');

  const [draft, setDraft] = useState(readDraft);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [offerError, setOfferError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payment, setPayment] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const passengerCount = draft.passengerCount || 1;

  // Grow the traveller list to match the party size chosen during search.
  const passengers = useMemo(() => {
    const list = [...(draft.passengers ?? [])];
    while (list.length < passengerCount) list.push(emptyPassenger());
    return list.slice(0, passengerCount);
  }, [draft.passengers, passengerCount]);

  const subtotal = draftSubtotal(draft);
  const Back = isArabic ? ArrowRight : ArrowLeft;
  const Next = isArabic ? ArrowLeft : ArrowRight;

  // Reaching this page without a selected flight means the draft was cleared.
  if (!isDraftBookable(draft)) {
    return <Navigate to={ROUTES.flights} replace />;
  }

  const persist = (changes) => {
    const next = writeDraft({ ...draft, ...changes });
    setDraft(next);
    return next;
  };

  const updatePassenger = (index, field, value) => {
    const next = passengers.map((person, position) =>
      position === index ? { ...person, [field]: value } : person,
    );
    persist({ passengers: next });
    setErrors((current) => ({
      ...current,
      [`passengers.${index}.${field}`]: undefined,
    }));
  };

  const updateContact = (field, value) => {
    persist({ contact: { ...draft.contact, [field]: value } });
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateTravellers = () => {
    const found = {};

    passengers.forEach((person, index) => {
      if (person.firstName.trim().length < 2) {
        found[`passengers.${index}.firstName`] = t(
          'bookingFlow.errors.firstName',
        );
      }
      if (person.lastName.trim().length < 2) {
        found[`passengers.${index}.lastName`] = t(
          'bookingFlow.errors.lastName',
        );
      }
    });

    if (!EMAIL_PATTERN.test(draft.contact.email ?? '')) {
      found.email = t('bookingFlow.errors.email');
    }

    return found;
  };

  const validatePayment = () => {
    const found = {};
    const digits = payment.cardNumber.replace(/\D/g, '');

    if (payment.cardName.trim().length < 3) {
      found.cardName = t('bookingFlow.errors.cardName');
    }
    if (digits.length < 15) {
      found.cardNumber = t('bookingFlow.errors.cardNumber');
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.cardExpiry)) {
      found.cardExpiry = t('bookingFlow.errors.cardExpiry');
    }
    if (!/^\d{3,4}$/.test(payment.cardCvc)) {
      found.cardCvc = t('bookingFlow.errors.cardCvc');
    }

    return found;
  };

  const goNext = () => {
    if (step === 0) {
      const found = validateTravellers();
      setErrors(found);

      if (Object.keys(found).length > 0) {
        setStatus({ type: 'error', message: t('booking.errors.summary') });
        return;
      }
    }

    setStatus(null);
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const applyOffer = async (code) => {
    setOfferError(null);

    if (!code) {
      persist({ offerCode: '', discount: 0 });
      return;
    }

    try {
      const response = await validateOffer(code, subtotal);
      persist({ offerCode: response.code, discount: response.discount });
    } catch (caught) {
      setOfferError(caught.message);
      persist({ offerCode: '', discount: 0 });
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    const found = validatePayment();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setStatus({ type: 'error', message: t('booking.errors.summary') });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await createBooking({
        outboundFareId: draft.outbound.fareId,
        returnFareId: draft.return?.fareId ?? null,
        contactEmail: draft.contact.email,
        contactPhone: draft.contact.phone || null,
        offerCode: draft.offerCode || null,
        passengers: passengers.map((person) => ({
          firstName: person.firstName.trim(),
          lastName: person.lastName.trim(),
          type: person.type,
          dateOfBirth: person.dateOfBirth || null,
          passportNumber: person.passportNumber || null,
        })),
        seats: draft.seats,
        payment: {
          method: 'card',
          cardBrand: detectBrand(payment.cardNumber),
          cardLast4: payment.cardNumber.replace(/\D/g, '').slice(-4),
        },
      });

      clearDraft();
      navigate(ROUTES.confirmation.replace(':pnr', response.data.pnr), {
        state: { booking: response.data, email: draft.contact.email },
      });
    } catch (caught) {
      // Field errors come back keyed by the API's own paths.
      const flattened = Object.fromEntries(
        Object.entries(caught.errors ?? {}).map(([key, value]) => [
          key,
          value[0],
        ]),
      );
      setErrors(flattened);
      setStatus({ type: 'error', message: caught.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <section className="booking-flow">
        <Container>
          <header className="booking-flow__header">
            <h1>{t('bookingFlow.title')}</h1>
            <p>{t('bookingFlow.lead')}</p>
          </header>

          <BookingSteps
            steps={STEPS}
            currentIndex={step}
            onStepClick={setStep}
          />

          <div className="booking-flow__layout">
            <div className="booking-flow__main">
              {/* Enter-only, transform-only. `AnimatePresence mode="wait"`
                  would hold the previous step on screen until its exit
                  animation reported completion — one stalled animation and the
                  wizard is stuck. Keying the element lets React swap steps
                  immediately and lets motion animate the new one in. */}
              <motion.div
                key={STEPS[step].key}
                initial={{ x: 18 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.26, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {step === 0 && (
                  <div className="booking-panel-card">
                    <h2>{t('bookingFlow.steps.travellers')}</h2>

                    {passengers.map((person, index) => (
                      <PassengerFields
                        key={index}
                        index={index}
                        values={person}
                        errors={errors}
                        onChange={updatePassenger}
                      />
                    ))}

                    <fieldset className="passenger-card">
                      <legend>{t('bookingFlow.contactDetails')}</legend>
                      <div className="passenger-card__grid">
                        <FormField
                          controlId="contact-booking-email"
                          label={t('bookingFlow.contactEmail')}
                          error={errors.email ?? errors.contactEmail}
                        >
                          {(field) => (
                            <Form.Control
                              type="email"
                              value={draft.contact.email}
                              onChange={(event) =>
                                updateContact('email', event.target.value)
                              }
                              placeholder="name@example.com"
                              autoComplete="email"
                              required
                              {...field}
                            />
                          )}
                        </FormField>

                        <FormField
                          controlId="contact-booking-phone"
                          label={t('bookingFlow.contactPhone')}
                        >
                          {(field) => (
                            <Form.Control
                              type="tel"
                              value={draft.contact.phone}
                              onChange={(event) =>
                                updateContact('phone', event.target.value)
                              }
                              autoComplete="tel"
                              {...field}
                            />
                          )}
                        </FormField>
                      </div>
                      <p className="passenger-card__note">
                        {t('bookingFlow.contactNote')}
                      </p>
                    </fieldset>
                  </div>
                )}

                {step === 1 && (
                  <div className="booking-panel-card">
                    <h2>{t('bookingFlow.steps.seats')}</h2>
                    <p className="booking-panel-card__lead">
                      {t('bookingFlow.seatsLead')}
                    </p>

                    <section className="seat-section">
                      <h3>
                        {t('search.outbound')} ·{' '}
                        {draft.outbound.flight.flightNumber}
                      </h3>
                      <SeatMap
                        flightId={draft.outbound.flightId}
                        cabin={draft.outbound.cabin}
                        seatCount={passengerCount}
                        selected={draft.seats.outbound}
                        onChange={(seats) =>
                          persist({
                            seats: { ...draft.seats, outbound: seats },
                          })
                        }
                      />
                    </section>

                    {draft.return && (
                      <section className="seat-section">
                        <h3>
                          {t('search.return')} ·{' '}
                          {draft.return.flight.flightNumber}
                        </h3>
                        <SeatMap
                          flightId={draft.return.flightId}
                          cabin={draft.return.cabin}
                          seatCount={passengerCount}
                          selected={draft.seats.return}
                          onChange={(seats) =>
                            persist({
                              seats: { ...draft.seats, return: seats },
                            })
                          }
                        />
                      </section>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <Form
                    className="booking-panel-card"
                    onSubmit={submit}
                    noValidate
                  >
                    <h2>{t('bookingFlow.steps.payment')}</h2>
                    <PaymentFields
                      values={payment}
                      errors={errors}
                      onChange={(field, value) => {
                        setPayment((current) => ({
                          ...current,
                          [field]: value,
                        }));
                        setErrors((current) => ({
                          ...current,
                          [field]: undefined,
                        }));
                      }}
                    />

                    <button
                      type="submit"
                      className="primary-action booking-flow__pay"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? t('bookingFlow.processing')
                        : t('bookingFlow.payNow')}
                    </button>
                  </Form>
                )}
              </motion.div>

              {status && (
                <StatusMessage status={status.type}>
                  {status.message}
                </StatusMessage>
              )}

              <div className="booking-flow__nav">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() =>
                    step === 0
                      ? navigate(-1)
                      : setStep((current) => current - 1)
                  }
                >
                  <Back size={17} aria-hidden="true" />
                  {t('bookingFlow.back')}
                </button>

                {step < STEPS.length - 1 && (
                  <button
                    type="button"
                    className="primary-action"
                    onClick={goNext}
                  >
                    {t('bookingFlow.continue')}
                    <Next size={17} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <FareSummary
              outbound={draft.outbound}
              returnLeg={draft.return}
              passengerCount={passengerCount}
              subtotal={subtotal}
              discount={draft.discount}
              offerCode={draft.offerCode}
              offerError={offerError}
              onApplyOffer={applyOffer}
            />
          </div>
        </Container>
      </section>
    </PageTransition>
  );
}
