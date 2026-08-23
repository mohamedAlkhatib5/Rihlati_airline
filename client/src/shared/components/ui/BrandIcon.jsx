import { brandIconPaths } from './brandIconPaths';

/**
 * Renders a social brand glyph from the locally stored Simple Icons paths.
 * Always decorative — the accessible name lives on the surrounding link.
 */
export function BrandIcon({ name, size = 19 }) {
  const icon = brandIconPaths[name];
  if (!icon) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={icon.path} />
    </svg>
  );
}
