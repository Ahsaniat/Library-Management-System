import api from './api';
import { ApiResponse, Loan } from '../types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export interface CopyReference {
  bookCopyId?: string;
  barcode?: string;
}

/** Accepts either a copy UUID or a barcode from the same scanner input. */
export function toCopyReference(value: string): CopyReference {
  const trimmed = value.trim();
  return UUID_PATTERN.test(trimmed) ? { bookCopyId: trimmed } : { barcode: trimmed };
}

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

  async selfCheckout(bookId: string): Promise<Loan> {
    const response = await api.post<ApiResponse<{ loan: Loan }>>('/loans/self-checkout', {
      bookId,
    });
    return response.data.data!.loan;
  },

  async checkout(bookReference: string, userId: string, overrideHold = false): Promise<Loan> {
    const response = await api.post<ApiResponse<{ loan: Loan }>>('/loans/checkout', {
      ...toCopyReference(bookReference),
      userId,
      overrideHold,
    });
    return response.data.data!.loan;
  },

  async checkin(bookReference: string): Promise<{ loan: Loan; fine?: { amount: number } }> {
    const response = await api.post<
      ApiResponse<{ loan: Loan; fine?: { amount: number } }>
    >('/loans/checkin', toCopyReference(bookReference));
    return response.data.data!;
  },

  async getOverdue(): Promise<Loan[]> {
    const response = await api.get<ApiResponse<{ loans: Loan[] }>>('/loans/overdue');
    return response.data.data!.loans;
  },
};
