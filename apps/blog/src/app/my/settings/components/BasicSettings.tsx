import type { SiteSettings } from '@blog/cms-types';
import type { ReactNode } from 'react';
import { useI18n } from '@/i18n';

interface BasicSettingsProps {
  settings: SiteSettings | null;
  onFieldChange: (key: keyof SiteSettings, value: string) => void;
  ModifiedIndicator: ({ field }: { field: keyof SiteSettings }) => ReactNode;
}

export function BasicSettings({
  settings,
  onFieldChange,
  ModifiedIndicator,
}: BasicSettingsProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">
        {t('settings.basic.title')}
      </h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="site_name"
            className="mb-2 flex items-center text-sm font-medium"
          >
            {t('settings.basic.siteName')}
            <ModifiedIndicator field="site_name" />
          </label>
          <input
            id="site_name"
            type="text"
            value={settings?.site_name || ''}
            onChange={(e) => onFieldChange('site_name', e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder={t('settings.basic.siteNamePlaceholder')}
          />
        </div>
        <div>
          <label
            htmlFor="site_description"
            className="mb-2 flex items-center text-sm font-medium"
          >
            {t('settings.basic.siteDescription')}
            <ModifiedIndicator field="site_description" />
          </label>
          <textarea
            id="site_description"
            value={settings?.site_description || ''}
            onChange={(e) => onFieldChange('site_description', e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder={t('settings.basic.siteDescriptionPlaceholder')}
          />
        </div>
        <div>
          <label
            htmlFor="author_name"
            className="mb-2 flex items-center text-sm font-medium"
          >
            {t('settings.basic.authorName')}
            <ModifiedIndicator field="author_name" />
          </label>
          <input
            id="author_name"
            type="text"
            value={settings?.author_name || ''}
            onChange={(e) => onFieldChange('author_name', e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder={t('settings.basic.authorNamePlaceholder')}
          />
        </div>
        <div>
          <label
            htmlFor="footer_text"
            className="mb-2 flex items-center text-sm font-medium"
          >
            {t('settings.basic.footerText')}
            <ModifiedIndicator field="footer_text" />
          </label>
          <input
            id="footer_text"
            type="text"
            value={settings?.footer_text || ''}
            onChange={(e) => onFieldChange('footer_text', e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder={t('settings.basic.footerTextPlaceholder')}
          />
        </div>
      </div>
    </div>
  );
}
