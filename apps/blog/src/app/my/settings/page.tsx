'use client';

import type { SiteSettings } from '@blog/cms-types';
import { Alert, AlertDescription, Button } from '@blog/ui';
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Github,
  LayoutGrid,
  Linkedin,
  Loader2,
  Save,
} from 'lucide-react';
import type { ClipboardEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { getSiteSettings, updateSiteSettings } from '@/lib/api/client';

// X (formerly Twitter) icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// BlueSky icon
function BlueSkyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
    </svg>
  );
}

// Threads icon
function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.88-.73 2.108-1.146 3.456-1.17 1.076-.02 2.063.152 2.937.507.032-.674.12-1.187-.087-1.611-.22-.452-.725-.677-1.5-.67-.76.007-1.297.183-1.693.555-.34.32-.556.843-.642 1.555l-2.092-.098c.118-1.17.562-2.126 1.32-2.844.828-.784 2.008-1.198 3.413-1.198h.003c1.583.003 2.779.477 3.557 1.41.696.835 1.006 1.98.924 3.406l-.004.073c1.117.67 2.017 1.593 2.604 2.71.79 1.504.98 3.94-.767 5.651-1.862 1.822-4.162 2.635-7.446 2.659Zm.07-7.63c-.996.02-1.793.264-2.306.704-.47.402-.69.924-.66 1.552.037.736.382 1.21.864 1.523.569.37 1.34.535 2.164.49 1.076-.059 1.873-.451 2.437-1.2.467-.618.76-1.47.872-2.535a8.327 8.327 0 0 0-3.371-.533Z" />
    </svg>
  );
}

// Lapras icon (using a simple L design)
function LaprasIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 4v16h12v-3H9V4H6z" />
    </svg>
  );
}

// Wantedly icon (using W design)
function WantedlyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.453 14.555 20 6H4l1.547 8.555L8.25 18l3.75-3.555L15.75 18l2.703-3.445ZM6.328 8h11.344l-.766 4.238-1.477 1.88L12 11.06l-3.43 3.058-1.476-1.88L6.328 8Z" />
    </svg>
  );
}

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
} as const;

// Extract ID from full URL
function extractSocialId(
  url: string,
  service: keyof typeof SOCIAL_PREFIXES
): string {
  if (!url) return '';
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
  return `${SOCIAL_PREFIXES[service]}${id}`;
}

