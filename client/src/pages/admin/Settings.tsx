import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button, Input, LoadingSpinner } from '../../components';
import { useSettings, useUpdateSetting } from '../../hooks/useSettings';
import { Setting } from '../../types';

export default function Settings() {
  const { data: settings, isLoading, error } = useSettings();
  const updateSetting = useUpdateSetting();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const handleSave = async (setting: Setting) => {
    const value = draft[setting.key] ?? setting.value;
    if (value === undefined) return;

    await updateSetting.mutateAsync({ key: setting.key, value });
    setSavedKey(setting.key);
    setTimeout(() => setSavedKey(null), 2000);
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

      <div className="rounded-lg shadow-md divide-y" style={{ backgroundColor: 'var(--parchment-light)' }}>
        {settings.map((setting) => (
          <div key={setting.id} className="p-5 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <p className="font-medium" style={{ color: 'var(--ink-primary)' }}>
                {setting.key}
              </p>
              {setting.description && (
                <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
                  {setting.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 md:w-80">
              <Input
                key={`${setting.key}:${setting.value}`}
                defaultValue={setting.value}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, [setting.key]: event.target.value }))
                }
                aria-label={setting.key}
              />
              <Button
                size="sm"
                onClick={() => handleSave(setting)}
                isLoading={updateSetting.isPending}
                aria-label={`Save ${setting.key}`}
              >
                {savedKey === setting.key ? 'Saved' : <Save className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
