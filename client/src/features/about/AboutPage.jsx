import { Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { PageHero } from '../../shared/components/layout/PageHero';
import { PageTransition } from '../../shared/components/layout/PageTransition';
import { ResponsiveImage } from '../../shared/components/ui/ResponsiveImage';
import { SectionTitle } from '../../shared/components/ui/SectionTitle';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { ABOUT_VALUES } from './constants/values';
import './styles/about.css';

export default function AboutPage() {
  const { t } = useTranslation();
  useDocumentTitle('nav.about', 'about.heroText');

  return (
    <PageTransition>
      <PageHero
        image="clouds-sky"
        eyebrow={t('about.heroEyebrow')}
        title={t('about.heroTitle')}
        text={t('about.heroText')}
      />

      <section className="section-space">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <ResponsiveImage
                name="hero-airplane"
                alt={t('about.imageAlt')}
                className="about__image"
                sizes="(min-width: 992px) 560px, 92vw"
              />
            </Col>

            <Col lg={6}>
              <SectionTitle
                centered={false}
                eyebrow={t('about.eyebrow')}
                title={t('about.title')}
                text={t('about.text')}
              />

              <ul className="about__values">
                {ABOUT_VALUES.map(({ id, Icon, titleKey, textKey }) => (
                  <li key={id}>
                    <span className="about__value-icon">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span>
                      <strong>{t(titleKey)}</strong>
                      {t(textKey)}
                    </span>
                  </li>
                ))}
              </ul>
            </Col>
          </Row>
        </Container>
      </section>
    </PageTransition>
  );
}
