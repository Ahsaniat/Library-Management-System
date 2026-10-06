import api from './api';
import { ApiResponse, Fine, PaginationMeta, Payment } from '../types';

export interface PaginatedFines {
  fines: Fine[];
  pagination: PaginationMeta;
}

export interface PayFineData {
  amount: number;
  method: 'cash' | 'card' | 'online' | 'other';
  transactionId?: string;
  notes?: string;
}

export const fineService = {
  async getMyFines(page = 1): Promise<PaginatedFines> {
    const response = await api.get<ApiResponse<PaginatedFines>>('/fines/my', {
      params: { page },
    });
    return response.data.data!;
  },

  async getMySummary(): Promise<number> {
    const response = await api.get<ApiResponse<{ outstanding: number }>>('/fines/summary/my');
    return response.data.data!.outstanding;
  },

  async getAllFines(params: {
    status?: string;
    userId?: string;
    page?: number;
  }): Promise<PaginatedFines> {
    const response = await api.get<ApiResponse<PaginatedFines>>('/fines', { params });
    return response.data.data!;
  },

  async payFine(id: string, data: PayFineData): Promise<{ fine: Fine; payment: Payment }> {
    const response = await api.post<ApiResponse<{ fine: Fine; payment: Payment }>>(
      `/fines/${id}/pay`,
      data
    );
    return response.data.data!;
  },

  async waiveFine(id: string, reason: string): Promise<Fine> {
    const response = await api.post<ApiResponse<{ fine: Fine }>>(`/fines/${id}/waive`, {
      reason,
    });
    return response.data.data!.fine;
  },
};
