import { useCallback, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '../../app/routes/paths';
import { PageHero } from '../../shared/components/layout/PageHero';
import { PageTransition } from '../../shared/components/layout/PageTransition';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { readDraft, writeDraft } from '../booking/bookingDraft';
import { BookingForm } from './components/BookingForm';
import { SearchFilters } from './components/SearchFilters';
import { SearchResults } from './components/SearchResults';
import { SelectionBar } from './components/SelectionBar';
import { useFlightSearch } from './hooks/useFlightSearch';
import './styles/flights.css';
import './styles/search.css';

/** Turns a card selection into the shape the booking draft stores. */
const toLeg = (flight, fare) => ({
  flightId: flight.id,
  fareId: fare.id,
  cabin: fare.cabin,
  price: fare.price,
  flight,
});

export default function FlightsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useDocumentTitle('nav.flights', 'flights.heroText');

  const {
    params,
    hasSearch,
    results,
    meta,
    error,
    isLoading,
    updateSearch,
    isRoundTrip,
  } = useFlightSearch();

  const [outbound, setOutbound] = useState(null);
  const [returnLeg, setReturnLeg] = useState(null);

  const passengerCount = Number(params.passengers ?? 1);

  // Selecting a fare on the return leg must not disturb the outbound choice.
  const selectOutbound = useCallback(
    (flight, fare) => setOutbound(toLeg(flight, fare)),
    [],
  );
  const selectReturn = useCallback(
    (flight, fare) => setReturnLeg(toLeg(flight, fare)),
    [],
  );

  const continueToBooking = () => {
    writeDraft({
      ...readDraft(),
      outbound,
      return: isRoundTrip ? returnLeg : null,
      passengerCount,
      passengers: [],
      seats: { outbound: [], return: [] },
    });

    navigate(ROUTES.booking);
  };

  return (
    <PageTransition>
      <PageHero
        image="hero-airplane"
        eyebrow={t('flights.heroEyebrow')}
        title={t('flights.heroTitle')}
        text={t('flights.heroText')}
      />

      <section className="section-space page-soft-bg">
        <Container>
          {/* The form is pre-filled from the URL, so an edited search is one
              change away rather than a fresh start. */}
          <BookingForm compact initialValues={params} />

          {hasSearch && (
            <div className="search-results">
              <SearchFilters params={params} onChange={updateSearch} />

              <div
                className={
                  isRoundTrip ? 'search-legs search-legs--pair' : 'search-legs'
                }
              >
                <SearchResults
                  title={t('search.outboundOn', { date: params.departure })}
                  flights={results?.outbound}
                  isLoading={isLoading}
                  error={error}
                  selectedFareId={outbound?.fareId}
                  onSelectFare={selectOutbound}
                  onRetry={() => updateSearch({})}
                />

                {isRoundTrip && (
                  <SearchResults
                    title={t('search.returnOn', { date: params.returnDate })}
                    flights={results?.return}
                    isLoading={isLoading}
                    error={error}
                    selectedFareId={returnLeg?.fareId}
                    onSelectFare={selectReturn}
                    onRetry={() => updateSearch({})}
                  />
                )}
              </div>

              {meta && (
                <p className="search-meta">
                  {t('search.route', {
                    origin: meta.origin,
                    destination: meta.destination,
                  })}
                </p>
              )}
            </div>
          )}
        </Container>
      </section>

      <SelectionBar
        outbound={outbound}
        returnLeg={returnLeg}
        isRoundTrip={isRoundTrip}
        passengerCount={passengerCount}
        onContinue={continueToBooking}
      />
    </PageTransition>
  );
}
