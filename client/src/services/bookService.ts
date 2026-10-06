import api from './api';
import { ApiResponse, Book, Category, PaginatedResponse } from '../types';

export interface BookSearchParams {
  q?: string;
  page?: number;
  limit?: number;
  category?: string;
  author?: string;
  publisher?: string;
  year?: number;
  language?: string;
  available?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const bookService = {
  async search(params: BookSearchParams = {}): Promise<PaginatedResponse<Book>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Book>>>('/books', { params });
    return response.data.data!;
  },

  async getById(id: string): Promise<Book> {
    const response = await api.get<ApiResponse<{ book: Book }>>(`/books/${id}`);
    return response.data.data!.book;
  },

  async getPopular(limit = 10): Promise<Book[]> {
    const response = await api.get<ApiResponse<{ books: Book[] }>>('/books/popular', {
      params: { limit },
    });
    return response.data.data!.books;
  },

  async getRecent(limit = 10): Promise<Book[]> {
    const response = await api.get<ApiResponse<{ books: Book[] }>>('/books/recent', {
      params: { limit },
    });
    return response.data.data!.books;
  },

  async getCategories(): Promise<Category[]> {
    const response = await api.get<ApiResponse<{ categories: Category[] }>>('/books/categories');
    return response.data.data!.categories;
  },

  async create(data: Partial<Book>): Promise<Book> {
    const response = await api.post<ApiResponse<{ book: Book }>>('/books', data);
    return response.data.data!.book;
  },

  async update(id: string, data: Partial<Book>): Promise<Book> {
    const response = await api.patch<ApiResponse<{ book: Book }>>(`/books/${id}`, data);
    return response.data.data!.book;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/books/${id}`);
  },
};
