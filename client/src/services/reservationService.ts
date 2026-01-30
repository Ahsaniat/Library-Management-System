import api from './api';
import { ApiResponse, Reservation } from '../types';

export const reservationService = {
  async getMyReservations(): Promise<Reservation[]> {
    const response = await api.get<ApiResponse<{ reservations: Reservation[] }>>(
      '/reservations/my'
    );
    return response.data.data!.reservations;
  },

  async create(bookId: string): Promise<Reservation> {
    const response = await api.post<ApiResponse<{ reservation: Reservation }>>('/reservations', {
      bookId,
    });
    return response.data.data!.reservation;
  },

  async cancel(id: string, reason?: string): Promise<Reservation> {
    const response = await api.post<ApiResponse<{ reservation: Reservation }>>(
      `/reservations/${id}/cancel`,
      { reason }
    );
    return response.data.data!.reservation;
  },
};
