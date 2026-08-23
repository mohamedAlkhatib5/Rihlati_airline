import { useId, useState } from 'react';

/**
 * Monthly revenue as a single-series area + line.
 *
 * One series, so no legend — the panel title names it. The line is 2px, the
 * grid is recessive, and only the endpoint carries a direct label; hovering a
 * month reveals the rest.
 */
export function RevenueChart({ points, formatCurrency, emptyLabel }) {
  const gradientId = useId();
  const [hovered, setHovered] = useState(null);

  if (!points?.length) {
    return <p className="chart-empty">{emptyLabel}</p>;
  }

  const width = 720;
  const height = 240;
  const padding = { top: 20, right: 18, bottom: 30, left: 18 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const values = points.map((point) => point.revenue);
  const max = Math.max(...values, 1);

  const x = (index) =>
    padding.left +
    (points.length === 1
      ? plotWidth / 2
      : (index / (points.length - 1)) * plotWidth);
  const y = (value) => padding.top + plotHeight - (value / max) * plotHeight;

  const line = points
    .map((point, index) => `${x(index)},${y(point.revenue)}`)
    .join(' ');
  const area = `${padding.left},${padding.top + plotHeight} ${line} ${x(points.length - 1)},${padding.top + plotHeight}`;

  const last = points.at(-1);
  const active = hovered !== null ? points[hovered] : null;

  return (
    <figure className="chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Monthly revenue, ${points.length} months`}
        preserveAspectRatio="none"
        className="chart__svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--chart-primary)"
              stopOpacity="0.28"
            />
            <stop
              offset="100%"
              stopColor="var(--chart-primary)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* Recessive gridlines at quarter steps. */}
        {[0, 0.25, 0.5, 0.75, 1].map((step) => (
          <line
            key={step}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + plotHeight * step}
            y2={padding.top + plotHeight * step}
            className="chart__grid"
          />
        ))}

        <polygon points={area} fill={`url(#${gradientId})`} />
        <polyline points={line} className="chart__line" />

        {points.map((point, index) => (
          <circle
            key={point.month}
            cx={x(index)}
            cy={y(point.revenue)}
            r={hovered === index ? 6 : 4}
            className="chart__dot"
          />
        ))}

        {/* Invisible full-height hit areas — easier to hit than the dots. */}
        {points.map((point, index) => (
          <rect
            key={`hit-${point.month}`}
            x={x(index) - plotWidth / points.length / 2}
            y={padding.top}
            width={plotWidth / points.length}
            height={plotHeight}
            fill="transparent"
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>

      <figcaption className="chart__caption">
        <span>{points[0].month}</span>
        <span className="chart__endpoint">
          {active ? `${active.month} · ` : ''}
          {formatCurrency(active ? active.revenue : last.revenue)}
        </span>
        <span>{last.month}</span>
      </figcaption>
    </figure>
  );
}
