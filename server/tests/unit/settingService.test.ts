import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingService } from '../../src/services/settingService';
import { Setting } from '../../src/models';

vi.mock('../../src/models', () => ({
  Setting: {
    findOne: vi.fn(),
    findAll: vi.fn(),
    findOrCreate: vi.fn(),
  },
}));

const mocked = Setting as unknown as {
  findOne: ReturnType<typeof vi.fn>;
  findAll: ReturnType<typeof vi.fn>;
  findOrCreate: ReturnType<typeof vi.fn>;
};

describe('SettingService', () => {
  let service: SettingService;

  beforeEach(() => {
    service = new SettingService();
    mocked.findOne.mockReset();
    mocked.findAll.mockReset();
    mocked.findOrCreate.mockReset();
  });

  it('reads a value from the database and caches it', async () => {
    mocked.findOne.mockResolvedValue({ key: 'loan.periodDays', value: '21' });

    await expect(service.getString('loan.periodDays', '14')).resolves.toBe('21');
    await expect(service.getString('loan.periodDays', '14')).resolves.toBe('21');

    expect(mocked.findOne).toHaveBeenCalledTimes(1);
  });

  it('falls back when the setting is missing', async () => {
    mocked.findOne.mockResolvedValue(null);
    await expect(service.getString('missing.key', 'fallback')).resolves.toBe('fallback');
  });

  it('parses numbers and falls back on invalid values', async () => {
    mocked.findOne.mockResolvedValueOnce({ key: 'fine.perDay', value: '0.75' });
    await expect(service.getNumber('fine.perDay', 0.5)).resolves.toBe(0.75);

    service.invalidate();
    mocked.findOne.mockResolvedValueOnce({ key: 'fine.perDay', value: 'not-a-number' });
    await expect(service.getNumber('fine.perDay', 0.5)).resolves.toBe(0.5);
  });

  it('parses booleans', async () => {
    mocked.findOne.mockResolvedValue({ key: 'feature.flag', value: 'TRUE' });
    await expect(service.getBoolean('feature.flag', false)).resolves.toBe(true);
  });

  it('invalidates the cache when a setting is updated', async () => {
    const setting = { key: 'loan.periodDays', value: '14', update: vi.fn() };
    mocked.findOrCreate.mockResolvedValue([setting, false]);
    mocked.findOne.mockResolvedValue({ key: 'loan.periodDays', value: '14' });

    await service.getString('loan.periodDays', '14');
    await service.upsert('loan.periodDays', '30');
    await service.getString('loan.periodDays', '14');

    expect(mocked.findOne).toHaveBeenCalledTimes(2);
  });

  it('lists public settings only when requested', async () => {
    mocked.findAll.mockResolvedValue([]);

    await service.list(true);
    expect(mocked.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isPublic: true } })
    );

    await service.list(false);
    expect(mocked.findAll).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: {} })
    );
  });
});
