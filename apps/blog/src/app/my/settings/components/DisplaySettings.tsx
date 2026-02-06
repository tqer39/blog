import type { SiteSettings } from '@blog/cms-types';
import type { ReactNode } from 'react';
import { useI18n } from '@/i18n';

interface DisplaySettingsProps {
  settings: SiteSettings | null;
  onToggle: (key: keyof SiteSettings) => void;
  ModifiedIndicator: ({ field }: { field: keyof SiteSettings }) => ReactNode;
}

export function DisplaySettings({
  settings,
  onToggle,
  ModifiedIndicator,
}: DisplaySettingsProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">
        {t('settings.display.title')}
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label
              htmlFor="show_rss_link"
              className="flex items-center text-sm font-medium"
            >
              {t('settings.display.showRssLink')}
              <ModifiedIndicator field="show_rss_link" />
            </label>
            <p className="text-sm text-muted-foreground">
              {t('settings.display.showRssLinkDescription')}
            </p>
          </div>
          <button
            id="show_rss_link"
            type="button"
            role="switch"
            aria-checked={settings?.show_rss_link === 'true'}
            onClick={() => onToggle('show_rss_link')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
              settings?.show_rss_link === 'true'
                ? 'bg-primary'
                : 'bg-zinc-300 dark:bg-zinc-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-background shadow-sm transition-transform ${
                settings?.show_rss_link === 'true'
                  ? 'translate-x-6'
                  : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
