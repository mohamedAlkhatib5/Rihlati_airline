import { Languages } from 'lucide-react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../../app/routes/paths';
import { useLanguage } from '../../../i18n/useLanguage';

/**
 * The language switch and primary call-to-action in the header.
 *
 * Extracted so the desktop bar and the mobile off-canvas share one definition
 * instead of two copies of the same markup.
 */
export function NavActions() {
  const { t } = useTranslation();
  const { toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="site-header__actions">
      <Button
        type="button"
        className="language-button"
        onClick={toggleLanguage}
        aria-label={t('common.switchLanguage')}
      >
        <Languages size={18} aria-hidden="true" />
        <span>{t('common.languageLabel')}</span>
      </Button>

      <Button
        type="button"
        className="book-button"
        onClick={() => navigate(ROUTES.flights)}
      >
        {t('common.bookFlight')}
      </Button>
    </div>
  );
}
