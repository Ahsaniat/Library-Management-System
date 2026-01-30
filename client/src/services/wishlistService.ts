import api from './api';
import { ApiResponse, Book } from '../types';

export interface WishlistItem {
  id: string;
  userId: string;
  bookId: string;
  notes?: string;
  priority: number;
  book?: Book;
  createdAt: string;
}

export const wishlistService = {
  async add(bookId: string, notes?: string, priority?: number): Promise<WishlistItem> {
    const response = await api.post<ApiResponse<{ item: WishlistItem }>>('/wishlist', {
      bookId,
      notes,
      priority,
    });
    return response.data.data!.item;
  },

  async remove(bookId: string): Promise<void> {
    await api.delete(`/wishlist/${bookId}`);
  },

  async getMyWishlist(): Promise<WishlistItem[]> {
    const response = await api.get<ApiResponse<{ items: WishlistItem[] }>>('/wishlist/my');
    return response.data.data!.items;
  },

  async isInWishlist(bookId: string): Promise<boolean> {
    const response = await api.get<ApiResponse<{ inWishlist: boolean }>>(`/wishlist/check/${bookId}`);
    return response.data.data!.inWishlist;
  },

  async updatePriority(bookId: string, priority: number): Promise<WishlistItem> {
    const response = await api.patch<ApiResponse<{ item: WishlistItem }>>(`/wishlist/${bookId}/priority`, {
      priority,
    });
    return response.data.data!.item;
  },

  async updateNotes(bookId: string, notes: string): Promise<WishlistItem> {
    const response = await api.patch<ApiResponse<{ item: WishlistItem }>>(`/wishlist/${bookId}/notes`, {
      notes,
    });
    return response.data.data!.item;
  },
};
