import { cx } from '../../lib/classNames';

const WAVE_PATH =
  'M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z';

/**
 * Decorative wave that blends one section into the next.
 *
 * @param {'top'|'bottom'} position Which edge of the parent section to sit on.
 */
export function WaveDivider({ position = 'top', className }) {
  return (
    <div
      className={cx('wave-divider', `wave-divider--${position}`, className)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" focusable="false">
        <path d={WAVE_PATH} />
      </svg>
    </div>
  );
}
