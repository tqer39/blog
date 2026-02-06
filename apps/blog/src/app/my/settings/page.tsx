'use client';

import type { AIProvider, ApiKeyStatus, SiteSettings } from '@blog/cms-types';
import {
  Alert,
  AlertDescription,
  BlueSkyIcon,
  Button,
  DevToIcon,
  HackerNewsIcon,
  HatenaIcon,
  LaprasIcon,
  MediumIcon,
  NoteIcon,
  QiitaIcon,
  RedditIcon,
  TechFeedIcon,
  ThreadsIcon,
  WantedlyIcon,
  XIcon,
  ZennIcon,
} from '@blog/ui';
import {
  ArrowUpRight,
  Check,
  CircleCheck,
  CircleX,
  Copy,
  Eye,
  EyeOff,
  Github,
  Key,
  LayoutGrid,
  Linkedin,
  Loader2,
  Play,
  Save,
  Trash2,
} from 'lucide-react';
import type { ClipboardEvent } from 'react';
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

// Social link prefixes for each service
const SOCIAL_PREFIXES = {
  github: 'https://github.com/',
  twitter: 'https://x.com/',
  bento: 'https://bento.me/',
  bluesky: 'https://bsky.app/profile/',
  threads: 'https://www.threads.net/@',
  linkedin: 'https://www.linkedin.com/in/',
  wantedly: 'https://www.wantedly.com/id/',
  lapras: 'https://lapras.com/public/',
  devto: 'https://dev.to/',
  hackernews: 'https://news.ycombinator.com/user?id=',
  hatena: 'https://', // Special: {id}.hatenablog.com format
  medium: 'https://medium.com/@',
  note: 'https://note.com/',
  qiita: 'https://qiita.com/',
  reddit: 'https://www.reddit.com/user/',
  techfeed: 'https://techfeed.io/people/@',
  zenn: 'https://zenn.dev/',
} as const;

// Extract ID from full URL
function extractSocialId(
  url: string,
  service: keyof typeof SOCIAL_PREFIXES
): string {
  if (!url) return '';

  // Special handling for Hatena Blog (https://{id}.hatenablog.com/)
  if (service === 'hatena') {
    const hatenaMatch = url.match(
      /^https?:\/\/([^.]+)\.hatenablog\.(com|jp|ne\.jp)\/?$/
    );
    if (hatenaMatch) {
      return hatenaMatch[1];
    }
    // If it's not a full URL, treat it as an ID
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return url;
    }
    return '';
  }

  const prefix = SOCIAL_PREFIXES[service];
  if (url.startsWith(prefix)) {
    return url.slice(prefix.length).replace(/\/$/, '');
  }
  // Handle legacy twitter.com URLs
  if (service === 'twitter' && url.startsWith('https://twitter.com/')) {
    return url.slice('https://twitter.com/'.length).replace(/\/$/, '');
  }
  // If it's not a full URL, treat it as an ID
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url;
  }
  return '';
}

// Build full URL from ID
function buildSocialUrl(
  id: string,
  service: keyof typeof SOCIAL_PREFIXES
): string {
  if (!id) return '';

  // Special handling for Hatena Blog (https://{id}.hatenablog.com/)
  if (service === 'hatena') {
    return `https://${id}.hatenablog.com/`;
  }

  return `${SOCIAL_PREFIXES[service]}${id}`;
}

