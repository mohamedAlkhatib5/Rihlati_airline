import { Container } from 'react-bootstrap';
import { motion } from 'framer-motion';

import { ResponsiveImage } from '../ui/ResponsiveImage';
import './page-hero.css';

/**
 * The banner used at the top of every inner page.
 *
 * Previously this was duplicated across four pages as a CSS background image;
 * as a component it renders a responsive `<picture>` instead, so mobile
 * downloads a 640px file rather than the full-size original.
 */
export function PageHero({ image, imageAlt = '', eyebrow, title, text }) {
  return (
    <section className="page-hero">
      <ResponsiveImage
        name={image}
        alt={imageAlt}
        className="page-hero__image"
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
      />
      <div className="page-hero__overlay" aria-hidden="true" />

      <Container className="page-hero__content">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {eyebrow && (
            <span className="eyebrow eyebrow--on-dark">{eyebrow}</span>
          )}
          <h1>{title}</h1>
          {text && <p>{text}</p>}
        </motion.div>
      </Container>
    </section>
  );
}
