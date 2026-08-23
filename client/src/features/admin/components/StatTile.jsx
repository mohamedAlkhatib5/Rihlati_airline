import { cx } from '../../../shared/lib/classNames';

/**
 * A single headline number.
 *
 * The value is the loudest thing in the tile; the label sits above it and any
 * supporting detail below, so a row of tiles scans in one pass.
 */
export function StatTile({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'default',
}) {
  return (
    <article className={cx('stat-tile', `stat-tile--${tone}`)}>
      <div className="stat-tile__head">
        <span className="stat-tile__label">{label}</span>
        {Icon && (
          <span className="stat-tile__icon">
            <Icon size={18} aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="stat-tile__value">{value}</p>
      {detail && <p className="stat-tile__detail">{detail}</p>}
    </article>
  );
}
