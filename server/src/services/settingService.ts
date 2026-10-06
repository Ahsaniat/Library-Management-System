import { Setting } from '../models';
import logger from '../utils/logger';

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const CACHE_TTL_MS = 60 * 1000;

export class SettingService {
  private cache = new Map<string, CacheEntry>();

  async getString(key: string, fallback: string): Promise<string> {
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const setting = await Setting.findOne({ where: { key } });
    const value = setting?.value ?? fallback;

    this.cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  }

  async getNumber(key: string, fallback: number): Promise<number> {
    const raw = await this.getString(key, String(fallback));
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  async getBoolean(key: string, fallback: boolean): Promise<boolean> {
    const raw = await this.getString(key, String(fallback));
    return raw.toLowerCase() === 'true';
  }

  async list(publicOnly = false): Promise<Setting[]> {
    const where = publicOnly ? { isPublic: true } : {};
    return Setting.findAll({ where, order: [['key', 'ASC']] });
  }

  async upsert(key: string, value: string): Promise<Setting> {
    const [setting, created] = await Setting.findOrCreate({
      where: { key },
      defaults: { key, value, type: 'string' },
    });

    if (!created && setting.value !== value) {
      await setting.update({ value });
    }

    this.cache.delete(key);
    logger.info({ action: 'setting_updated', key, created });
    return setting;
  }

  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const settingService = new SettingService();
