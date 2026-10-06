import api from './api';
import { ApiResponse, PaginationMeta, Reservation } from '../types';

export interface PaginatedReservations {
  reservations: Reservation[];
  pagination: PaginationMeta;
}

export const reservationService = {
  async getMyReservations(page = 1): Promise<PaginatedReservations> {
    const response = await api.get<ApiResponse<PaginatedReservations>>('/reservations/my', {
      params: { page },
    });
    return response.data.data!;
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
