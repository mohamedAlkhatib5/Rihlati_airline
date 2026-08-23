/**
 * Build-time registry of every optimised image variant.
 *
 * `scripts/optimize-images.mjs` emits `<name>-<width>.<ext>` files plus a
 * manifest of intrinsic dimensions. This module turns them into ready-to-use
 * `srcset` strings so components never hard-code an asset path.
 */
import manifest from '../../assets/images/manifest.json';

const FILES = import.meta.glob('../../assets/images/*.{webp,jpg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const VARIANT_PATTERN = /^(.+)-(\d+)\.(webp|jpg)$/;

const registry = new Map();

for (const [path, url] of Object.entries(FILES)) {
  const match = VARIANT_PATTERN.exec(path.split('/').pop());
  if (!match) continue;

  const [, name, width, extension] = match;
  if (!registry.has(name)) registry.set(name, { webp: [], jpg: [] });
  registry.get(name)[extension].push({ url, width: Number(width) });
}

for (const entry of registry.values()) {
  entry.webp.sort((a, b) => a.width - b.width);
  entry.jpg.sort((a, b) => a.width - b.width);
}

const toSrcSet = (variants) =>
  variants.map(({ url, width }) => `${url} ${width}w`).join(', ');

/**
 * @param {string} name Base file name, e.g. `"paris"`.
 * @returns {{ webpSrcSet: string, fallbackSrc: string, width: number, height: number } | null}
 */
export function getImageSet(name) {
  const entry = registry.get(name);
  if (!entry) return null;

  const widest = entry.jpg.at(-1) ?? entry.webp.at(-1);
  if (!widest) return null;

  const dimensions = manifest[name] ?? { width: 1280, height: 853 };

  return {
    webpSrcSet: toSrcSet(entry.webp),
    jpgSrcSet: toSrcSet(entry.jpg),
    fallbackSrc: widest.url,
    width: dimensions.width,
    height: dimensions.height,
  };
}

export const hasImage = (name) => registry.has(name);
