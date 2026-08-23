/**
 * Destination catalogue.
 *
 * Shaped like the API response that will replace it, so swapping the static
 * array for a fetch only changes where the data comes from — not how any
 * component reads it.
 *
 * `image` is the base file name in `src/assets/images`; a destination whose
 * asset is not available yet renders a branded placeholder instead.
 */
export const destinations = [
  {
    id: 'dubai',
    image: 'dubai',
    priceFrom: 399,
    city: { en: 'Dubai', ar: 'دبي' },
    country: { en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة' },
    featured: true,
  },
  {
    id: 'london',
    image: 'london',
    priceFrom: 649,
    city: { en: 'London', ar: 'لندن' },
    country: { en: 'United Kingdom', ar: 'المملكة المتحدة' },
    featured: true,
  },
  {
    id: 'paris',
    image: 'paris',
    priceFrom: 579,
    city: { en: 'Paris', ar: 'باريس' },
    country: { en: 'France', ar: 'فرنسا' },
    featured: true,
  },
  {
    id: 'istanbul',
    image: 'istanbul',
    priceFrom: 459,
    city: { en: 'Istanbul', ar: 'إسطنبول' },
    country: { en: 'Türkiye', ar: 'تركيا' },
    featured: false,
  },
  {
    id: 'new-york',
    // TODO: add `newyork.jpg` to src/assets/images-src and re-run
    // `npm run images:build`. Until then the card shows a placeholder.
    image: 'newyork',
    priceFrom: 899,
    city: { en: 'New York', ar: 'نيويورك' },
    country: { en: 'United States', ar: 'الولايات المتحدة' },
    featured: false,
  },
  {
    id: 'maldives',
    image: 'maldives',
    priceFrom: 729,
    city: { en: 'Maldives', ar: 'المالديف' },
    country: { en: 'Maldives', ar: 'جزر المالديف' },
    featured: false,
  },
];

/** Reads a localised field with a graceful fallback to English. */
export const localise = (field, language) => field[language] ?? field.en;

export const getFeaturedDestinations = () =>
  destinations.filter((destination) => destination.featured);
