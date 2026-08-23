import { api } from '../../../shared/lib/apiClient';

/** Search parameters, mapped from the URL query string. */
export const searchFlights = (params) => api.get('/flights/search', params);

export const fetchSeatMap = (flightId, cabin) =>
  api.get(`/flights/${flightId}/seat-map`, { cabin });
