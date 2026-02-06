import type { SiteSettings } from '@blog/cms-types';
import type { ReactNode } from 'react';
import { useI18n } from '@/i18n';

interface AppearanceSettingsProps {
  settings: SiteSettings | null;
  onFieldChange: (key: keyof SiteSettings, value: string) => void;
  ModifiedIndicator: ({ field }: { field: keyof SiteSettings }) => ReactNode;
}

export function AppearanceSettings({
  settings,
  onFieldChange,
  ModifiedIndicator,
}: AppearanceSettingsProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">
        {t('settings.appearance.title')}
      </h2>
      <div>
        <label
          htmlFor="default_theme"
          className="mb-2 flex items-center text-sm font-medium"
        >
          {t('settings.appearance.defaultTheme')}
          <ModifiedIndicator field="default_theme" />
        </label>
        <p className="mb-2 text-sm text-muted-foreground">
          {t('settings.appearance.defaultThemeDescription')}
        </p>
        <select
          id="default_theme"
          value={settings?.default_theme || 'system'}
          onChange={(e) => onFieldChange('default_theme', e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="system">
            {t('settings.appearance.themes.system')}
          </option>
          <option value="light">{t('settings.appearance.themes.light')}</option>
          <option value="dark">{t('settings.appearance.themes.dark')}</option>
          <option value="tokyonight">
            {t('settings.appearance.themes.tokyonight')}
          </option>
          <option value="nord-light">
            {t('settings.appearance.themes.nordLight')}
          </option>
          <option value="autumn">
            {t('settings.appearance.themes.autumn')}
          </option>
        </select>
      </div>
      <div className="mt-4">
        <label
          htmlFor="default_locale"
          className="mb-2 flex items-center text-sm font-medium"
        >
          {t('settings.appearance.defaultLocale')}
          <ModifiedIndicator field="default_locale" />
        </label>
        <p className="mb-2 text-sm text-muted-foreground">
          {t('settings.appearance.defaultLocaleDescription')}
        </p>
        <select
          id="default_locale"
          value={settings?.default_locale || 'auto'}
          onChange={(e) => onFieldChange('default_locale', e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="auto">{t('settings.appearance.locales.auto')}</option>
          <option value="ja">{t('settings.appearance.locales.ja')}</option>
          <option value="en">{t('settings.appearance.locales.en')}</option>
        </select>
      </div>
    </div>
  );
}
