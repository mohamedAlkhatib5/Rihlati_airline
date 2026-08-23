import { api } from '../../../shared/lib/apiClient';

export const createBooking = (payload) => api.post('/bookings', payload);

export const findBooking = (pnr, email) =>
  api.get(`/bookings/${encodeURIComponent(pnr)}`, { email });

export const cancelBooking = (pnr, email) =>
  api.post(`/bookings/${encodeURIComponent(pnr)}/cancel`, { email });

export const validateOffer = (code, subtotal) =>
  api.post('/offers/validate', { code, subtotal });
