/**
 * Image optimisation pipeline.
 *
 * Reads the original photography from `src/assets/images-src` and emits
 * responsive, web-optimised variants into `src/assets/images`.
 *
 * Run with: npm run images:build
 */
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SOURCE_DIR = join(ROOT, 'src/assets/images-src');
const OUTPUT_DIR = join(ROOT, 'src/assets/images');

/** Widths emitted for every photograph, matched to our layout breakpoints. */
const PHOTO_WIDTHS = [640, 1280, 1920];
/** Width used for the single JPEG kept as a fallback for older browsers. */
const FALLBACK_WIDTH = 1280;

const WEBP_OPTIONS = { quality: 76, effort: 5 };
const JPEG_OPTIONS = { quality: 78, mozjpeg: true, progressive: true };

const formatSize = (bytes) => `${(bytes / 1024).toFixed(0).padStart(6)} KB`;

async function optimiseTransparent(file) {
  const name = basename(file, extname(file));
  const input = join(SOURCE_DIR, file);
  const results = [];

  for (const width of [900, 1600]) {
    const output = join(OUTPUT_DIR, `${name}-${width}.webp`);
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ ...WEBP_OPTIONS, alphaQuality: 80 })
      .toFile(output);
    results.push(output);
  }

  return results;
}

async function optimisePhoto(file) {
  const name = basename(file, extname(file));
  const input = join(SOURCE_DIR, file);
  const results = [];

  for (const width of PHOTO_WIDTHS) {
    const output = join(OUTPUT_DIR, `${name}-${width}.webp`);
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp(WEBP_OPTIONS)
      .toFile(output);
    results.push(output);
  }

  const fallback = join(OUTPUT_DIR, `${name}-${FALLBACK_WIDTH}.jpg`);
  await sharp(input)
    .resize({ width: FALLBACK_WIDTH, withoutEnlargement: true })
    .jpeg(JPEG_OPTIONS)
    .toFile(fallback);
  results.push(fallback);

  return results;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const files = (await readdir(SOURCE_DIR)).filter((file) =>
    /\.(jpe?g|png)$/i.test(file),
  );

  let sourceBytes = 0;
  let outputBytes = 0;
  /** Intrinsic dimensions per image, consumed by <ResponsiveImage> to reserve
   *  layout space and eliminate cumulative layout shift. */
  const manifest = {};

  for (const file of files) {
    const { size } = await stat(join(SOURCE_DIR, file));
    sourceBytes += size;

    const { width, height } = await sharp(join(SOURCE_DIR, file)).metadata();
    manifest[basename(file, extname(file))] = { width, height };

    const isTransparent = extname(file).toLowerCase() === '.png';
    const written = isTransparent
      ? await optimiseTransparent(file)
      : await optimisePhoto(file);

    let variantBytes = 0;
    for (const output of written) {
      variantBytes += (await stat(output)).size;
    }
    outputBytes += variantBytes;

    console.log(
      `${file.padEnd(26)} ${formatSize(size)}  ->  ${formatSize(variantBytes)}  (${written.length} variants)`,
    );
  }

  await writeFile(
    join(OUTPUT_DIR, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  const saved = 1 - outputBytes / sourceBytes;
  console.log(
    `\nTotal ${formatSize(sourceBytes)} -> ${formatSize(outputBytes)}  (${(saved * 100).toFixed(1)}% smaller)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
