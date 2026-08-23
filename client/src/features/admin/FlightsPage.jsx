import { useState } from 'react';
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../app/routes/paths';
import { api } from '../../shared/lib/apiClient';
import { formatCurrency } from '../../shared/lib/format';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useLanguage } from '../../i18n/useLanguage';
import { useAuth } from '../auth/useAuth';
import { AdminPanel } from './components/AdminPanel';
import { AdminStateBlock } from './components/AdminStateBlock';
import { FlightFormModal } from './components/FlightFormModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { useApiResource } from '../../shared/hooks/useApiResource';

const formatTime = (value) =>
  new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function FlightsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  useDocumentTitle('admin.nav.flights');

  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState(null);

  const { data, meta, error, isLoading, reload } = useApiResource(
    '/admin/flights',
    {
      q: search,
      status,
      page,
      perPage: 12,
    },
  );

  const applySearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(query.trim());
  };

  const handleSaved = (message) => {
    setEditing(null);
    setNotice({ type: 'success', message });
    reload();
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/admin/flights/${deleting.id}`);
      setNotice({ type: 'success', message: response.message });
      reload();
    } catch (caught) {
      setNotice({ type: 'error', message: caught.message });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>{t('admin.flights.title')}</h1>
          <p>{t('admin.flights.lead')}</p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="admin-button admin-button--primary"
            onClick={() => setEditing({})}
          >
            <Plus size={18} aria-hidden="true" />
            {t('admin.flights.add')}
          </button>
        )}
      </header>

      {notice && (
        <p
          className={`admin-notice admin-notice--${notice.type}`}
          role="status"
        >
          {notice.message}
        </p>
      )}

      <AdminPanel title={t('admin.flights.schedule')}>
        <form className="admin-filters" onSubmit={applySearch} role="search">
          <div className="admin-search">
            <Search size={17} aria-hidden="true" />
            <label className="visually-hidden" htmlFor="flight-search">
              {t('admin.flights.searchLabel')}
            </label>
            <input
              id="flight-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('admin.flights.searchPlaceholder')}
            />
          </div>

          <label className="visually-hidden" htmlFor="flight-status">
            {t('admin.table.status')}
          </label>
          <select
            id="flight-status"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
          >
            <option value="">{t('admin.flights.allStatuses')}</option>
            {['scheduled', 'delayed', 'departed', 'arrived', 'cancelled'].map(
              (value) => (
                <option key={value} value={value}>
                  {t(`admin.flightStatus.${value}`)}
                </option>
              ),
            )}
          </select>

          <button type="submit" className="admin-button">
            {t('admin.flights.applyFilters')}
          </button>
        </form>

        <AdminStateBlock
          isLoading={isLoading}
          error={error}
          isEmpty={!isLoading && !error && data?.length === 0}
          emptyLabel={t('admin.flights.empty')}
        />

        {!isLoading && !error && data?.length > 0 && (
          <>
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('admin.table.flight')}</th>
                    <th>{t('admin.table.route')}</th>
                    <th>{t('admin.table.departs')}</th>
                    <th>{t('admin.table.aircraft')}</th>
                    <th className="admin-table__number">
                      {t('admin.table.fare')}
                    </th>
                    <th>{t('admin.table.status')}</th>
                    <th className="admin-table__actions">
                      {t('admin.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((flight) => (
                    <tr key={flight.id}>
                      <td className="admin-table__code">
                        {flight.flightNumber}
                      </td>
                      <td>
                        <span className="route-cell">
                          <strong>{flight.origin?.iata}</strong>
                          <span aria-hidden="true">→</span>
                          <strong>{flight.destination?.iata}</strong>
                        </span>
                        <span className="route-cell__cities">
                          {flight.origin?.city?.en} –{' '}
                          {flight.destination?.city?.en}
                        </span>
                      </td>
                      <td>{formatTime(flight.departureAt)}</td>
                      <td>{flight.aircraft?.model}</td>
                      <td className="admin-table__number">
                        {formatCurrency(flight.basePrice, language)}
                      </td>
                      <td>
                        <span
                          className={`status-pill status-pill--${flight.status}`}
                        >
                          {t(`admin.flightStatus.${flight.status}`)}
                        </span>
                      </td>
                      <td className="admin-table__actions">
                        <Link
                          to={ROUTES.adminManifest.replace(
                            ':flightId',
                            flight.id,
                          )}
                          className="icon-button"
                          title={t('admin.flights.manifest')}
                        >
                          <Users size={17} aria-hidden="true" />
                          <span className="visually-hidden">
                            {t('admin.flights.manifest')}
                          </span>
                        </Link>

                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              className="icon-button"
                              onClick={() => setEditing(flight)}
                              title={t('admin.flights.edit')}
                            >
                              <Pencil size={17} aria-hidden="true" />
                              <span className="visually-hidden">
                                {t('admin.flights.edit')}
                              </span>
                            </button>
                            <button
                              type="button"
                              className="icon-button icon-button--danger"
                              onClick={() => setDeleting(flight)}
                              title={t('admin.flights.delete')}
                            >
                              <Trash2 size={17} aria-hidden="true" />
                              <span className="visually-hidden">
                                {t('admin.flights.delete')}
                              </span>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
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

      {editing && (
        <FlightFormModal
          flight={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title={t('admin.flights.deleteTitle')}
          message={t('admin.flights.deleteMessage', {
            flight: deleting.flightNumber,
          })}
          confirmLabel={t('admin.flights.delete')}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
