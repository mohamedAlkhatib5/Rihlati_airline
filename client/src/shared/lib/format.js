/**
 * Locale-aware formatting helpers built on the native `Intl` APIs, so numbers,
 * currency and dates follow the conventions of the active language.
 */

const LOCALES = {
  en: 'en-US',
  // `-u-nu-latn` keeps Latin digits in Arabic, which is what travel sites in
  // the region use for fares and dates.
  ar: 'ar-AE-u-nu-latn',
};

const resolveLocale = (language) => LOCALES[language] ?? LOCALES.en;

export function formatCurrency(amount, language, currency = 'USD') {
  return new Intl.NumberFormat(resolveLocale(language), {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value, language) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(resolveLocale(language), {
    dateStyle: 'medium',
  }).format(date);
}

/** `YYYY-MM-DD` for today, in local time — safe as an `<input type="date">` min. */
export function todayAsInputValue() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}
