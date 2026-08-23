import { cx } from '../../lib/classNames';

/**
 * The standard section heading block: eyebrow, title and optional lead text.
 *
 * @param {boolean} centered Centres the block and its text.
 * @param {'light'|'dark'} tone Adapts the eyebrow colour to the surface.
 */
export function SectionTitle({
  eyebrow,
  title,
  text,
  centered = true,
  tone = 'dark',
}) {
  return (
    <div className={cx('section-title', centered && 'section-title--centered')}>
      {eyebrow && (
        <span className={cx('eyebrow', tone === 'light' && 'eyebrow--on-dark')}>
          {eyebrow}
        </span>
      )}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}
