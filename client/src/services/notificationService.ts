import api from './api';
import { ApiResponse } from '../types';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export const notificationService = {
  async getNotifications(unreadOnly = false): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const response = await api.get<ApiResponse<{ notifications: Notification[]; unreadCount: number }>>(
      '/notifications',
      { params: { unreadOnly } }
    );
    return response.data.data!;
  },

  async markAsRead(id: string): Promise<void> {
    await api.post(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/mark-all-read');
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
