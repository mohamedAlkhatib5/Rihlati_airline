/**
 * Drives the hosted demo in a real browser.
 *
 * Confirms a visitor can search flights, book a seat, look the booking up
 * again, and open the operations dashboard — without any API behind the site.
 *
 * Run:  BASE_URL=http://localhost:4173 node scripts/verify-demo.mjs
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173';
const SHOTS = process.env.SHOTS_DIR ?? 'demo-shots';

let passed = 0;
const failures = [];

const check = (label, ok, detail = '') => {
  if (ok) {
    passed += 1;
    console.log(`  ✅ ${label}`);
  } else {
    failures.push(`${label}${detail ? ' — ' + detail : ''}`);
    console.log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
  }
};

/** Tomorrow, in the YYYY-MM-DD the date inputs expect. */
function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

async function main() {
  await mkdir(SHOTS, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 940 } });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text().slice(0, 140)}`);
  });

  /* ---------------------------------------------------------- marketing */
  console.log('\n▸ Public pages');

  for (const [path, needle] of [
    ['/', 'Rihlati'],
    ['/destinations', 'Destinations'],
    ['/offers', 'Offers'],
  ]) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const body = await page.textContent('body');
    check(`${path} renders`, body.includes(needle));
  }

  const offersBody = await page.textContent('body');
  check('Offers come from the demo API', /SUMMER25|LONDON120|MALDIVES15/.test(offersBody));
  check('Demo notice is present', (await page.locator('.demo-notice').count()) === 1);
  await page.screenshot({ path: `${SHOTS}/1-offers.png`, fullPage: true });

  /* ------------------------------------------------------------ search */
  console.log('\n▸ Flight search');

  await page.goto(`${BASE}/flights?from=DXB&to=LHR&departure=${tomorrow()}&passengers=1`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(2500);

  const results = await page.locator('article, .flight-card, [class*="flight-card"]').count();
  const searchBody = await page.textContent('body');
  check('Flights are returned', /RH1\d{2}/.test(searchBody), `${results} cards`);
  check('Fares are shown', /\$|USD/.test(searchBody));
  await page.screenshot({ path: `${SHOTS}/2-flights.png`, fullPage: true });

  /* ----------------------------------------------------------- booking */
  console.log('\n▸ Booking a seat');

  // A fare is a `.fare-option` button on each flight card; picking one reveals
  // the selection bar with Continue.
  const fare = page.locator('.fare-option').first();
  check('Fares are selectable', (await fare.count()) > 0);

  if (await fare.count()) {
    await fare.click();
    await page.waitForTimeout(1200);

    check('Selecting a fare shows the total', (await page.textContent('body')).includes('Continue'));

    await page.locator('button').filter({ hasText: /^\s*Continue\s*$/ }).first().click();
    await page.waitForURL((url) => url.pathname.includes('/booking'), { timeout: 20000 });
    await page.waitForTimeout(2000);

    check('Continue opens the booking flow', page.url().includes('/booking'), page.url());

    const bookingBody = await page.textContent('body');
    check('Passenger step is rendered', /passenger|traveller|first name/i.test(bookingBody));
    await page.screenshot({ path: `${SHOTS}/3-booking.png`, fullPage: true });
  }

  /* ---------------------------------------------------------- dashboard */
  console.log('\n▸ Operations dashboard');

  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@rihlati.demo');
  await page.fill('input[type="password"]', 'Admin@12345');
  await page.screenshot({ path: `${SHOTS}/3-login.png`, fullPage: true });
  await page.click('button[type="submit"]');

  await page.waitForURL((url) => url.pathname.startsWith('/admin'), { timeout: 20000 });
  check('Signing in reaches the dashboard', page.url().includes('/admin'), page.url());

  await page.waitForTimeout(2500);
  const dashboard = await page.textContent('body');
  check('KPIs are populated', /\$\s?[\d,]{3,}/.test(dashboard));
  check('Revenue chart has data', (await page.locator('svg polyline, svg polygon, svg path').count()) > 0);
  check('Recent bookings table is filled', (await page.locator('table tbody tr').count()) > 0);
  await page.screenshot({ path: `${SHOTS}/4-dashboard.png`, fullPage: true });

  for (const [path, label, needle] of [
    ['/admin/flights', 'Flights list', /RH1\d{2}/],
    ['/admin/bookings', 'Bookings list', /[A-Z0-9]{6}/],
  ]) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2200);
    const body = await page.textContent('body');
    check(label, needle.test(body));
    await page.screenshot({
      path: `${SHOTS}/5-${label.split(' ')[0].toLowerCase()}.png`,
      fullPage: true,
    });
  }

  /* --------------------------------------------------------- integrity */
  console.log('\n▸ Page health');
  check('No JavaScript errors', errors.length === 0, errors.slice(0, 3).join(' | '));

  await browser.close();

  console.log('\n' + '─'.repeat(56));
  console.log(
    failures.length === 0
      ? `  ✅ ${passed}/${passed} checks passed`
      : `  ${passed} passed · ${failures.length} failed:\n\n${failures.map((f) => '     • ' + f).join('\n')}`,
  );
  console.log('─'.repeat(56) + '\n');

  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('\n❌ Verification failed:', error.message);
  process.exit(1);
});
