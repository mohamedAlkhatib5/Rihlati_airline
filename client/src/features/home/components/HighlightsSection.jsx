import { Col, Container, Row } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { SECTIONS } from '../../../app/routes/paths';
import { SectionTitle } from '../../../shared/components/ui/SectionTitle';
import { HOME_HIGHLIGHTS } from '../constants/highlights';

export function HighlightsSection() {
  const { t } = useTranslation();

  return (
    <section className="section-space highlights" id={SECTIONS.services}>
      <Container>
        <SectionTitle
          eyebrow={t('features.eyebrow')}
          title={t('features.title')}
          text={t('features.description')}
        />

        <Row className="g-4">
          {HOME_HIGHLIGHTS.map(({ id, Icon, titleKey, textKey }, index) => (
            <Col md={4} key={id}>
              <motion.article
                className="highlight-card"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.12 }}
              >
                <span className="highlight-card__icon">
                  <Icon size={26} aria-hidden="true" />
                </span>
                <h3>{t(titleKey)}</h3>
                <p>{t(textKey)}</p>
              </motion.article>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}
