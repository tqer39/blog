import type { ApiKeyStatus } from '@blog/cms-types';
import { Alert, AlertDescription, Button } from '@blog/ui';
import { Check, Copy, Key, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n';

interface CMSApiKeySettingsProps {
  apiKeyStatus: ApiKeyStatus | null;
  apiKeyLoading: boolean;
  generatedKey: string | null;
  keyCopied: boolean;
  onGenerateKey: () => void;
  onToggleKey: () => void;
  onCopyKey: () => void;
}

export function CMSApiKeySettings({
  apiKeyStatus,
  apiKeyLoading,
  generatedKey,
  keyCopied,
  onGenerateKey,
  onToggleKey,
  onCopyKey,
}: CMSApiKeySettingsProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <Key className="h-5 w-5" />
        <h2 className="text-xl font-semibold">{t('settings.apiKey.title')}</h2>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        {t('settings.apiKey.description')}
      </p>

      {/* Generated Key Display */}
      {generatedKey && (
        <Alert className="mb-6">
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-medium text-amber-600 dark:text-amber-400">
                {t('settings.apiKey.warning')}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all rounded bg-muted p-3 font-mono text-sm">
                  {generatedKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopyKey}
                  className="shrink-0"
                >
                  {keyCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="ml-2">
                    {keyCopied
                      ? t('settings.apiKey.copied')
                      : t('settings.apiKey.copyKey')}
                  </span>
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Display */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-2 w-2 rounded-full ${
              apiKeyStatus?.hasKey
                ? apiKeyStatus.enabled
                  ? 'bg-green-500'
                  : 'bg-yellow-500'
                : 'bg-gray-400'
            }`}
          />
          <span className="text-sm">
            {apiKeyStatus?.hasKey
              ? t('settings.apiKey.hasKey')
              : t('settings.apiKey.noKey')}
          </span>
          {apiKeyStatus?.hasKey && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                apiKeyStatus.enabled
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              }`}
            >
              {apiKeyStatus.enabled
                ? t('settings.apiKey.enabled')
                : t('settings.apiKey.disabled')}
            </span>
          )}
        </div>
        {apiKeyStatus?.createdAt && (
          <p className="text-xs text-muted-foreground">
            {t('settings.apiKey.createdAt')}{' '}
            {new Date(apiKeyStatus.createdAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onGenerateKey}
          disabled={apiKeyLoading}
          variant={apiKeyStatus?.hasKey ? 'outline' : 'default'}
        >
          {apiKeyLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Key className="mr-2 h-4 w-4" />
          )}
          {apiKeyStatus?.hasKey
            ? t('settings.apiKey.regenerate')
            : t('settings.apiKey.generate')}
        </Button>
        {apiKeyStatus?.hasKey && (
          <Button
            onClick={onToggleKey}
            disabled={apiKeyLoading}
            variant="outline"
          >
            {apiKeyLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {apiKeyStatus.enabled
              ? t('settings.apiKey.disable')
              : t('settings.apiKey.enable')}
          </Button>
        )}
      </div>
    </div>
  );
}
