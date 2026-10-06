import { useState } from 'react';
import { Button, Input, LoadingSpinner, Alert } from '../../components';
import { useSettings, useUpdateSetting } from '../../hooks/useSettings';
import { Setting } from '../../types';
import { getApiErrorMessage } from '../../utils';

const SETTING_LABELS: Record<string, string> = {
  'loan.periodDays': 'Loan period (days)',
  'loan.maxActive': 'Maximum active loans per member',
  'loan.maxRenewals': 'Maximum renewals per loan',
  'fine.perDay': 'Fine per overdue day',
  'fine.currency': 'Currency',
  'reservation.holdDays': 'Reservation hold (days)',
};

/** Human-readable label with the raw key kept as secondary context. */
function formatSettingLabel(key: string): string {
  if (SETTING_LABELS[key]) return SETTING_LABELS[key];
  const last = key.split('.').pop() ?? key;
  return last
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (character) => character.toUpperCase());
}

export default function Settings() {
  const { data: settings, isLoading, error } = useSettings();
  const updateSetting = useUpdateSetting();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (setting: Setting) => {
    const value = draft[setting.key] ?? setting.value;
    if (value === undefined) return;

    setSaveError(null);

    try {
      await updateSetting.mutateAsync({ key: setting.key, value });
      setSavedKey(setting.key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch (err) {
      setSaveError(getApiErrorMessage(err, `Failed to update ${setting.key}`));
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  if (error || !settings) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p style={{ color: 'var(--ink-primary)' }}>Failed to load settings.</p>
      </div>
    );
  }

  if (settings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--ink-primary)' }}>
          System Settings
        </h1>
        <p style={{ color: 'var(--ink-secondary)' }}>
          No settings found. Run <code>npm run db:seed</code> to install the policy defaults.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>
          System Settings
        </h1>
        <p className="mt-2" style={{ color: 'var(--ink-secondary)' }}>
          Loan periods, fine rates and reservation holds used across the system.
        </p>
      </div>

      {saveError && <Alert variant="error" message={saveError} />}

      <div className="rounded-lg shadow-md divide-y" style={{ backgroundColor: 'var(--parchment-light)' }}>
        {settings.map((setting) => (
          <div key={setting.id} className="p-5 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <p className="font-medium" style={{ color: 'var(--ink-primary)' }}>
                {formatSettingLabel(setting.key)}
              </p>
              {setting.description && setting.description !== formatSettingLabel(setting.key) && (
                <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                  {setting.description}
                </p>
              )}
              <p className="text-xs font-mono mt-1 opacity-60" style={{ color: 'var(--ink-secondary)' }}>
                {setting.key}
              </p>
            </div>
            <div className="flex items-center gap-2 md:w-80">
              <Input
                key={`${setting.key}:${setting.value}`}
                type={setting.type === 'number' ? 'number' : 'text'}
                step={setting.type === 'number' ? 'any' : undefined}
                defaultValue={setting.value}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, [setting.key]: event.target.value }))
                }
                aria-label={formatSettingLabel(setting.key)}
              />
              <Button
                size="sm"
                onClick={() => handleSave(setting)}
                isLoading={
                  updateSetting.isPending && updateSetting.variables?.key === setting.key
                }
                aria-label={`Save ${setting.key}`}
              >
                {savedKey === setting.key ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
