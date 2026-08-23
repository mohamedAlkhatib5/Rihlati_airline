import { useEffect, useRef } from 'react';
import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Confirmation before an irreversible action on a booking.
 *
 * Focus moves in on open and Escape dismisses it, so it behaves like a modal
 * for keyboard users rather than only looking like one.
 */
export function ConfirmPanel({
  title,
  message,
  confirmLabel,
  isBusy,
  onConfirm,
  onDismiss,
}) {
  const { t } = useTranslation();
  const dismissRef = useRef(null);

  useEffect(() => {
    dismissRef.current?.focus();

    const onKeyDown = (event) => event.key === 'Escape' && onDismiss();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onDismiss]);

  return (
    <div className="confirm-panel-backdrop">
      <div
        className="confirm-panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-booking-title"
      >
        <span className="confirm-panel__icon">
          <TriangleAlert size={24} aria-hidden="true" />
        </span>

        <h2 id="cancel-booking-title">{title}</h2>
        <p>{message}</p>

        <div className="confirm-panel__actions">
          <button
            type="button"
            ref={dismissRef}
            className="secondary-action"
            onClick={onDismiss}
          >
            {t('admin.cancel')}
          </button>
          <button
            type="button"
            className="danger-action"
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? t('common.loading') : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
