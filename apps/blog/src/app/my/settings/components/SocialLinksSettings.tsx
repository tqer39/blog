import type { SiteSettings } from '@blog/cms-types';
import {
  BlueSkyIcon,
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
import { ArrowUpRight, Github, LayoutGrid, Linkedin } from 'lucide-react';
import type { ClipboardEvent } from 'react';
import { useI18n } from '@/i18n';
import { buildSocialUrl, extractSocialId, SOCIAL_PREFIXES } from '../constants';

const SOCIAL_LINKS_CONFIG = [
  {
    key: 'bento',
    label: 'Bento',
    icon: <LayoutGrid className="h-4 w-4" />,
    placeholder: 'username (→ bento.me/username)',
    url: 'https://bento.me',
  },
  {
    key: 'bluesky',
    label: 'BlueSky',
    icon: <BlueSkyIcon className="h-4 w-4" />,
    placeholder: 'user.bsky.social (→ bsky.app/profile/user.bsky.social)',
    url: 'https://bsky.app',
  },
  {
    key: 'devto',
    label: 'Dev.to',
    icon: <DevToIcon className="h-4 w-4" />,
    placeholder: 'username (→ dev.to/username)',
    url: 'https://dev.to',
  },
  {
    key: 'github',
    label: 'GitHub',
    icon: <Github className="h-4 w-4" />,
    placeholder: 'username (→ github.com/username)',
    url: 'https://github.com',
  },
  {
    key: 'hackernews',
    label: 'Hacker News',
    icon: <HackerNewsIcon className="h-4 w-4" />,
    placeholder: 'username (→ news.ycombinator.com/user?id=username)',
    url: 'https://news.ycombinator.com',
  },
  {
    key: 'hatena',
    label: 'Hatena',
    icon: <HatenaIcon className="h-4 w-4" />,
    placeholder: 'username (→ username.hatenablog.com)',
    url: 'https://hatenablog.com',
  },
  {
    key: 'lapras',
    label: 'Lapras',
    icon: <LaprasIcon className="h-4 w-4" />,
    placeholder: 'username (→ lapras.com/public/username)',
    url: 'https://lapras.com',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: <Linkedin className="h-4 w-4" />,
    placeholder: 'username (→ linkedin.com/in/username)',
    url: 'https://linkedin.com',
  },
  {
    key: 'medium',
    label: 'Medium',
    icon: <MediumIcon className="h-4 w-4" />,
    placeholder: 'username (→ medium.com/@username)',
    url: 'https://medium.com',
  },
  {
    key: 'note',
    label: 'note',
    icon: <NoteIcon className="h-4 w-4" />,
    placeholder: 'username (→ note.com/username)',
    url: 'https://note.com',
  },
  {
    key: 'qiita',
    label: 'Qiita',
    icon: <QiitaIcon className="h-4 w-4" />,
    placeholder: 'username (→ qiita.com/username)',
    url: 'https://qiita.com',
  },
  {
    key: 'reddit',
    label: 'Reddit',
    icon: <RedditIcon className="h-4 w-4" />,
    placeholder: 'username (→ reddit.com/user/username)',
    url: 'https://reddit.com',
  },
  {
    key: 'techfeed',
    label: 'TechFeed',
    icon: <TechFeedIcon className="h-4 w-4" />,
    placeholder: 'username (→ techfeed.io/people/@username)',
    url: 'https://techfeed.io',
  },
  {
    key: 'threads',
    label: 'Threads',
    icon: <ThreadsIcon className="h-4 w-4" />,
    placeholder: 'username (→ threads.net/@username)',
    url: 'https://threads.net',
  },
  {
    key: 'wantedly',
    label: 'Wantedly',
    icon: <WantedlyIcon className="h-4 w-4" />,
    placeholder: 'username (→ wantedly.com/id/username)',
    url: 'https://wantedly.com',
  },
  {
    key: 'twitter',
    label: 'X',
    icon: <XIcon className="h-4 w-4" />,
    placeholder: 'username (→ x.com/username)',
    url: 'https://x.com',
  },
  {
    key: 'zenn',
    label: 'Zenn',
    icon: <ZennIcon className="h-4 w-4" />,
    placeholder: 'username (→ zenn.dev/username)',
    url: 'https://zenn.dev',
  },
] as const;

interface SocialLinksSettingsProps {
  settings: SiteSettings | null;
  onToggle: (key: keyof SiteSettings) => void;
  onSocialIdChange: (
    service: keyof typeof SOCIAL_PREFIXES,
    settingKey: keyof SiteSettings,
    id: string
  ) => void;
  isFieldModified: (key: keyof SiteSettings) => boolean;
}

export function SocialLinksSettings({
  settings,
  onToggle,
  onSocialIdChange,
  isFieldModified,
}: SocialLinksSettingsProps) {
  const { t } = useI18n();

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
      onSocialIdChange(service, settingKey, id);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">
        {t('settings.social.title')}
      </h2>
      <div className="space-y-2">
        {SOCIAL_LINKS_CONFIG.map(({ key, label, icon, placeholder, url }) => {
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
                onClick={() => onToggle(showKey)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                  isVisible ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-background shadow-sm transition-transform ${
                    isVisible ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>

              {/* Icon + Label */}
              <div className="flex w-24 shrink-0 items-center gap-2 text-sm font-medium">
                {icon}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline"
                >
                  {label}
                </a>
                {(isFieldModified(settingKey) || isFieldModified(showKey)) && (
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>

              {/* Input */}
              <div className="flex flex-1">
                <input
                  id={settingKey}
                  type="text"
                  value={extractSocialId(
                    value as string,
                    key as keyof typeof SOCIAL_PREFIXES
                  )}
                  onChange={(e) =>
                    onSocialIdChange(
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
                  href={(value as string) || '#'}
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
  );
}

export { buildSocialUrl, SOCIAL_PREFIXES };
