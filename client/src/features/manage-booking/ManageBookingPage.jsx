import { useState } from 'react';
import { Search, TicketX } from 'lucide-react';
import { Container, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { BookingDetails } from '../booking/components/BookingDetails';
import { ConfirmPanel } from './components/ConfirmPanel';
import { FormField } from '../../shared/components/ui/FormField';
import { PageHero } from '../../shared/components/layout/PageHero';
import { PageTransition } from '../../shared/components/layout/PageTransition';
import { StatusMessage } from '../../shared/components/ui/StatusMessage';
import { cancelBooking, findBooking } from '../booking/api/bookingApi';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import '../booking/styles/booking.css';
import './styles/manage-booking.css';

export default function ManageBookingPage() {
  const { t } = useTranslation();
  useDocumentTitle('manage.title', 'manage.lead');

  const [values, setValues] = useState({ pnr: '', email: '' });
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelPanel, setShowCancelPanel] = useState(false);

  const update = (field) => (event) => {
    const value =
      field === 'pnr' ? event.target.value.toUpperCase() : event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
  };

  const lookUp = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);
    setBooking(null);

    try {
      const response = await findBooking(
        values.pnr.trim(),
        values.email.trim(),
      );
      setBooking(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const cancel = async () => {
    setIsCancelling(true);

    try {
      const response = await cancelBooking(
        values.pnr.trim(),
        values.email.trim(),
      );
      setBooking(response.data);
      setStatus({ type: 'success', message: response.message });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsCancelling(false);
      setShowCancelPanel(false);
    }
  };

  return (
    <PageTransition>
      <PageHero
        image="clouds-sky"
        eyebrow={t('manage.eyebrow')}
        title={t('manage.title')}
        text={t('manage.lead')}
      />

      <section className="section-space page-soft-bg">
        <Container>
          <Form className="lookup-form" onSubmit={lookUp} noValidate>
            <FormField controlId="lookup-pnr" label={t('manage.reference')}>
              {(field) => (
                <Form.Control
                  value={values.pnr}
                  onChange={update('pnr')}
                  placeholder="A24F3C"
                  maxLength={6}
                  required
                  {...field}
                />
              )}
            </FormField>

            <FormField controlId="lookup-email" label={t('manage.email')}>
              {(field) => (
                <Form.Control
                  type="email"
                  value={values.email}
                  onChange={update('email')}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  {...field}
                />
              )}
            </FormField>

            <button
              type="submit"
              className="primary-action"
              disabled={isLoading}
            >
              <Search size={17} aria-hidden="true" />
              {isLoading ? t('common.loading') : t('manage.find')}
            </button>
          </Form>

          {status && (
            <StatusMessage status={status.type} className="lookup-status">
              {status.message}
            </StatusMessage>
          )}

          {booking && (
            <div className="lookup-result">
              <BookingDetails booking={booking} />

              {booking.status !== 'cancelled' && (
                <div className="lookup-result__actions">
                  <button
                    type="button"
                    className="danger-action"
                    onClick={() => setShowCancelPanel(true)}
                  >
                    <TicketX size={17} aria-hidden="true" />
                    {t('manage.cancelBooking')}
                  </button>
                </div>
              )}
            </div>
          )}

          {showCancelPanel && (
            <ConfirmPanel
              title={t('manage.cancelTitle')}
              message={t('manage.cancelMessage', { pnr: booking.pnr })}
              confirmLabel={t('manage.cancelConfirm')}
              isBusy={isCancelling}
              onConfirm={cancel}
              onDismiss={() => setShowCancelPanel(false)}
            />
          )}
        </Container>
      </section>
    </PageTransition>
  );
}
