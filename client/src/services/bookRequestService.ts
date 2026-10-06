import api from './api';
import { ApiResponse, PaginationMeta } from '../types';

export interface BookRequest {
  id: string;
  userId: string;
  title: string;
  author?: string;
  isbn?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'acquired' | 'cancelled';
  adminNotes?: string;
  processedAt?: string;
  createdAt: string;
}

export interface PaginatedBookRequests {
  requests: BookRequest[];
  pagination: PaginationMeta;
}

export interface CreateBookRequestData {
  title: string;
  author?: string;
  isbn?: string;
  reason?: string;
}

export const bookRequestService = {
  async create(data: CreateBookRequestData): Promise<BookRequest> {
    const response = await api.post<ApiResponse<{ request: BookRequest }>>('/book-requests', data);
    return response.data.data!.request;
  },

  async getMyRequests(page = 1): Promise<PaginatedBookRequests> {
    const response = await api.get<ApiResponse<PaginatedBookRequests>>('/book-requests/my', {
      params: { page },
    });
    return response.data.data!;
  },

  async cancel(id: string): Promise<BookRequest> {
    const response = await api.post<ApiResponse<{ request: BookRequest }>>(`/book-requests/${id}/cancel`);
    return response.data.data!.request;
  },

  async getAllRequests(status?: string, page = 1): Promise<PaginatedBookRequests> {
    const response = await api.get<ApiResponse<PaginatedBookRequests>>('/book-requests', {
      params: { ...(status ? { status } : {}), page },
    });
    return response.data.data!;
  },

  async process(id: string, status: string, adminNotes?: string): Promise<BookRequest> {
    const response = await api.post<ApiResponse<{ request: BookRequest }>>(`/book-requests/${id}/process`, {
      status,
      adminNotes,
    });
    return response.data.data!.request;
  },
};
