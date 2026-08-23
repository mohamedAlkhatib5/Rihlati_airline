import { SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { TRAVEL_CLASSES } from '../constants/bookingOptions';

const SORTS = ['departure', 'price', 'duration'];

/**
 * Filters sit in one row above the results and write straight to the URL, so
 * a filtered search can be bookmarked or shared.
 */
export function SearchFilters({ params, onChange }) {
  const { t } = useTranslation();

  return (
    <div className="search-filters">
      <span className="search-filters__label">
        <SlidersHorizontal size={16} aria-hidden="true" />
        {t('search.refine')}
      </span>

      <label htmlFor="filter-cabin">
        <span className="visually-hidden">{t('booking.travelClass')}</span>
        <select
          id="filter-cabin"
          value={params.cabin ?? ''}
          onChange={(event) => onChange({ cabin: event.target.value })}
        >
          <option value="">{t('search.anyCabin')}</option>
          {TRAVEL_CLASSES.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
      </label>

      <label htmlFor="filter-sort">
        <span className="visually-hidden">{t('search.sortBy')}</span>
        <select
          id="filter-sort"
          value={params.sort ?? 'departure'}
          onChange={(event) => onChange({ sort: event.target.value })}
        >
          {SORTS.map((value) => (
            <option key={value} value={value}>
              {t(`search.sort.${value}`)}
            </option>
          ))}
        </select>
      </label>

      <label htmlFor="filter-max-price" className="search-filters__price">
        <span className="visually-hidden">{t('search.maxPrice')}</span>
        <input
          id="filter-max-price"
          type="number"
          min="0"
          step="50"
          inputMode="numeric"
          placeholder={t('search.maxPrice')}
          value={params.maxPrice ?? ''}
          onChange={(event) => onChange({ maxPrice: event.target.value })}
        />
      </label>
    </div>
  );
}
