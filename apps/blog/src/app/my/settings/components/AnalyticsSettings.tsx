import type { SiteSettings } from '@blog/cms-types';
import { type ReactNode, useState } from 'react';
import { useI18n } from '@/i18n';

// GA4 Measurement ID format: G-XXXXXXXXXX
const GA_ID_PATTERN = /^G-[A-Z0-9]{10}$/;

interface AnalyticsSettingsProps {
  settings: SiteSettings | null;
  onFieldChange: (key: keyof SiteSettings, value: string) => void;
  ModifiedIndicator: ({ field }: { field: keyof SiteSettings }) => ReactNode;
}

export function AnalyticsSettings({
  settings,
  onFieldChange,
  ModifiedIndicator,
}: AnalyticsSettingsProps) {
  const { t } = useI18n();
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (value: string) => {
    const trimmedValue = value.trim().toUpperCase();

    // Allow empty value (to disable GA)
    if (trimmedValue === '') {
      setValidationError(null);
      onFieldChange('ga_measurement_id', '');
      return;
    }

    // Validate format
    if (!GA_ID_PATTERN.test(trimmedValue)) {
      setValidationError(t('settings.analytics.invalidFormat'));
    } else {
      setValidationError(null);
    }

    onFieldChange('ga_measurement_id', trimmedValue);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">
        {t('settings.analytics.title')}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {t('settings.analytics.description')}
      </p>
      <div>
        <label
          htmlFor="ga_measurement_id"
          className="mb-2 flex items-center text-sm font-medium"
        >
          {t('settings.analytics.measurementId')}
          <ModifiedIndicator field="ga_measurement_id" />
        </label>
        <input
          id="ga_measurement_id"
          type="text"
          value={settings?.ga_measurement_id || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="G-XXXXXXXXXX"
          className={`w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-1 ${
            validationError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-border focus:border-primary focus:ring-primary'
          }`}
        />
        {validationError && (
          <p className="mt-1 text-sm text-red-500">{validationError}</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          {t('settings.analytics.measurementIdHelp')}
        </p>
      </div>
    </div>
  );
}
