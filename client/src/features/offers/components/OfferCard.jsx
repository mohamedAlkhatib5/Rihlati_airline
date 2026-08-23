import { useState } from 'react';
import { Check, Copy, TicketPercent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../../app/routes/paths';
import { ResponsiveImage } from '../../../shared/components/ui/ResponsiveImage';
import { formatCurrency, formatDate } from '../../../shared/lib/format';
import { useLanguage } from '../../../i18n/useLanguage';

const IMAGE_SIZES = '(min-width: 992px) 380px, (min-width: 768px) 45vw, 92vw';

export function OfferCard({ offer }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const localised = (field) => field?.[language] ?? field?.en ?? '';

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(offer.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked; the code stays visible either way.
    }
  };

  const discount =
    offer.discountType === 'percent'
      ? `${offer.discountValue}%`
      : formatCurrency(offer.discountValue, language);

  return (
    <motion.article
      className="offer-card"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="offer-card__media">
        {offer.destination ? (
          <ResponsiveImage
            name={offer.destination.image}
            alt={localised(offer.destination.city)}
            sizes={IMAGE_SIZES}
          />
        ) : (
          <div className="offer-card__generic">
            <TicketPercent size={34} aria-hidden="true" />
          </div>
        )}
        <span className="offer-card__discount">
          {t('offers.save', { value: discount })}
        </span>
      </div>

      <div className="offer-card__body">
        <h3>{localised(offer.title)}</h3>
        <p>{localised(offer.description)}</p>

        <dl className="offer-card__meta">
          <div>
            <dt>{t('offers.validUntil')}</dt>
            <dd>{formatDate(offer.validTo, language)}</dd>
          </div>
          {offer.destination && (
            <div>
              <dt>{t('offers.destination')}</dt>
              <dd>{localised(offer.destination.city)}</dd>
            </div>
          )}
        </dl>

        <div className="offer-card__actions">
          <button type="button" className="offer-card__code" onClick={copyCode}>
            <span>{offer.code}</span>
            {copied ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Copy size={16} aria-hidden="true" />
            )}
            <span className="visually-hidden">
              {t(copied ? 'offers.copied' : 'offers.copyCode')}
            </span>
          </button>

          <Link to={ROUTES.flights} className="offer-card__cta">
            {t('offers.book')}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
