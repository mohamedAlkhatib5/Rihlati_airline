import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { formatCurrency } from '../../../shared/lib/format';
import { useLanguage } from '../../../i18n/useLanguage';

/**
 * Sticky summary of what has been chosen so far.
 *
 * It only appears once a selection exists, and states plainly what is still
 * missing — so the traveller is never left wondering why they cannot continue.
 */
export function SelectionBar({
  outbound,
  returnLeg,
  isRoundTrip,
  passengerCount,
  onContinue,
}) {
  const { t } = useTranslation();
  const { language, isArabic } = useLanguage();
  const Arrow = isArabic ? ArrowLeft : ArrowRight;

  if (!outbound) return null;

  const isComplete = Boolean(outbound && (!isRoundTrip || returnLeg));
  const total =
    ((outbound?.price ?? 0) + (returnLeg?.price ?? 0)) * passengerCount;

  return (
    <motion.div
      className="selection-bar"
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="selection-bar__legs">
        <p>
          <strong>{t('search.outbound')}</strong>
          <span>
            {outbound.flight.flightNumber} ·{' '}
            {t(`booking.class.${outbound.cabin}`)}
          </span>
        </p>

        {isRoundTrip && (
          <p>
            <strong>{t('search.return')}</strong>
            <span className={returnLeg ? undefined : 'selection-bar__pending'}>
              {returnLeg
                ? `${returnLeg.flight.flightNumber} · ${t(`booking.class.${returnLeg.cabin}`)}`
                : t('search.chooseReturn')}
            </span>
          </p>
        )}
      </div>

      <div className="selection-bar__total">
        <span>{t('search.totalFor', { count: passengerCount })}</span>
        <strong>{formatCurrency(total, language)}</strong>
      </div>

      <button
        type="button"
        className="primary-action"
        onClick={onContinue}
        disabled={!isComplete}
      >
        {t('search.continue')}
        <Arrow size={18} aria-hidden="true" />
      </button>
    </motion.div>
  );
}
