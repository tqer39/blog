'use client';

import type { AIProvider, ApiKeyStatus, SiteSettings } from '@blog/cms-types';
import { Alert, AlertDescription, Button } from '@blog/ui';
import { Loader2, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '@/i18n';
import {
  disableApiKey,
  enableApiKey,
  generateApiKey,
  getApiKeyStatus,
  getSiteSettings,
  testAIKey,
  updateSiteSettings,
} from '@/lib/api/client';
import {
  AIToolsSettings,
  AnalyticsSettings,
  AppearanceSettings,
  BasicSettings,
  CMSApiKeySettings,
  DisplaySettings,
  SocialLinksSettings,
} from './components';
import { buildSocialUrl, type SOCIAL_PREFIXES } from './constants';

export default function SettingsPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<SiteSettings | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  // API Key Management state
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  // AI API Key Test state
  const [testingProvider, setTestingProvider] = useState<AIProvider | null>(
    null
  );
  const [testResults, setTestResults] = useState<
    Record<AIProvider, { success: boolean; message?: string } | null>
  >({
    openai: null,
    anthropic: null,
    gemini: null,
  });

  // Check if a specific field has been modified
  const isFieldModified = useCallback(
    (key: keyof SiteSettings): boolean => {
      if (!settings || !originalSettings) return false;
      return settings[key] !== originalSettings[key];
    },
    [settings, originalSettings]
  );

  // Check if any field has been modified
  const hasUnsavedChanges = useCallback((): boolean => {
    if (!settings || !originalSettings) return false;
    return Object.keys(settings).some(
      (key) =>
        settings[key as keyof SiteSettings] !==
        originalSettings[key as keyof SiteSettings]
    );
  }, [settings, originalSettings]);

  // Modified indicator component
  const ModifiedIndicator = ({ field }: { field: keyof SiteSettings }) =>
    isFieldModified(field) ? (
      <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-blue-500" />
    ) : null;

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsResponse, apiKeyStatusResponse] = await Promise.all([
        getSiteSettings(),
        getApiKeyStatus().catch(() => null),
      ]);
      setSettings(settingsResponse.settings);
      setOriginalSettings(settingsResponse.settings);
      setApiKeyStatus(apiKeyStatusResponse);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  async function handleGenerateApiKey() {
    const hasExistingKey = apiKeyStatus?.hasKey;
    if (hasExistingKey) {
      const confirmed = window.confirm(t('settings.apiKey.confirmRegenerate'));
      if (!confirmed) return;
    }

    try {
      setApiKeyLoading(true);
      const result = await generateApiKey();
      setGeneratedKey(result.key);
      setApiKeyStatus({
        hasKey: true,
        enabled: true,
        createdAt: result.createdAt,
      });
      setKeyCopied(false);
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : t('settings.apiKey.generateError'),
      });
    } finally {
      setApiKeyLoading(false);
    }
  }

  async function handleToggleApiKey() {
    if (!apiKeyStatus) return;

    try {
      setApiKeyLoading(true);
      if (apiKeyStatus.enabled) {
        await disableApiKey();
        setApiKeyStatus({ ...apiKeyStatus, enabled: false });
      } else {
        await enableApiKey();
        setApiKeyStatus({ ...apiKeyStatus, enabled: true });
      }
    } catch (err) {
      const errorKey = apiKeyStatus.enabled
        ? 'settings.apiKey.disableError'
        : 'settings.apiKey.enableError';
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : t(errorKey),
      });
    } finally {
      setApiKeyLoading(false);
    }
  }

  function handleCopyApiKey() {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  }

  async function handleSave() {
    if (!settings) return;

    try {
      setSaving(true);
      setMessage(null);
      const response = await updateSiteSettings(settings);
      // Update both settings and originalSettings to reflect saved state
      setSettings(response.settings);
      setOriginalSettings(response.settings);
      setMessage({ type: 'success', text: t('settings.saveSuccess') });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : t('settings.saveError'),
      });
    } finally {
      setSaving(false);
    }
  }

  function handleChange(key: keyof SiteSettings, value: string) {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setMessage(null);
  }

  function handleToggle(key: keyof SiteSettings) {
    if (!settings) return;
    const currentValue = settings[key] === 'true';
    setSettings({ ...settings, [key]: currentValue ? 'false' : 'true' });
    setMessage(null);
  }

  function handleSocialIdChange(
    service: keyof typeof SOCIAL_PREFIXES,
    settingKey: keyof SiteSettings,
    id: string
  ) {
    if (!settings) return;
    const url = buildSocialUrl(id, service);
    setSettings({ ...settings, [settingKey]: url });
    setMessage(null);
  }

  function toggleApiKeyVisibility(key: string) {
    setShowApiKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleApiKeyChange(key: keyof SiteSettings, value: string) {
    if (!settings) return;
    // Only update if value is not the masked value (doesn't end with ****)
    if (!value.endsWith('****')) {
      setSettings({ ...settings, [key]: value });
      setMessage(null);
    }
  }

  function handleClearApiKey(key: keyof SiteSettings, provider: AIProvider) {
    if (!settings) return;
    const confirmed = window.confirm(t('settings.aiTools.clearConfirm'));
    if (!confirmed) return;
    setSettings({ ...settings, [key]: '' });
    setTestResults((prev) => ({ ...prev, [provider]: null }));
    setMessage(null);
  }

  async function handleTestAIKey(provider: AIProvider, apiKey: string) {
    const confirmed = window.confirm(t('settings.aiTools.testConfirm'));
    if (!confirmed) return;

    // Don't send masked values - use empty string to fall back to saved key
    const keyToTest = apiKey.endsWith('****') ? undefined : apiKey;

    try {
      setTestingProvider(provider);
      setTestResults((prev) => ({ ...prev, [provider]: null }));
      const result = await testAIKey(provider, keyToTest);
      setTestResults((prev) => ({
        ...prev,
        [provider]: { success: result.success, message: result.message },
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t('settings.aiTools.testError');
      setTestResults((prev) => ({
        ...prev,
        [provider]: { success: false, message: errorMessage },
      }));
    } finally {
      setTestingProvider(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const unsavedChanges = hasUnsavedChanges();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <Button
          onClick={handleSave}
          disabled={saving || !unsavedChanges}
          className={unsavedChanges ? 'animate-pulse' : ''}
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {t('settings.saveSettings')}
        </Button>
      </div>

      {unsavedChanges && (
        <Alert className="mb-6 !border-amber-500 !bg-amber-50 dark:!border-amber-600 dark:!bg-amber-950/30">
          <AlertDescription className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            {t('settings.unsavedChanges')}
          </AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert
          variant={message.type === 'error' ? 'destructive' : 'default'}
          className={`mb-6 ${message.type === 'success' ? '!border-green-500 !bg-green-50 !text-green-800 dark:!border-green-600 dark:!bg-green-950/30 dark:!text-green-400' : ''}`}
        >
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        <BasicSettings
          settings={settings}
          onFieldChange={handleChange}
          ModifiedIndicator={ModifiedIndicator}
        />

        <SocialLinksSettings
          settings={settings}
          onToggle={handleToggle}
          onSocialIdChange={handleSocialIdChange}
          isFieldModified={isFieldModified}
        />

        <DisplaySettings
          settings={settings}
          onToggle={handleToggle}
          ModifiedIndicator={ModifiedIndicator}
        />

        <AppearanceSettings
          settings={settings}
          onFieldChange={handleChange}
          ModifiedIndicator={ModifiedIndicator}
        />

        <AnalyticsSettings
          settings={settings}
          onFieldChange={handleChange}
          ModifiedIndicator={ModifiedIndicator}
        />

        <AIToolsSettings
          settings={settings}
          showApiKeys={showApiKeys}
          testingProvider={testingProvider}
          testResults={testResults}
          onApiKeyChange={handleApiKeyChange}
          onToggleVisibility={toggleApiKeyVisibility}
          onTestKey={handleTestAIKey}
          onClearKey={handleClearApiKey}
          ModifiedIndicator={ModifiedIndicator}
        />

        <CMSApiKeySettings
          apiKeyStatus={apiKeyStatus}
          apiKeyLoading={apiKeyLoading}
          generatedKey={generatedKey}
          keyCopied={keyCopied}
          onGenerateKey={handleGenerateApiKey}
          onToggleKey={handleToggleApiKey}
          onCopyKey={handleCopyApiKey}
        />
      </div>

      {/* Bottom save button */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !unsavedChanges}
          className={unsavedChanges ? 'animate-pulse' : ''}
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {t('settings.saveSettings')}
        </Button>
      </div>
    </div>
  );
}
