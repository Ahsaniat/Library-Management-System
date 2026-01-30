import api from './api';
import { ApiResponse, Loan } from '../types';

export const loanService = {
  async getMyLoans(status?: string): Promise<Loan[]> {
    const response = await api.get<ApiResponse<{ loans: Loan[] }>>('/loans/my', {
      params: status ? { status } : {},
    });
    return response.data.data!.loans;
  },

  async renew(loanId: string): Promise<Loan> {
    const response = await api.post<ApiResponse<{ loan: Loan }>>(`/loans/${loanId}/renew`);
    return response.data.data!.loan;
  },

  async checkout(bookCopyId: string, userId: string): Promise<Loan> {
    const response = await api.post<ApiResponse<{ loan: Loan }>>('/loans/checkout', {
      bookCopyId,
      userId,
    });
    return response.data.data!.loan;
  },

  async checkin(bookCopyId: string): Promise<{ loan: Loan; fine?: { amount: number } }> {
    const response = await api.post<
      ApiResponse<{ loan: Loan; fine?: { amount: number } }>
    >('/loans/checkin', { bookCopyId });
    return response.data.data!;
  },

  async getOverdue(): Promise<Loan[]> {
    const response = await api.get<ApiResponse<{ loans: Loan[] }>>('/loans/overdue');
    return response.data.data!.loans;
  },
};
