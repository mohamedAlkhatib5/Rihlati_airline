import { useEffect, useRef } from 'react';
import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Blocking confirmation for a destructive action.
 *
 * Focus moves to the dialog on open and Escape closes it, so it behaves the
 * way a modal is expected to for keyboard and screen-reader users.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}) {
  const { t } = useTranslation();
  const confirmRef = useRef(null);

  useEffect(() => {
    confirmRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div className="modal-backdrop">
      <div
        className="modal-card modal-card--narrow"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className="confirm-icon">
          <TriangleAlert size={24} aria-hidden="true" />
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>

        <div className="modal-actions">
          <button type="button" className="admin-button" onClick={onCancel}>
            {t('admin.cancel')}
          </button>
          <button
            type="button"
            ref={confirmRef}
            className="admin-button admin-button--danger"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
