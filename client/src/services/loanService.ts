import api from './api';
import { ApiResponse, Loan, PaginationMeta } from '../types';

export interface PaginatedLoans {
  loans: Loan[];
  pagination: PaginationMeta;
}

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
  async getMyLoans(status?: string, page = 1): Promise<PaginatedLoans> {
    const response = await api.get<ApiResponse<PaginatedLoans>>('/loans/my', {
      params: { ...(status ? { status } : {}), page },
    });
    return response.data.data!;
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

  async checkin(
    bookReference: string,
    condition?: 'new' | 'good' | 'fair' | 'poor' | 'damaged'
  ): Promise<{ loan: Loan; fine?: { amount: number } }> {
    const response = await api.post<
      ApiResponse<{ loan: Loan; fine?: { amount: number } }>
    >('/loans/checkin', { ...toCopyReference(bookReference), condition });
    return response.data.data!;
  },

  async getOverdue(page = 1): Promise<PaginatedLoans> {
    const response = await api.get<ApiResponse<PaginatedLoans>>('/loans/overdue', {
      params: { page },
    });
    return response.data.data!;
  },
};
