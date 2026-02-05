'use client';

import type { AIProvider, ApiKeyStatus, SiteSettings } from '@blog/cms-types';
import { Alert, AlertDescription, Button } from '@blog/ui';
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

// Hatena Blog icon (B! logo)
function HatenaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.017 22.162c-5.5 0-9.962-4.462-9.962-9.962S6.517 2.238 12.017 2.238s9.962 4.462 9.962 9.962-4.462 9.962-9.962 9.962zm-1.5-14.5h-3v10h3v-4h.5c2.5 0 3.5-1.5 3.5-3s-1-3-3.5-3h-.5zm.5 4h-.5v-2h.5c1 0 1.5.5 1.5 1s-.5 1-1.5 1zm5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
    </svg>
  );
}

// Medium icon
function MediumIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    </svg>
  );
}

// note.com icon
function NoteIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M22.8 3.6H1.2C.54 3.6 0 4.14 0 4.8v14.4c0 .66.54 1.2 1.2 1.2h21.6c.66 0 1.2-.54 1.2-1.2V4.8c0-.66-.54-1.2-1.2-1.2zM8.4 16.8H4.8v-9.6h3.6v9.6zm6 0h-3.6V12h3.6v4.8zm5.4 0h-3.6V9.6h3.6v7.2z" />
    </svg>
  );
}

// TechFeed icon
function TechFeedIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 3h18v3H3V3zm0 5h18v2H3V8zm0 4h12v2H3v-2zm0 4h18v2H3v-2zm0 4h12v2H3v-2z" />
    </svg>
  );
}

// Dev.to icon
function DevToIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6v4.36h.58c.37 0 .65-.08.84-.23.19-.16.29-.45.29-.89v-2.12c0-.44-.1-.73-.29-.89zM0 4.94v14.12h24V4.94H0zM8.56 15.3c-.44.58-1.06.77-1.98.77H4.67V8.01h1.93c.93 0 1.54.17 1.98.77.44.6.66 1.42.66 2.47v1.58c0 1.05-.22 1.87-.68 2.47zm4.04-2.78c0 .29-.1.57-.27.84-.17.27-.43.47-.75.63-.32.16-.7.24-1.14.24-.51 0-.97-.13-1.39-.39-.42-.26-.63-.66-.63-1.2h1.34c0 .23.07.4.21.52.14.12.35.18.62.18.23 0 .41-.05.54-.15.13-.1.2-.24.2-.42 0-.19-.07-.35-.2-.47s-.36-.25-.68-.4c-.56-.26-.97-.53-1.23-.81-.26-.28-.39-.64-.39-1.08 0-.49.17-.88.52-1.18.35-.3.82-.45 1.4-.45.58 0 1.07.15 1.44.46.37.31.55.71.55 1.21h-1.34c0-.18-.05-.33-.14-.44-.09-.11-.25-.17-.47-.17-.18 0-.33.05-.43.14-.1.09-.15.22-.15.37 0 .17.07.32.21.45.14.13.39.27.75.42.54.23.95.5 1.21.81.26.31.39.68.39 1.11zm5.07 2.73h-2.5V8.01h2.5c.55 0 .97.18 1.26.53.29.35.43.83.43 1.43v3.1c0 .6-.14 1.08-.43 1.43-.29.35-.71.53-1.26.53z" />
    </svg>
  );
}

// Hacker News icon
function HackerNewsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M0 0v24h24V0H0zm12.8 13.4v5.3h-1.5v-5.3L7.5 5.3h1.7l2.8 5.8 2.8-5.8h1.7l-3.7 8.1z" />
    </svg>
  );
}

// Qiita icon
function QiitaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 17.568c-3.073 0-5.568-2.495-5.568-5.568S8.927 6.432 12 6.432s5.568 2.495 5.568 5.568-2.495 5.568-5.568 5.568zm6.503 2.391l1.414-1.414-2.12-2.121-1.415 1.414 2.121 2.121z" />
    </svg>
  );
}

// Reddit icon
function RedditIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

// Zenn icon
function ZennIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M.264 23.771h4.984c.264 0 .498-.147.645-.352L19.614.874c.176-.293-.029-.645-.381-.645h-4.72c-.235 0-.44.117-.587.323L.03 23.361c-.088.176.029.41.234.41zM17.445 23.419l6.479-10.408c.205-.323-.029-.733-.41-.733h-4.691c-.176 0-.352.088-.44.235l-6.655 10.643c-.176.264.029.616.352.616h4.779c.205-.001.381-.118.586-.353z" />
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
