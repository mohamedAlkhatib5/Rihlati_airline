import { ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { getImageSet } from '../../lib/imageRegistry';
import { cx } from '../../lib/classNames';

/**
 * Renders an optimised, responsive `<picture>` with WebP + JPEG fallback.
 *
 * Intrinsic `width`/`height` are always emitted so the browser can reserve
 * space before the file arrives — this is what keeps CLS at zero. When the
 * asset is missing it degrades to a branded placeholder instead of a broken
 * image icon.
 *
 * @param {string} name     Base image name, e.g. `"paris"`.
 * @param {string} alt      Empty string marks the image as decorative.
 * @param {string} sizes    The `sizes` attribute; tells the browser which
 *                          variant to download before layout is known.
 * @param {'lazy'|'eager'} loading
 * @param {'high'|'low'|'auto'} fetchPriority
 */
export function ResponsiveImage({
  name,
  alt = '',
  sizes = '100vw',
  className,
  loading = 'lazy',
  fetchPriority = 'auto',
}) {
  const { t } = useTranslation();
  const image = getImageSet(name);

  if (!image) {
    return (
      <div
        className={cx('image-placeholder', className)}
        role="img"
        aria-label={alt}
      >
        <ImageOff size={30} aria-hidden="true" />
        <span>{t('common.imageUnavailable')}</span>
      </div>
    );
  }

  return (
    <picture>
      <source type="image/webp" srcSet={image.webpSrcSet} sizes={sizes} />
      <img
        src={image.fallbackSrc}
        srcSet={image.jpgSrcSet || undefined}
        sizes={sizes}
        alt={alt}
        width={image.width}
        height={image.height}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        className={className}
      />
    </picture>
  );
}
