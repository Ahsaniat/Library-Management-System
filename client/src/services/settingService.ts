import api from './api';
import { ApiResponse, Setting } from '../types';

export const settingService = {
  async getSettings(): Promise<Setting[]> {
    const response = await api.get<ApiResponse<{ settings: Setting[] }>>('/settings');
    return response.data.data!.settings;
  },

  async getPublicSettings(): Promise<Setting[]> {
    const response = await api.get<ApiResponse<{ settings: Setting[] }>>('/settings/public');
    return response.data.data!.settings;
  },

  async updateSetting(key: string, value: string): Promise<Setting> {
    const response = await api.put<ApiResponse<{ setting: Setting }>>(
      `/settings/${encodeURIComponent(key)}`,
      { value }
    );
    return response.data.data!.setting;
  },
};
