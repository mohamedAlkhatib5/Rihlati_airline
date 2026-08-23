import { cx } from '../../../../shared/lib/classNames';

/**
 * Horizontal bars for ranked magnitudes — routes, cabins, statuses.
 *
 * Every bar is directly labelled with its name and value, so the length is a
 * comparison aid rather than the only way to read the number.
 *
 * @param {Array<{key: string, label: string, value: number, tone?: string}>} items
 */
export function BarList({ items, emptyLabel, formatValue = (value) => value }) {
  if (!items?.length) {
    return <p className="chart-empty">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="bar-list">
      {items.map((item) => (
        <li key={item.key}>
          <div className="bar-list__row">
            <span className="bar-list__label">{item.label}</span>
            <span className="bar-list__value">{formatValue(item.value)}</span>
          </div>
          <div className="bar-list__track">
            <div
              className={cx(
                'bar-list__bar',
                item.tone && `bar-list__bar--${item.tone}`,
              )}
              style={{ inlineSize: `${(item.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