// API key field configuration
const API_KEY_FIELDS = [
  {
    key: 'ai_openai_api_key' as const,
    label: 'OpenAI API Key',
    description: 'Used for metadata generation and DALL-E image generation',
    placeholder: 'sk-...',
  },
  {
    key: 'ai_anthropic_api_key' as const,
    label: 'Anthropic API Key',
    description: 'Used for review, outline, text transform, and continuation',
    placeholder: 'sk-ant-...',
  },
  {
    key: 'ai_gemini_api_key' as const,
    label: 'Gemini API Key',
    description: 'Used for image generation',
    placeholder: 'AIza...',
  },
] as const;

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSiteSettings();
      setSettings(response.settings);
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

  async function handleSave() {
    if (!settings) return;

    try {
      setSaving(true);
      setMessage(null);
      await updateSiteSettings(settings);
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save settings',
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

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Settings
        </Button>
      </div>

      {message && (
        <Alert
          variant={message.type === 'error' ? 'destructive' : 'default'}
          className="mb-6"
        >
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        {/* Basic Settings */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold">Basic Settings</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="site_name"
                className="mb-2 block text-sm font-medium"
              >
                Site Name
              </label>
              <input
                id="site_name"
                type="text"
                value={settings?.site_name || ''}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="My Blog"
              />
            </div>
            <div>
              <label
                htmlFor="site_description"
                className="mb-2 block text-sm font-medium"
              >
                Site Description
              </label>
              <textarea
                id="site_description"
                value={settings?.site_description || ''}
                onChange={(e) =>
                  handleChange('site_description', e.target.value)
                }
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="A brief description of your blog"
              />
            </div>
            <div>
              <label
                htmlFor="author_name"
                className="mb-2 block text-sm font-medium"
              >
                Author Name
              </label>
              <input
                id="author_name"
                type="text"
                value={settings?.author_name || ''}
                onChange={(e) => handleChange('author_name', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label
                htmlFor="footer_text"
                className="mb-2 block text-sm font-medium"
              >
                Footer Text (optional)
              </label>
              <input
                id="footer_text"
                type="text"
                value={settings?.footer_text || ''}
                onChange={(e) => handleChange('footer_text', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Additional footer text"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Social Links</h2>
          <div className="space-y-2">
            {[
              {
                key: 'github',
                label: 'GitHub',
                icon: <Github className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'twitter',
                label: 'X',
                icon: <XIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'bluesky',
                label: 'BlueSky',
                icon: <BlueSkyIcon className="h-4 w-4" />,
                placeholder: 'user.bsky.social',
              },
              {
                key: 'threads',
                label: 'Threads',
                icon: <ThreadsIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'linkedin',
                label: 'LinkedIn',
                icon: <Linkedin className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'wantedly',
                label: 'Wantedly',
                icon: <WantedlyIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'lapras',
                label: 'Lapras',
                icon: <LaprasIcon className="h-4 w-4" />,
                placeholder: 'username',
              },
              {
                key: 'bento',
                label: 'Bento',
                icon: <LayoutGrid className="h-4 w-4" />,
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
          <h2 className="mb-6 text-xl font-semibold">Display Options</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="show_rss_link"
                  className="block text-sm font-medium"
                >
                  Show RSS Link
                </label>
                <p className="text-sm text-muted-foreground">
                  Display RSS feed link in the footer
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
          <h2 className="mb-6 text-xl font-semibold">Appearance</h2>
          <div>
            <label
              htmlFor="default_theme"
              className="mb-2 block text-sm font-medium"
            >
              Default Theme
            </label>
            <p className="mb-2 text-sm text-muted-foreground">
              Theme for first-time visitors (users can override with their
              preference)
            </p>
            <select
              id="default_theme"
              value={settings?.default_theme || 'system'}
              onChange={(e) => handleChange('default_theme', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="system">システム設定に従う</option>
              <option value="light">ライトモード</option>
              <option value="dark">ダークモード</option>
              <option value="tokyonight">Tokyo Night</option>
              <option value="nord-light">Nord Light</option>
              <option value="autumn">Autumn</option>
            </select>
          </div>
        </div>

        {/* AI Tools */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">AI Tools</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Configure API keys for AI-powered features. Environment variables
            take priority if set.
          </p>
          <div className="space-y-4">
            {API_KEY_FIELDS.map(({ key, label, description, placeholder }) => {
              const value = settings?.[key] || '';
              const isVisible = showApiKeys[key] || false;
              const isMasked = value.endsWith('****');

              return (
                <div key={key}>
                  <label
                    htmlFor={key}
                    className="mb-1 block text-sm font-medium"
                  >
                    {label}
                  </label>
                  <p className="mb-2 text-xs text-muted-foreground">
                    {description}
                  </p>
                  <div className="flex">
                    <input
                      id={key}
                      type={isVisible ? 'text' : 'password'}
                      value={value}
                      onChange={(e) => handleApiKeyChange(key, e.target.value)}
                      className="flex-1 rounded-l-lg border border-border bg-background px-4 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder={placeholder}
                    />
                    <button
                      type="button"
                      onClick={() => toggleApiKeyVisibility(key)}
                      className="inline-flex items-center rounded-r-lg border border-l-0 border-border bg-muted px-3 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                      aria-label={isVisible ? 'Hide API key' : 'Show API key'}
                    >
                      {isVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {isMasked && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      API key is set. Enter a new value to replace it.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
