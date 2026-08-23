import { useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatCurrency } from '../../shared/lib/format';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useLanguage } from '../../i18n/useLanguage';
import { AdminPanel } from './components/AdminPanel';
import { AdminStateBlock } from './components/AdminStateBlock';
import { useApiResource } from '../../shared/hooks/useApiResource';

const STATUS_TONES = {
  confirmed: 'good',
  completed: 'info',
  pending: 'warning',
  cancelled: 'critical',
};

export default function BookingsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  useDocumentTitle('admin.nav.bookings');

  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, meta, error, isLoading } = useApiResource('/admin/bookings', {
    q: search,
    status,
    page,
    perPage: 15,
  });

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>{t('admin.bookings.title')}</h1>
          <p>{t('admin.bookings.lead')}</p>
        </div>
      </header>

      <AdminPanel title={t('admin.bookings.all')}>
        <form
          className="admin-filters"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(query.trim());
          }}
        >
          <div className="admin-search">
            <Search size={17} aria-hidden="true" />
            <label className="visually-hidden" htmlFor="booking-search">
              {t('admin.bookings.searchLabel')}
            </label>
            <input
              id="booking-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('admin.bookings.searchPlaceholder')}
            />
          </div>

          <label className="visually-hidden" htmlFor="booking-status">
            {t('admin.table.status')}
          </label>
          <select
            id="booking-status"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
          >
            <option value="">{t('admin.bookings.allStatuses')}</option>
            {Object.keys(STATUS_TONES).map((value) => (
              <option key={value} value={value}>
                {t(`admin.status.${value}`)}
              </option>
            ))}
          </select>

          <button type="submit" className="admin-button">
            {t('admin.flights.applyFilters')}
          </button>
        </form>

        <AdminStateBlock
          isLoading={isLoading}
          error={error}
          isEmpty={!isLoading && !error && data?.length === 0}
          emptyLabel={t('admin.bookings.empty')}
        />

        {!isLoading && !error && data?.length > 0 && (
          <>
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('admin.table.pnr')}</th>
                    <th>{t('admin.table.contact')}</th>
                    <th>{t('admin.bookings.travellers')}</th>
                    <th>{t('admin.table.route')}</th>
                    <th>{t('admin.table.status')}</th>
                    <th className="admin-table__number">
                      {t('admin.table.total')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((booking) => {
                    const first = booking.segments?.[0]?.flight;
                    const names = [
                      ...new Set(
                        booking.passengers?.map((p) => p.fullName) ?? [],
                      ),
                    ];

                    return (
                      <tr key={booking.pnr}>
                        <td className="admin-table__code">{booking.pnr}</td>
                        <td>{booking.contactEmail}</td>
                        <td>
                          <span className="passenger-names">
                            {names.join(', ')}
                          </span>
                        </td>
                        <td>
                          {first
                            ? `${first.origin?.iata} → ${first.destination?.iata}`
                            : '—'}
                        </td>
                        <td>
                          <span
                            className={`status-pill status-pill--${STATUS_TONES[booking.status]}`}
                          >
                            {t(`admin.status.${booking.status}`)}
                          </span>
                        </td>
                        <td className="admin-table__number">
                          {formatCurrency(booking.totalAmount, language)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {meta && meta.lastPage > 1 && (
              <nav
                className="admin-pagination"
                aria-label={t('admin.pagination')}
              >
                <button
                  type="button"
                  className="admin-button"
                  onClick={() => setPage((current) => current - 1)}
                  disabled={meta.currentPage <= 1}
                >
                  {t('admin.previous')}
                </button>
                <span>
                  {t('admin.pageOf', {
                    page: meta.currentPage,
                    total: meta.lastPage,
                  })}
                </span>
                <button
                  type="button"
                  className="admin-button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={meta.currentPage >= meta.lastPage}
                >
                  {t('admin.next')}
                </button>
              </nav>
            )}
          </>
        )}
      </AdminPanel>
    </div>
  );
}
