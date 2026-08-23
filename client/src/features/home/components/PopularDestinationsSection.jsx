import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../../app/routes/paths';
import { SectionTitle } from '../../../shared/components/ui/SectionTitle';
import { WaveDivider } from '../../../shared/components/ui/WaveDivider';
import { DestinationGrid } from '../../destinations/components/DestinationGrid';
import { useDestinations } from '../../destinations/hooks/useDestinations';

export function PopularDestinationsSection() {
  const { t } = useTranslation();
  const { destinations, isLoading } = useDestinations({ featured: true });

  return (
    <section className="section-space popular-destinations">
      <WaveDivider position="top" />

      <Container>
        <SectionTitle
          eyebrow={t('destinations.homeEyebrow')}
          title={t('destinations.homeTitle')}
          text={t('destinations.homeText')}
        />

        <DestinationGrid destinations={destinations} isLoading={isLoading} />

        <div className="popular-destinations__cta">
          <Button
            as={Link}
            to={ROUTES.destinations}
            className="secondary-action"
          >
            {t('destinations.exploreAll')}
          </Button>
        </div>
      </Container>

      <WaveDivider position="bottom" />
    </section>
  );
}
