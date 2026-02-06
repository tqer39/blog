import type { AIProvider, SiteSettings } from '@blog/cms-types';
import { Button } from '@blog/ui';
import {
  CircleCheck,
  CircleX,
  Eye,
  EyeOff,
  Loader2,
  Play,
  Trash2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useI18n } from '@/i18n';
import { API_KEY_FIELDS } from '../constants';

interface AIToolsSettingsProps {
  settings: SiteSettings | null;
  showApiKeys: Record<string, boolean>;
  testingProvider: AIProvider | null;
  testResults: Record<
    AIProvider,
    { success: boolean; message?: string } | null
  >;
  onApiKeyChange: (key: keyof SiteSettings, value: string) => void;
  onToggleVisibility: (key: string) => void;
  onTestKey: (provider: AIProvider, apiKey: string) => void;
  onClearKey: (key: keyof SiteSettings, provider: AIProvider) => void;
  ModifiedIndicator: ({ field }: { field: keyof SiteSettings }) => ReactNode;
}

export function AIToolsSettings({
  settings,
  showApiKeys,
  testingProvider,
  testResults,
  onApiKeyChange,
  onToggleVisibility,
  onTestKey,
  onClearKey,
  ModifiedIndicator,
}: AIToolsSettingsProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold">
        {t('settings.aiTools.title')}
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        {t('settings.aiTools.description')}
      </p>
      <div className="space-y-4">
        {API_KEY_FIELDS.map(
          ({ key, provider, labelKey, descriptionKey, placeholder }) => {
            const value = settings?.[key] || '';
            const isVisible = showApiKeys[key] || false;
            const isMasked = (value as string).endsWith('****');
            const hasKey = Boolean(value);
            const isTesting = testingProvider === provider;
            const testResult = testResults[provider];

            return (
              <div key={key}>
                <label
                  htmlFor={key}
                  className="mb-1 flex items-center text-sm font-medium"
                >
                  {t(labelKey)}
                  <ModifiedIndicator field={key} />
                </label>
                <p className="mb-2 text-xs text-muted-foreground">
                  {t(descriptionKey)}
                </p>
                <div className="flex gap-2">
                  <div className="flex flex-1">
                    <input
                      id={key}
                      type={isVisible ? 'text' : 'password'}
                      value={value as string}
                      onChange={(e) => onApiKeyChange(key, e.target.value)}
                      className="flex-1 rounded-l-lg border border-border bg-background px-4 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder={placeholder}
                    />
                    <button
                      type="button"
                      onClick={() => onToggleVisibility(key)}
                      className="inline-flex items-center rounded-r-lg border border-l-0 border-border bg-muted px-3 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                      aria-label={
                        isVisible
                          ? t('settings.aiTools.hideApiKey')
                          : t('settings.aiTools.showApiKey')
                      }
                    >
                      {isVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onTestKey(provider, value as string)}
                    disabled={!hasKey || isTesting}
                    className="shrink-0"
                  >
                    {isTesting ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-1 h-4 w-4" />
                    )}
                    {t('settings.aiTools.testButton')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onClearKey(key, provider)}
                    disabled={!hasKey}
                    className="shrink-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    aria-label={t('settings.aiTools.clearButton')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {isMasked && !testResult && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('settings.aiTools.apiKeySet')}
                  </p>
                )}
                {testResult && (
                  <div
                    className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      testResult.success
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {testResult.success ? (
                      <CircleCheck className="h-4 w-4 shrink-0" />
                    ) : (
                      <CircleX className="h-4 w-4 shrink-0" />
                    )}
                    <span>
                      {testResult.success
                        ? t('settings.aiTools.testSuccess')
                        : testResult.message || t('settings.aiTools.testError')}
                    </span>
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
