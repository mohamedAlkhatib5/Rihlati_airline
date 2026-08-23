import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cx } from '../../../shared/lib/classNames';

/**
 * Progress through the booking.
 *
 * Numbered because the steps genuinely are a sequence — each one depends on
 * the previous — and completed steps are marked so the traveller can see how
 * much is left.
 */
export function BookingSteps({ steps, currentIndex, onStepClick }) {
  const { t } = useTranslation();

  return (
    <ol className="booking-steps" aria-label={t('bookingFlow.progress')}>
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li
            key={step.key}
            className={cx(
              'booking-step',
              isDone && 'booking-step--done',
              isCurrent && 'booking-step--current',
            )}
          >
            <button
              type="button"
              onClick={() => isDone && onStepClick(index)}
              disabled={!isDone}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="booking-step__marker">
                {isDone ? <Check size={15} aria-hidden="true" /> : index + 1}
              </span>
              <span className="booking-step__label">{t(step.labelKey)}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
