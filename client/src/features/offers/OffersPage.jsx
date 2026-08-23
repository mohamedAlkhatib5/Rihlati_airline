import { TicketPercent } from 'lucide-react';
import { Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '../../shared/components/ui/EmptyState';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { PageHero } from '../../shared/components/layout/PageHero';
import { PageTransition } from '../../shared/components/layout/PageTransition';
import { SectionTitle } from '../../shared/components/ui/SectionTitle';
import { SkeletonList } from '../../shared/components/ui/Skeleton';
import { useApiResource } from '../../shared/hooks/useApiResource';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { OfferCard } from './components/OfferCard';
import './styles/offers.css';

export default function OffersPage() {
  const { t } = useTranslation();
  const { data: offers, error, isLoading, reload } = useApiResource('/offers');
  useDocumentTitle('offers.title', 'offers.lead');

  return (
    <PageTransition>
      <PageHero
        image="maldives"
        eyebrow={t('offers.eyebrow')}
        title={t('offers.title')}
        text={t('offers.lead')}
      />

      <section className="section-space">
        <Container>
          <SectionTitle
            eyebrow={t('offers.sectionEyebrow')}
            title={t('offers.sectionTitle')}
            text={t('offers.sectionText')}
          />

          {isLoading && <SkeletonList count={3} label={t('common.loading')} />}

          {!isLoading && error && (
            <ErrorState message={error.message} onRetry={reload} />
          )}

          {!isLoading && !error && offers?.length === 0 && (
            <EmptyState
              icon={TicketPercent}
              title={t('offers.emptyTitle')}
              description={t('offers.emptyText')}
            />
          )}

          {!isLoading && !error && offers?.length > 0 && (
            <Row className="g-4">
              {offers.map((offer) => (
                <Col md={6} lg={4} key={offer.id}>
                  <OfferCard offer={offer} />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>
    </PageTransition>
  );
}
