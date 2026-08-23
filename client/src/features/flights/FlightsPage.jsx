import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { PageHero } from '../../shared/components/layout/PageHero';
import { PageTransition } from '../../shared/components/layout/PageTransition';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { BookingForm } from './components/BookingForm';
import './styles/flights.css';

export default function FlightsPage() {
  const { t } = useTranslation();
  useDocumentTitle('nav.flights', 'flights.heroText');

  return (
    <PageTransition>
      <PageHero
        image="hero-airplane"
        eyebrow={t('flights.heroEyebrow')}
        title={t('flights.heroTitle')}
        text={t('flights.heroText')}
      />

      <section className="section-space page-soft-bg">
        <Container>
          <BookingForm compact />
        </Container>
      </section>
    </PageTransition>
  );
}
