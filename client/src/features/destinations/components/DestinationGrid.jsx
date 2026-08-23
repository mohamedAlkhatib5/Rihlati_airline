import { Col, Row } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { DestinationCard } from './DestinationCard';

/** Cards fade in one after another rather than all at once. */
const CONTAINER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export function DestinationGrid({ destinations }) {
  const { t } = useTranslation();

  if (destinations.length === 0) {
    return <p className="destination-grid__empty">{t('destinations.empty')}</p>;
  }

  return (
    <motion.div
      variants={CONTAINER_VARIANTS}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <Row className="g-4">
        {destinations.map((destination) => (
          <Col md={6} lg={4} key={destination.id}>
            <motion.div variants={ITEM_VARIANTS} className="h-100">
              <DestinationCard destination={destination} />
            </motion.div>
          </Col>
        ))}
      </Row>
    </motion.div>
  );
}
