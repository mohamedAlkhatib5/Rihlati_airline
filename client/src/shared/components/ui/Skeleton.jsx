import { cx } from '../../lib/classNames';

/**
 * Placeholder that holds the shape of content while it loads.
 *
 * Reserving the real layout keeps the page from jumping when data arrives,
 * which a bare spinner cannot do.
 */
export function Skeleton({ className, width, height, rounded = 'md' }) {
  return (
    <span
      className={cx('skeleton', `skeleton--${rounded}`, className)}
      style={{ inlineSize: width, blockSize: height }}
      aria-hidden="true"
    />
  );
}

/** A stack of skeleton cards, sized to match flight results. */
export function SkeletonList({ count = 3, label }) {
  return (
    <div className="skeleton-list" role="status" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton-card__row">
            <Skeleton width="72px" height="20px" />
            <Skeleton width="120px" height="20px" />
          </div>
          <Skeleton width="60%" height="30px" />
          <div className="skeleton-card__row">
            <Skeleton width="90px" height="44px" rounded="lg" />
            <Skeleton width="90px" height="44px" rounded="lg" />
            <Skeleton width="90px" height="44px" rounded="lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
