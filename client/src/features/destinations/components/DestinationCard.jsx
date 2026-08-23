import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../../app/routes/paths';
import { ResponsiveImage } from '../../../shared/components/ui/ResponsiveImage';
import { formatCurrency } from '../../../shared/lib/format';
import { useLanguage } from '../../../i18n/useLanguage';
import { localise } from '../data/destinations';

/** Tells the browser the rendered width so it downloads the right variant. */
const IMAGE_SIZES = '(min-width: 992px) 380px, (min-width: 768px) 45vw, 92vw';

export function DestinationCard({ destination }) {
  const { t } = useTranslation();
  const { language, isArabic } = useLanguage();

  const city = localise(destination.city, language);
  const country = localise(destination.country, language);
  const Arrow = isArabic ? ArrowLeft : ArrowRight;

  // The API returns `priceFrom`; the bundled fallback uses the same key.
  const price = destination.priceFrom;

  return (
    <motion.article
      className="destination-card"
      whileHover={{ y: -10 }}
      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="destination-card__media">
        <ResponsiveImage
          name={destination.image}
          alt={`${city}, ${country}`}
          sizes={IMAGE_SIZES}
        />
        <span className="destination-card__badge">
          {t('destinations.popular')}
        </span>
      </div>

      <div className="destination-card__body">
        <div className="destination-card__heading">
          <div>
            <h3>{city}</h3>
            <p>{country}</p>
          </div>
          <p className="destination-card__price">
            <small>{t('destinations.priceFrom')}</small>
            {formatCurrency(price, language)}
          </p>
        </div>

        {/* Pre-fills the search with this route, so the card leads straight
            into a real result set rather than a blank form. */}
        <Link
          to={`${ROUTES.flights}?from=DXB&to=${destination.iata}`}
          className="destination-card__cta"
        >
          {t('destinations.bookNow')}
          <Arrow size={18} aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  );
}
