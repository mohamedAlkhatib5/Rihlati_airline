import { Container } from 'react-bootstrap';

import { PageTransition } from '../../shared/components/layout/PageTransition';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { BookingForm } from '../flights/components/BookingForm';
import { ExperienceSection } from './components/ExperienceSection';
import { HeroSection } from './components/HeroSection';
import { HighlightsSection } from './components/HighlightsSection';
import { NewsletterSection } from './components/NewsletterSection';
import { PopularDestinationsSection } from './components/PopularDestinationsSection';
import '../flights/styles/flights.css';
import '../destinations/styles/destinations.css';
import './styles/home.css';

export default function HomePage() {
  useDocumentTitle(null, 'hero.description');

  return (
    <PageTransition>
      <HeroSection />

      <section className="booking-section">
        <Container>
          <BookingForm />
        </Container>
      </section>

      <HighlightsSection />
      <PopularDestinationsSection />
      <ExperienceSection />
      <NewsletterSection />
    </PageTransition>
  );
}
