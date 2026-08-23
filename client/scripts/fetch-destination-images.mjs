/**
 * Downloads a freely licensed photograph for each destination.
 *
 * Source: Wikimedia Commons, reached through the public Wikipedia REST API
 * (no API key required). For each destination we try a list of candidate
 * articles — landmarks first, because a city article's lead image is often a
 * collage that reads poorly inside a card — and keep the first landscape
 * photograph large enough to survive resizing.
 *
 * Attribution for every downloaded file is written to `docs/IMAGE-CREDITS.md`.
 *
 * Run with: npm run images:fetch
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SOURCE_DIR = join(ROOT, 'src/assets/images-src');
const CREDITS_FILE = join(ROOT, '../docs/IMAGE-CREDITS.md');
const CREDITS_DATA = join(ROOT, '../docs/image-credits.json');

const USER_AGENT = 'RihlatiAirlinesDemo/1.0 (educational portfolio project)';
const MIN_WIDTH = 1200;
const MIN_ASPECT = 1.3; // Landscape only — collages and portraits are rejected.

/** Landmark article first, city article as the fallback. */
const DESTINATIONS = [
  { id: 'newyork', articles: ['Manhattan', 'New York City'] },
  { id: 'tokyo', articles: ['Tokyo', 'Tokyo Skytree'] },
  { id: 'rome', articles: ['Colosseum', 'Rome'] },
  { id: 'barcelona', articles: ['Sagrada Família', 'Barcelona'] },
  { id: 'cairo', articles: ['Great Sphinx of Giza', 'Giza pyramid complex'] },
  { id: 'riyadh', articles: ['Kingdom Centre', 'Riyadh'] },
  { id: 'doha', articles: ['Museum of Islamic Art, Doha', 'Doha'] },
  { id: 'amsterdam', articles: ['Canals of Amsterdam', 'Amsterdam'] },
  { id: 'singapore', articles: ['Marina Bay Sands', 'Gardens by the Bay'] },
  { id: 'bangkok', articles: ['Wat Arun', 'Bangkok'] },
  { id: 'kualalumpur', articles: ['Petronas Towers', 'Kuala Lumpur'] },
  { id: 'casablanca', articles: ['Hassan II Mosque', 'Casablanca'] },
  { id: 'athens', articles: ['Parthenon', 'Acropolis of Athens'] },
  { id: 'vienna', articles: ['Schönbrunn Palace', 'Vienna'] },
  { id: 'zurich', articles: ['Zurich', 'Lake Zurich'] },
  { id: 'beirut', articles: ['Beirut', 'Raouché'] },
  { id: 'amman', articles: ['Amman Citadel', 'Amman'] },
  { id: 'muscat', articles: ['Sultan Qaboos Grand Mosque', 'Muscat'] },
  { id: 'jeddah', articles: ['Al-Balad, Jeddah', 'Jeddah Corniche', 'King Fahd Fountain'] },
  { id: 'toronto', articles: ['CN Tower', 'Toronto'] },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Polite fetch: spaces requests out and backs off when Wikimedia rate-limits
 * us, so a long run does not get cut short by HTTP 429.
 */
async function request(url, attempt = 0) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });

  if (response.status === 429 && attempt < 4) {
    await wait(5000 * (attempt + 1));
    return request(url, attempt + 1);
  }

  await wait(1100);
  return response;
}

/** Strips tracking parameters Wikipedia appends to image URLs. */
const cleanUrl = (url) => url.split('?')[0];

async function findImage(article) {
  const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article)}`;
  const response = await request(endpoint);
  if (!response.ok) return null;

  const summary = await response.json();
  const image = summary.originalimage;
  if (!image?.source) return null;

  const aspect = image.width / image.height;
  if (image.width < MIN_WIDTH || aspect < MIN_ASPECT) return null;

  return { url: cleanUrl(image.source), article: summary.title };
}

/** Looks up author and licence so the download can be credited properly. */
async function findLicence(imageUrl) {
  const fileName = decodeURIComponent(imageUrl.split('/').pop());
  const endpoint =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo' +
    `&iiprop=extmetadata&titles=${encodeURIComponent(`File:${fileName}`)}`;

  try {
    const response = await request(endpoint);
    const data = await response.json();
    const pages = Object.values(data.query?.pages ?? {});
    const meta = pages[0]?.imageinfo?.[0]?.extmetadata ?? {};

    return {
      fileName,
      licence: meta.LicenseShortName?.value ?? 'See Commons page',
      author: (meta.Artist?.value ?? 'Unknown')
        .replace(/<[^>]*>/g, '')
        .trim()
        .slice(0, 80),
      page: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName)}`,
    };
  } catch {
    return { fileName, licence: 'Unknown', author: 'Unknown', page: '' };
  }
}

async function download(url, destination) {
  const response = await request(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, buffer);
  return buffer.length;
}

async function main() {
  await mkdir(SOURCE_DIR, { recursive: true });
  await mkdir(join(ROOT, '../docs'), { recursive: true });

  // Attribution accumulates across runs, so re-running to fill gaps never
  // drops the credits of images downloaded earlier.
  const credits = existsSync(CREDITS_DATA)
    ? JSON.parse(await readFile(CREDITS_DATA, 'utf8'))
    : [];

  for (const { id, articles } of DESTINATIONS) {
    if (existsSync(join(SOURCE_DIR, `${id}.jpg`))) {
      console.log(`${id.padEnd(14)} already present — skipping`);
      continue;
    }

    let found = null;

    for (const article of articles) {
      try {
        found = await findImage(article);
      } catch {
        found = null;
      }
      if (found) break;
    }

    if (!found) {
      console.log(`${id.padEnd(14)} SKIPPED — no landscape image found`);
      continue;
    }

    try {
      const bytes = await download(found.url, join(SOURCE_DIR, `${id}.jpg`));
      const licence = await findLicence(found.url);
      credits.push({ id, ...licence, article: found.article });
      console.log(
        `${id.padEnd(14)} ${found.article.padEnd(28)} ${(bytes / 1024).toFixed(0).padStart(6)} KB`,
      );
    } catch (error) {
      console.log(`${id.padEnd(14)} FAILED — ${error.message}`);
    }
  }

  credits.sort((a, b) => a.id.localeCompare(b.id));
  await writeFile(CREDITS_DATA, `${JSON.stringify(credits, null, 2)}\n`);

  const body = credits
    .map(
      ({ id, article, author, licence, page }) =>
        `| \`${id}\` | ${article} | ${author} | ${licence} | [Commons](${page}) |`,
    )
    .join('\n');

  await writeFile(
    CREDITS_FILE,
    `# Image credits\n\nDestination photographs come from Wikimedia Commons and are used under\ntheir respective free licences. Each row links to the file page, where the\nfull licence text and author details live.\n\n| Asset | Subject | Author | Licence | Source |\n| ----- | ------- | ------ | ------- | ------ |\n${body}\n`,
  );

  console.log(`\n${credits.length} images downloaded. Credits -> docs/IMAGE-CREDITS.md`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
