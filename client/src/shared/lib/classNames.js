/**
 * Joins conditional class names, dropping anything falsy.
 *
 *   cx('card', isActive && 'card--active') // -> "card card--active"
 */
export function cx(...values) {
  return values.filter(Boolean).join(' ');
}
