import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { PageHero } from '../../shared/components/layout/PageHero';
import { PageTransition } from '../../shared/components/layout/PageTransition';
import { SectionTitle } from '../../shared/components/ui/SectionTitle';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { DestinationGrid } from './components/DestinationGrid';
import { destinations } from './data/destinations';
import './styles/destinations.css';

export default function DestinationsPage() {
  const { t } = useTranslation();
  useDocumentTitle('nav.destinations', 'destinations.heroText');

  return (
    <PageTransition>
      <PageHero
        image="dubai"
        eyebrow={t('destinations.heroEyebrow')}
        title={t('destinations.heroTitle')}
        text={t('destinations.heroText')}
      />

      <section className="section-space">
        <Container>
          <SectionTitle
            eyebrow={t('destinations.sectionEyebrow')}
            title={t('destinations.sectionTitle')}
            text={t('destinations.sectionText')}
          />
          <DestinationGrid destinations={destinations} />
        </Container>
      </section>
    </PageTransition>
  );
}
