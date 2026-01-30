import api from './api';
import { ApiResponse } from '../types';

export interface BookRequest {
  id: string;
  userId: string;
  title: string;
  author?: string;
  isbn?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'acquired';
  adminNotes?: string;
  processedAt?: string;
  createdAt: string;
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

  async getMyRequests(): Promise<BookRequest[]> {
    const response = await api.get<ApiResponse<{ requests: BookRequest[] }>>('/book-requests/my');
    return response.data.data!.requests;
  },

  async cancel(id: string): Promise<BookRequest> {
    const response = await api.post<ApiResponse<{ request: BookRequest }>>(`/book-requests/${id}/cancel`);
    return response.data.data!.request;
  },

  async getAllRequests(status?: string): Promise<BookRequest[]> {
    const response = await api.get<ApiResponse<{ requests: BookRequest[] }>>('/book-requests', {
      params: status ? { status } : {},
    });
    return response.data.data!.requests;
  },

  async process(id: string, status: string, adminNotes?: string): Promise<BookRequest> {
    const response = await api.post<ApiResponse<{ request: BookRequest }>>(`/book-requests/${id}/process`, {
      status,
      adminNotes,
    });
    return response.data.data!.request;
  },
};