// API key field configuration
const API_KEY_FIELDS = [
  {
    key: 'ai_openai_api_key' as const,
    provider: 'openai' as AIProvider,
    labelKey: 'settings.aiTools.openai.label',
    descriptionKey: 'settings.aiTools.openai.description',
    placeholder: 'sk-...',
  },
  {
    key: 'ai_anthropic_api_key' as const,
    provider: 'anthropic' as AIProvider,
    labelKey: 'settings.aiTools.anthropic.label',
    descriptionKey: 'settings.aiTools.anthropic.description',
    placeholder: 'sk-ant-...',
  },
  {
    key: 'ai_gemini_api_key' as const,
    provider: 'gemini' as AIProvider,
    labelKey: 'settings.aiTools.gemini.label',
    descriptionKey: 'settings.aiTools.gemini.description',
    placeholder: 'AIza...',
  },
] as const;

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

  function handleSocialPaste(
    e: ClipboardEvent<HTMLInputElement>,
    service: keyof typeof SOCIAL_PREFIXES,
    settingKey: keyof SiteSettings
  ) {
    const pastedText = e.clipboardData.getData('text').trim();
    // Handle full URLs (including legacy twitter.com)
    if (pastedText.startsWith('http://') || pastedText.startsWith('https://')) {
      e.preventDefault();
      const id = extractSocialId(pastedText, service);
      handleSocialIdChange(service, settingKey, id);
    }
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
        {/* Basic Settings */}
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
                onChange={(e) => handleChange('site_name', e.target.value)}
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
                onChange={(e) =>
                  handleChange('site_description', e.target.value)
                }
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
                onChange={(e) => handleChange('author_name', e.target.value)}
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
                onChange={(e) => handleChange('footer_text', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder={t('settings.basic.footerTextPlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            {t('settings.social.title')}
          </h2>
          <div className="space-y-2">
            {[
              {
                key: 'bento',
                label: 'Bento',
                icon: <LayoutGrid className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'bluesky',
                label: 'BlueSky',
                icon: <BlueSkyIcon className="h-4 w-4" />,
                placeholder: 'user.bsky.social',
              },
              {
                key: 'devto',
                label: 'Dev.to',
                icon: <DevToIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'github',
                label: 'GitHub',
                icon: <Github className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'hackernews',
                label: 'Hacker News',
                icon: <HackerNewsIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'hatena',
                label: 'Hatena',
                icon: <HatenaIcon className="h-4 w-4" />,
                placeholder: 'username (→ username.hatenablog.com)',
              },
              {
                key: 'lapras',
                label: 'Lapras',
                icon: <LaprasIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'linkedin',
                label: 'LinkedIn',
                icon: <Linkedin className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'medium',
                label: 'Medium',
                icon: <MediumIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'note',
                label: 'note',
                icon: <NoteIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'qiita',
                label: 'Qiita',
                icon: <QiitaIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'reddit',
                label: 'Reddit',
                icon: <RedditIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'techfeed',
                label: 'TechFeed',
                icon: <TechFeedIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'threads',
                label: 'Threads',
                icon: <ThreadsIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'wantedly',
                label: 'Wantedly',
                icon: <WantedlyIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'twitter',
                label: 'X',
                icon: <XIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'zenn',
                label: 'Zenn',
                icon: <ZennIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
            ].map(({ key, label, icon, placeholder }) => {
              const settingKey = `social_${key}` as keyof SiteSettings;
              const showKey = `show_${key}_link` as keyof SiteSettings;
              const value = settings?.[settingKey] || '';
              const isVisible = settings?.[showKey] !== 'false';

              return (
                <div key={key} className="flex items-center gap-2">
                  {/* Toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isVisible}
                    aria-label={`${isVisible ? 'Hide' : 'Show'} ${label} link`}
                    onClick={() => handleToggle(showKey)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      isVisible ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        isVisible ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  {/* Icon + Label */}
                  <label
                    htmlFor={settingKey}
                    className="flex w-24 shrink-0 items-center gap-2 text-sm font-medium"
                  >
                    {icon}
                    {label}
                    {(isFieldModified(settingKey) ||
                      isFieldModified(showKey)) && (
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </label>

                  {/* Input */}
                  <div className="flex flex-1">
                    <input
                      id={settingKey}
                      type="text"
                      value={extractSocialId(
                        value,
                        key as keyof typeof SOCIAL_PREFIXES
                      )}
                      onChange={(e) =>
                        handleSocialIdChange(
                          key as keyof typeof SOCIAL_PREFIXES,
                          settingKey,
                          e.target.value
                        )
                      }
                      onPaste={(e) =>
                        handleSocialPaste(
                          e,
                          key as keyof typeof SOCIAL_PREFIXES,
                          settingKey
                        )
                      }
                      className="w-full rounded-l-lg border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder={placeholder}
                    />
                    <a
                      href={value || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center rounded-r-lg border border-l-0 border-border bg-muted px-2 text-muted-foreground transition-colors ${
                        value
                          ? 'cursor-pointer hover:bg-muted/80 hover:text-foreground'
                          : 'pointer-events-none opacity-50'
                      }`}
                      aria-label={`Open ${label} profile`}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Display Options */}
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
                onClick={() => handleToggle('show_rss_link')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  settings?.show_rss_link === 'true' ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings?.show_rss_link === 'true'
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Appearance */}
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
              onChange={(e) => handleChange('default_theme', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="system">
                {t('settings.appearance.themes.system')}
              </option>
              <option value="light">
                {t('settings.appearance.themes.light')}
              </option>
              <option value="dark">
                {t('settings.appearance.themes.dark')}
              </option>
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
              onChange={(e) => handleChange('default_locale', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="auto">
                {t('settings.appearance.locales.auto')}
              </option>
              <option value="ja">{t('settings.appearance.locales.ja')}</option>
              <option value="en">{t('settings.appearance.locales.en')}</option>
            </select>
          </div>
        </div>

        {/* AI Tools */}
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
                const isMasked = value.endsWith('****');
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
                          value={value}
                          onChange={(e) =>
                            handleApiKeyChange(key, e.target.value)
                          }
                          className="flex-1 rounded-l-lg border border-border bg-background px-4 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder={placeholder}
                        />
                        <button
                          type="button"
                          onClick={() => toggleApiKeyVisibility(key)}
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
                        onClick={() => handleTestAIKey(provider, value)}
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
                        onClick={() => handleClearApiKey(key, provider)}
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
                            : testResult.message ||
                              t('settings.aiTools.testError')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* CMS API Key Management */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Key className="h-5 w-5" />
            <h2 className="text-xl font-semibold">
              {t('settings.apiKey.title')}
            </h2>
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
                    <code className="flex-1 rounded bg-muted p-3 font-mono text-sm break-all">
                      {generatedKey}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyApiKey}
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
                  className={`text-xs px-2 py-0.5 rounded-full ${
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
              onClick={handleGenerateApiKey}
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
                onClick={handleToggleApiKey}
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
      </div>
    </div>
  );
}
