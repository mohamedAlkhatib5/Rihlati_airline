import { CalendarX2, Plane } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '../../../shared/components/ui/EmptyState';
import { ErrorState } from '../../../shared/components/ui/ErrorState';
import { SkeletonList } from '../../../shared/components/ui/Skeleton';
import { FlightCard } from './FlightCard';

/**
 * One leg of the journey: the outbound or the return.
 *
 * Rendered twice for a round trip so the traveller picks each leg separately,
 * which is how every airline site works and keeps the choice explicit.
 */
export function SearchResults({
  title,
  flights,
  isLoading,
  error,
  selectedFareId,
  onSelectFare,
  onRetry,
}) {
  const { t } = useTranslation();

  return (
    <section className="search-leg" aria-label={title}>
      <header className="search-leg__head">
        <h2>
          <Plane size={18} aria-hidden="true" />
          {title}
        </h2>
        {!isLoading && !error && (
          <span className="search-leg__count">
            {t('search.resultCount', { count: flights?.length ?? 0 })}
          </span>
        )}
      </header>

      {isLoading && <SkeletonList count={3} label={t('common.loading')} />}

      {!isLoading && error && (
        <ErrorState message={error.message} onRetry={onRetry} />
      )}

      {!isLoading && !error && flights?.length === 0 && (
        <EmptyState
          icon={CalendarX2}
          title={t('search.emptyTitle')}
          description={t('search.emptyText')}
        />
      )}

      {!isLoading && !error && flights?.length > 0 && (
        <div className="search-leg__list">
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              selectedFareId={selectedFareId}
              onSelectFare={onSelectFare}
            />
          ))}
        </div>
      )}
    </section>
  );
}
