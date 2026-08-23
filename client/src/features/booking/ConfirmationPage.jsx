import { useEffect, useState } from 'react';
import { CircleCheckBig, Mail, Printer, TicketCheck } from 'lucide-react';
import { Container } from 'react-bootstrap';
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../app/routes/paths';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { PageTransition } from '../../shared/components/layout/PageTransition';
import { SkeletonList } from '../../shared/components/ui/Skeleton';
import { formatCurrency } from '../../shared/lib/format';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useLanguage } from '../../i18n/useLanguage';
import { findBooking } from './api/bookingApi';
import { BookingDetails } from './components/BookingDetails';
import './styles/booking.css';

export default function ConfirmationPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { pnr } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  useDocumentTitle('bookingFlow.confirmedTitle');

  // The booking arrives in navigation state straight after payment. A reload
  // or a shared link has no state, so `?email=` is accepted as a fallback —
  // the API still requires the reference and email to match.
  const [booking, setBooking] = useState(location.state?.booking ?? null);
  const [error, setError] = useState(null);
  const email = location.state?.email ?? searchParams.get('email');

  useEffect(() => {
    if (booking || !email) return;

    findBooking(pnr, email)
      .then((response) => setBooking(response.data))
      .catch(setError);
  }, [booking, email, pnr]);

  return (
    <PageTransition>
      <section className="confirmation">
        <Container>
          <motion.header
            className="confirmation__hero"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.span
              className="confirmation__check"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.1,
                type: 'spring',
                stiffness: 220,
                damping: 16,
              }}
            >
              <CircleCheckBig size={38} aria-hidden="true" />
            </motion.span>

            <h1>{t('bookingFlow.confirmedTitle')}</h1>
            <p>{t('bookingFlow.confirmedLead')}</p>

            <p className="confirmation__pnr">
              <span>{t('bookingFlow.reference')}</span>
              <strong>{pnr}</strong>
            </p>

            <p className="confirmation__email">
              <Mail size={16} aria-hidden="true" />
              {t('bookingFlow.emailSent', {
                email: booking?.contactEmail ?? email,
              })}
            </p>
          </motion.header>

          {/* A direct visit or a refresh has no navigation state to read, so
              there is nothing to fetch with — send the traveller to the lookup
              form rather than leaving a spinner running forever. */}
          {!booking && !email && !error && (
            <EmptyState
              icon={TicketCheck}
              title={t('bookingFlow.detailsUnavailable')}
              description={t('bookingFlow.detailsUnavailableText')}
              action={
                <Link to={ROUTES.manageBooking} className="primary-action">
                  {t('bookingFlow.manage')}
                </Link>
              }
            />
          )}

          {!booking && email && !error && (
            <SkeletonList count={1} label={t('common.loading')} />
          )}
          {error && <ErrorState message={error.message} />}

          {booking && (
            <>
              <BookingDetails booking={booking} />

              <div className="confirmation__actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => window.print()}
                >
                  <Printer size={17} aria-hidden="true" />
                  {t('bookingFlow.print')}
                </button>

                <Link to={ROUTES.manageBooking} className="secondary-action">
                  {t('bookingFlow.manage')}
                </Link>

                <Link to={ROUTES.home} className="primary-action">
                  {t('notFound.cta')}
                </Link>
              </div>

              <p className="confirmation__total">
                {t('bookingFlow.totalPaid', {
                  value: formatCurrency(booking.totalAmount, language),
                })}
              </p>
            </>
          )}
        </Container>
      </section>
    </PageTransition>
  );
}
