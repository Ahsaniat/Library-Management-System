import api from './api';
import { ApiResponse, PaginationMeta, Review } from '../types';

export interface PaginatedReviews {
  reviews: Review[];
  pagination: PaginationMeta;
}

export interface CreateReviewData {
  rating: number;
  title?: string;
  content?: string;
}

export const reviewService = {
  async list(bookId: string, page = 1): Promise<PaginatedReviews> {
    const response = await api.get<ApiResponse<PaginatedReviews>>(
      `/books/${bookId}/reviews`,
      { params: { page } }
    );
    return response.data.data!;
  },

  async create(bookId: string, data: CreateReviewData): Promise<Review> {
    const response = await api.post<ApiResponse<{ review: Review }>>(
      `/books/${bookId}/reviews`,
      data
    );
    return response.data.data!.review;
  },

  async remove(reviewId: string): Promise<void> {
    await api.delete(`/reviews/${reviewId}`);
  },
};
