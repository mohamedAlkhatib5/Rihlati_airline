import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { cx } from '../../lib/classNames';
import './logo.css';

/**
 * The Rihlati identity: gradient tile + paper-plane mark + bilingual wordmark.
 *
 * Rendered from a single component so the header, off-canvas menu and footer
 * can never drift apart.
 *
 * @param {'light'|'dark'} tone   Colour of the wordmark, matched to its surface.
 * @param {'sm'|'md'}      size   Visual scale.
 * @param {boolean}        showTagline Whether to render the "Airlines" line.
 */
export function Logo({ tone = 'light', size = 'md', showTagline = true }) {
  const { t } = useTranslation();
  const gradientId = useId();

  return (
    <span
      className={cx('brand-logo', `brand-logo--${tone}`, `brand-logo--${size}`)}
    >
      <span className="brand-logo__mark">
        <svg
          viewBox="0 0 24 24"
          role="img"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3ec1ff" />
              <stop offset="100%" stopColor="#0b72e7" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="7" fill={`url(#${gradientId})`} />
          <path
            d="M19.5 4.5 4.5 10.8l6.1 2.6 2.6 6.1z"
            fill="#ffffff"
            fillOpacity="0.95"
          />
          <path
            d="M19.5 4.5 10.6 13.4l2.6 6.1z"
            fill="#ffffff"
            fillOpacity="0.55"
          />
        </svg>
      </span>

      <span className="brand-logo__text">
        <span className="brand-logo__name">{t('brand.name')}</span>
        {showTagline && (
          <span className="brand-logo__tagline">{t('brand.tagline')}</span>
        )}
      </span>
    </span>
  );
}
