import { CircleCheckBig, Sparkles } from 'lucide-react';
import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../../app/routes/paths';
import { ResponsiveImage } from '../../../shared/components/ui/ResponsiveImage';

const TRUST_POINTS = [
  'hero.trust.flexible',
  'hero.trust.secure',
  'hero.trust.global',
];

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="hero">
      {/* The hero photograph is the largest paint on the page, so it loads
          eagerly at high priority rather than being discovered by the CSS. */}
      <ResponsiveImage
        name="hero-airplane"
        alt=""
        className="hero__background"
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
      />
      <div className="hero__overlay" aria-hidden="true" />

      <Container className="hero__content">
        <motion.div
          className="hero__copy"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <span className="hero__kicker">
            <Sparkles size={17} aria-hidden="true" />
            {t('hero.kicker')}
          </span>

          <h1>
            {t('hero.titleLine1')}
            <br />
            {t('hero.titleLine2')}
          </h1>

          <p>{t('hero.description')}</p>

          <div className="hero__actions">
            <Button as={Link} to={ROUTES.flights} className="primary-action">
              {t('hero.exploreFlights')}
            </Button>
            <Button as={Link} to={ROUTES.destinations} className="ghost-action">
              {t('hero.viewDestinations')}
            </Button>
          </div>

          <ul className="hero__trust">
            {TRUST_POINTS.map((key) => (
              <li key={key}>
                <CircleCheckBig size={17} aria-hidden="true" />
                {t(key)}
              </li>
            ))}
          </ul>
        </motion.div>
      </Container>

      {/* Decorative parallax cloud bands. */}
      <div className="hero__clouds hero__clouds--back" aria-hidden="true">
        <ResponsiveImage name="clouds-decor" alt="" sizes="80vw" />
        <ResponsiveImage name="clouds-decor" alt="" sizes="80vw" />
      </div>
      <div className="hero__clouds hero__clouds--front" aria-hidden="true">
        <ResponsiveImage name="clouds-decor" alt="" sizes="80vw" />
        <ResponsiveImage name="clouds-decor" alt="" sizes="80vw" />
      </div>
    </section>
  );
}
