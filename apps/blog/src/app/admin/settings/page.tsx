'use client';

import type { SiteSettings } from '@blog/cms-types';
import { Alert, AlertDescription, Button } from '@blog/ui';
import { Github, LayoutGrid, Loader2, Save } from 'lucide-react';
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

// Social link prefixes for each service
const SOCIAL_PREFIXES = {
  github: 'https://github.com/',
  twitter: 'https://x.com/',
  bento: 'https://bento.me/',
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

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
          <h2 className="mb-6 text-xl font-semibold">Social Links</h2>
          <div className="space-y-4">
            {/* GitHub */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label
                  htmlFor="social_github"
                  className="mb-2 flex items-center gap-2 text-sm font-medium"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-border bg-muted px-3 text-sm text-muted-foreground">
                    {SOCIAL_PREFIXES.github}
                  </span>
                  <input
                    id="social_github"
                    type="text"
                    value={extractSocialId(
                      settings?.social_github || '',
                      'github'
                    )}
                    onChange={(e) =>
                      handleSocialIdChange(
                        'github',
                        'social_github',
                        e.target.value
                      )
                    }
                    onPaste={(e) =>
                      handleSocialPaste(e, 'github', 'social_github')
                    }
                    className="w-full rounded-l-none rounded-r-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="username"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center pt-6">
                <span className="mb-1 text-xs text-muted-foreground">
                  Display
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings?.show_github_link !== 'false'}
                  onClick={() => handleToggle('show_github_link')}
                  className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    settings?.show_github_link !== 'false'
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings?.show_github_link !== 'false'
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* X (Twitter) */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label
                  htmlFor="social_twitter"
                  className="mb-2 flex items-center gap-2 text-sm font-medium"
                >
                  <XIcon className="h-4 w-4" />
                  X (Twitter)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-border bg-muted px-3 text-sm text-muted-foreground">
                    {SOCIAL_PREFIXES.twitter}
                  </span>
                  <input
                    id="social_twitter"
                    type="text"
                    value={extractSocialId(
                      settings?.social_twitter || '',
                      'twitter'
                    )}
                    onChange={(e) =>
                      handleSocialIdChange(
                        'twitter',
                        'social_twitter',
                        e.target.value
                      )
                    }
                    onPaste={(e) =>
                      handleSocialPaste(e, 'twitter', 'social_twitter')
                    }
                    className="w-full rounded-l-none rounded-r-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="username"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center pt-6">
                <span className="mb-1 text-xs text-muted-foreground">
                  Display
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings?.show_twitter_link !== 'false'}
                  onClick={() => handleToggle('show_twitter_link')}
                  className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    settings?.show_twitter_link !== 'false'
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings?.show_twitter_link !== 'false'
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Bento */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label
                  htmlFor="social_bento"
                  className="mb-2 flex items-center gap-2 text-sm font-medium"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Bento
                </label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-border bg-muted px-3 text-sm text-muted-foreground">
                    {SOCIAL_PREFIXES.bento}
                  </span>
                  <input
                    id="social_bento"
                    type="text"
                    value={extractSocialId(
                      settings?.social_bento || '',
                      'bento'
                    )}
                    onChange={(e) =>
                      handleSocialIdChange(
                        'bento',
                        'social_bento',
                        e.target.value
                      )
                    }
                    onPaste={(e) =>
                      handleSocialPaste(e, 'bento', 'social_bento')
                    }
                    className="w-full rounded-l-none rounded-r-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="username"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center pt-6">
                <span className="mb-1 text-xs text-muted-foreground">
                  Display
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings?.show_bento_link !== 'false'}
                  onClick={() => handleToggle('show_bento_link')}
                  className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    settings?.show_bento_link !== 'false'
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings?.show_bento_link !== 'false'
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
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
      </div>
    </div>
  );
}
