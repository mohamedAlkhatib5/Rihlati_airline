import { CircleCheck } from 'lucide-react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../../app/routes/paths';
import { ResponsiveImage } from '../../../shared/components/ui/ResponsiveImage';
import { SectionTitle } from '../../../shared/components/ui/SectionTitle';
import { useLanguage } from '../../../i18n/useLanguage';
import { EXPERIENCE_CHECKS } from '../constants/highlights';

export function ExperienceSection() {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();

  return (
    <section className="section-space experience">
      <Container>
        <Row className="align-items-center g-5">
          <Col lg={6}>
            <motion.figure
              className="experience__media"
              initial={{ opacity: 0, x: isArabic ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <ResponsiveImage
                name="clouds-sky"
                alt={t('experience.imageAlt')}
                sizes="(min-width: 992px) 560px, 92vw"
              />
              <figcaption className="experience__stat">
                <strong>{t('experience.statValue')}</strong>
                <span>{t('experience.statLabel')}</span>
              </figcaption>
            </motion.figure>
          </Col>

          <Col lg={6}>
            <SectionTitle
              centered={false}
              eyebrow={t('experience.eyebrow')}
              title={t('experience.title')}
              text={t('experience.text')}
            />

            <ul className="experience__checks">
              {EXPERIENCE_CHECKS.map((key) => (
                <li key={key}>
                  <CircleCheck size={19} aria-hidden="true" />
                  {t(key)}
                </li>
              ))}
            </ul>

            <Button as={Link} to={ROUTES.about} className="primary-action mt-4">
              {t('experience.cta')}
            </Button>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
