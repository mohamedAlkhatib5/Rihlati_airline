import { ArrowLeft, Download, Plane, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../app/routes/paths';
import { api } from '../../shared/lib/apiClient';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { AdminPanel } from './components/AdminPanel';
import { AdminStateBlock } from './components/AdminStateBlock';
import { StatTile } from './components/StatTile';
import { useApiResource } from './hooks/useApiResource';

const STATUS_TONES = {
  confirmed: 'good',
  completed: 'info',
  pending: 'warning',
  cancelled: 'critical',
};

export default function ManifestPage() {
  const { t } = useTranslation();
  const { flightId } = useParams();
  const { data, error, isLoading } = useApiResource(
    `/admin/flights/${flightId}/manifest`,
  );
  useDocumentTitle('admin.manifest.title');

  if (isLoading || error || !data) {
    return (
      <div className="admin-page">
        <AdminStateBlock isLoading={isLoading} error={error} />
      </div>
    );
  }

  const { flight, summary, passengers } = data;

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <Link
            to={ROUTES.adminFlights}
            className="admin-link admin-link--back"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {t('admin.manifest.back')}
          </Link>
          <h1>
            {t('admin.manifest.title')} · {flight.flightNumber}
          </h1>
          <p>
            {flight.origin.city} ({flight.origin.iata}) →{' '}
            {flight.destination.city} ({flight.destination.iata}) ·{' '}
            {new Date(flight.departureAt).toLocaleString(undefined, {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* A plain link, because the browser downloads the file itself. */}
        <a
          className="admin-button admin-button--primary"
          href={api.url(`/admin/flights/${flightId}/manifest.csv`)}
          download
        >
          <Download size={18} aria-hidden="true" />
          {t('admin.manifest.export')}
        </a>
      </header>

      <section className="stat-grid stat-grid--compact">
        <StatTile
          icon={Users}
          label={t('admin.manifest.passengers')}
          value={summary.passengers}
          detail={t('admin.manifest.capacity', { count: flight.capacity })}
          tone="primary"
        />
        <StatTile
          icon={Plane}
          label={t('admin.manifest.loadFactor')}
          value={`${summary.loadFactor}%`}
          detail={flight.aircraft}
        />
        <StatTile
          icon={Users}
          label={t('admin.manifest.checkedIn')}
          value={summary.checkedIn}
          detail={t('admin.manifest.ofTotal', { count: summary.passengers })}
        />
      </section>

      <AdminPanel
        title={t('admin.manifest.list')}
        description={t('admin.manifest.listLead')}
      >
        {passengers.length === 0 ? (
          <p className="chart-empty">{t('admin.manifest.empty')}</p>
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.manifest.seat')}</th>
                  <th>{t('admin.manifest.name')}</th>
                  <th>{t('admin.manifest.type')}</th>
                  <th>{t('admin.manifest.cabin')}</th>
                  <th>{t('admin.table.pnr')}</th>
                  <th>{t('admin.table.status')}</th>
                  <th>{t('admin.manifest.checkedIn')}</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((passenger) => (
                  <tr key={passenger.id}>
                    <td className="seat-cell">{passenger.seatNumber ?? '—'}</td>
                    <td>{passenger.fullName}</td>
                    <td>{t(`admin.passengerType.${passenger.type}`)}</td>
                    <td>
                      {passenger.cabin
                        ? t(`booking.class.${passenger.cabin}`)
                        : '—'}
                    </td>
                    <td className="admin-table__code">
                      {passenger.booking?.pnr}
                    </td>
                    <td>
                      <span
                        className={`status-pill status-pill--${STATUS_TONES[passenger.booking?.status]}`}
                      >
                        {t(`admin.status.${passenger.booking?.status}`)}
                      </span>
                    </td>
                    <td>
                      {passenger.checkedIn ? t('admin.yes') : t('admin.no')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
