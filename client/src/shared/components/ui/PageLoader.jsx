import { useTranslation } from 'react-i18next';

/**
 * Suspense fallback shown while a lazily-loaded route chunk downloads.
 * Sized to roughly match a page hero so the swap is not jarring.
 */
export function PageLoader() {
  const { t } = useTranslation();

  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader__spinner" aria-hidden="true" />
      <span className="visually-hidden">{t('common.loading')}</span>
    </div>
  );
}
