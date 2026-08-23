import {
  BadgeDollarSign,
  CalendarCheck,
  Inbox,
  Plane,
  TicketCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../app/routes/paths';
import { formatCurrency } from '../../shared/lib/format';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { useLanguage } from '../../i18n/useLanguage';
import { BarList } from './components/charts/BarList';
import { RevenueChart } from './components/charts/RevenueChart';
import { StatTile } from './components/StatTile';
import { AdminPanel } from './components/AdminPanel';
import { AdminStateBlock } from './components/AdminStateBlock';
import { useApiResource } from './hooks/useApiResource';

/** Status tones map to the validated status palette in admin.css. */
const STATUS_TONES = {
  confirmed: 'good',
  completed: 'info',
  pending: 'warning',
  cancelled: 'critical',
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { data, error, isLoading } = useApiResource('/admin/stats');
  useDocumentTitle('admin.nav.overview');

  const money = (value) => formatCurrency(value, language);

  if (isLoading || error || !data) {
    return (
      <AdminStateBlock
        isLoading={isLoading}
        error={error}
        emptyLabel={t('admin.empty')}
      />
    );
  }

  const {
    kpis,
    revenueByMonth,
    topRoutes,
    bookingsByStatus,
    cabinMix,
    recentBookings,
  } = data;

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>{t('admin.overviewTitle')}</h1>
          <p>{t('admin.overviewLead')}</p>
        </div>
      </header>

      <section className="stat-grid" aria-label={t('admin.kpis')}>
        <StatTile
          icon={BadgeDollarSign}
          label={t('admin.kpi.revenueMonth')}
          value={money(kpis.revenueThisMonth)}
          detail={t('admin.kpi.revenueTotal', {
            value: money(kpis.revenueTotal),
          })}
          tone="primary"
        />
        <StatTile
          icon={TicketCheck}
          label={t('admin.kpi.bookingsMonth')}
          value={kpis.bookingsThisMonth}
          detail={t('admin.kpi.bookingsToday', { count: kpis.bookingsToday })}
        />
        <StatTile
          icon={Users}
          label={t('admin.kpi.passengers')}
          value={kpis.passengers}
          detail={t('admin.kpi.averageValue', {
            value: money(kpis.averageBookingValue),
          })}
        />
        <StatTile
          icon={Plane}
          label={t('admin.kpi.upcomingFlights')}
          value={kpis.upcomingFlights.toLocaleString()}
          detail={t('admin.kpi.scheduled')}
        />
      </section>

      <div className="admin-grid">
        <AdminPanel
          title={t('admin.panel.revenue')}
          description={t('admin.panel.revenueLead')}
          className="admin-grid__wide"
        >
          <RevenueChart
            points={revenueByMonth}
            formatCurrency={money}
            emptyLabel={t('admin.empty')}
          />
        </AdminPanel>

        <AdminPanel title={t('admin.panel.status')}>
          <BarList
            emptyLabel={t('admin.empty')}
            items={Object.entries(bookingsByStatus ?? {}).map(
              ([status, total]) => ({
                key: status,
                label: t(`admin.status.${status}`),
                value: total,
                tone: STATUS_TONES[status],
              }),
            )}
          />
        </AdminPanel>

        <AdminPanel
          title={t('admin.panel.routes')}
          description={t('admin.panel.routesLead')}
        >
          <BarList
            emptyLabel={t('admin.empty')}
            items={(topRoutes ?? []).map((route) => ({
              key: route.route,
              label: `${route.originCity} → ${route.destinationCity}`,
              value: route.bookings,
            }))}
          />
        </AdminPanel>

        <AdminPanel title={t('admin.panel.cabins')}>
          <BarList
            emptyLabel={t('admin.empty')}
            items={Object.entries(cabinMix ?? {}).map(([cabin, total]) => ({
              key: cabin,
              label: t(`booking.class.${cabin}`),
              value: total,
            }))}
          />
        </AdminPanel>

        <AdminPanel
          title={t('admin.panel.recent')}
          className="admin-grid__wide"
          action={
            <Link to={ROUTES.adminBookings} className="admin-link">
              {t('admin.viewAll')}
            </Link>
          }
        >
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.table.pnr')}</th>
                  <th>{t('admin.table.contact')}</th>
                  <th>{t('admin.table.status')}</th>
                  <th className="admin-table__number">
                    {t('admin.table.total')}
                  </th>
                  <th>{t('admin.table.created')}</th>
                </tr>
              </thead>
              <tbody>
                {(recentBookings ?? []).map((booking) => (
                  <tr key={booking.pnr}>
                    <td className="admin-table__code">{booking.pnr}</td>
                    <td>{booking.contact_email}</td>
                    <td>
                      <span
                        className={`status-pill status-pill--${STATUS_TONES[booking.status]}`}
                      >
                        {t(`admin.status.${booking.status}`)}
                      </span>
                    </td>
                    <td className="admin-table__number">
                      {money(booking.total_amount)}
                    </td>
                    <td>{new Date(booking.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <AdminPanel title={t('admin.panel.inbox')}>
          <div className="inbox-summary">
            <Inbox size={26} aria-hidden="true" />
            <p className="inbox-summary__value">{kpis.unreadMessages}</p>
            <p className="inbox-summary__label">{t('admin.panel.inboxLead')}</p>
          </div>
        </AdminPanel>

        <AdminPanel title={t('admin.panel.today')}>
          <div className="inbox-summary">
            <CalendarCheck size={26} aria-hidden="true" />
            <p className="inbox-summary__value">{kpis.bookingsToday}</p>
            <p className="inbox-summary__label">
              {t('admin.kpi.bookingsTodayLabel')}
            </p>
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
