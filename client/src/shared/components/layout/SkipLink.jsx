import { useTranslation } from 'react-i18next';

import { MAIN_CONTENT_ID } from '../../constants/dom';

/**
 * First focusable element on the page: lets keyboard users jump past the
 * navigation straight to the content (WCAG 2.4.1).
 */
export function SkipLink() {
  const { t } = useTranslation();

  return (
    <a className="skip-link" href={`#${MAIN_CONTENT_ID}`}>
      {t('common.skipToContent')}
    </a>
  );
}
