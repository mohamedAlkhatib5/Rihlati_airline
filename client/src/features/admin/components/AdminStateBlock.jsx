import { CircleAlert, Inbox, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * The three states every data screen needs: loading, failed, and nothing here.
 * Centralised so no screen ever renders a blank area while it waits.
 */
export function AdminStateBlock({ isLoading, error, isEmpty, emptyLabel }) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="admin-state" role="status" aria-live="polite">
        <LoaderCircle
          size={26}
          className="admin-state__spinner"
          aria-hidden="true"
        />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-state admin-state--error" role="alert">
        <CircleAlert size={26} aria-hidden="true" />
        <p>{error.message}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="admin-state">
        <Inbox size={26} aria-hidden="true" />
        <p>{emptyLabel}</p>
      </div>
    );
  }

  return null;
}
