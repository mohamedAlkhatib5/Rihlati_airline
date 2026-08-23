import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Sets a per-route document title and meta description.
 *
 * A single-page app keeps one `<title>` unless something updates it, which
 * leaves every route sharing the same name in tabs, history and search results.
 */
export function useDocumentTitle(titleKey, descriptionKey) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const brand = t('brand.name');
    document.title = titleKey ? `${t(titleKey)} · ${brand}` : brand;

    if (!descriptionKey) return;

    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t(descriptionKey));
  }, [t, titleKey, descriptionKey, i18n.language]);
}
