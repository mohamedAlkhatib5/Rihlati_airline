import { CircleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Shown when a request failed.
 *
 * Always offers a retry, because most failures here are transient — a dropped
 * connection or a server restart.
 */
export function ErrorState({ message, onRetry }) {
  const { t } = useTranslation();

  return (
    <div className="state-block state-block--error" role="alert">
      <span className="state-block__icon">
        <CircleAlert size={28} aria-hidden="true" />
      </span>
      <h3>{t('states.errorTitle')}</h3>
      <p>{message ?? t('states.errorText')}</p>
      {onRetry && (
        <button type="button" className="secondary-action" onClick={onRetry}>
          {t('states.retry')}
        </button>
      )}
    </div>
  );
}
