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
import { DEFAULT_API_URL } from '@blog/config';
import { Github, LayoutGrid, Linkedin, Rss, User } from 'lucide-react';
import Image from 'next/image';
import { getSiteSettings } from '@/lib/siteSettings';

const API_URL = process.env.CMS_API_URL || DEFAULT_API_URL;

export async function Footer() {
  const settings = await getSiteSettings();
  const avatarUrl = settings.author_avatar_id
    ? `${API_URL}/images/${settings.author_avatar_id}/file`
    : null;

  return (
    <footer className="border-t border-stone-200 dark:border-stone-700">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          {/* Author Avatar and Name */}
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={settings.author_name || 'Author'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-stone-400 dark:text-stone-500">
                  <User className="h-6 w-6" />
                </div>
              )}
            </div>
            {settings.author_name && (
              <span className="font-medium text-stone-700 dark:text-stone-300">
                {settings.author_name}
              </span>
            )}
          </div>

          <div className="flex gap-4">
            {settings.social_bento && settings.show_bento_link !== 'false' && (
              <a
                href={settings.social_bento}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                aria-label="Bento"
              >
                <LayoutGrid className="h-6 w-6" />
              </a>
            )}
            {settings.social_bluesky &&
              settings.show_bluesky_link !== 'false' && (
                <a
                  href={settings.social_bluesky}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  aria-label="BlueSky"
                >
                  <BlueSkyIcon className="h-6 w-6" />
                </a>
              )}
            {settings.social_devto && settings.show_devto_link !== 'false' && (
              <a
                href={settings.social_devto}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                aria-label="Dev.to"
              >
                <DevToIcon className="h-6 w-6" />
              </a>
            )}
            {settings.social_github &&
              settings.show_github_link !== 'false' && (
                <a
                  href={settings.social_github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  aria-label="GitHub"
                >
                  <Github className="h-6 w-6" />
                </a>
              )}
            {settings.social_hackernews &&
              settings.show_hackernews_link !== 'false' && (
                <a
                  href={settings.social_hackernews}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  aria-label="Hacker News"
                >
                  <HackerNewsIcon className="h-6 w-6" />
                </a>
              )}
            {settings.social_hatena &&
              settings.show_hatena_link !== 'false' && (
                <a
                  href={settings.social_hatena}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  aria-label="Hatena Blog"
                >
                  <HatenaIcon className="h-6 w-6" />
                </a>
              )}
            {settings.social_lapras &&
              settings.show_lapras_link !== 'false' && (
                <a
                  href={settings.social_lapras}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  aria-label="Lapras"
                >
                  <LaprasIcon className="h-6 w-6" />
                </a>
              )}
            {settings.social_linkedin &&
              settings.show_linkedin_link !== 'false' && (
                <a
                  href={settings.social_linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              )}
            {settings.social_medium &&
              settings.show_medium_link !== 'false' && (
                <a
                  href={settings.social_medium}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  aria-label="Medium"
                >
                  <MediumIcon className="h-6 w-6" />
                </a>
              )}
            {settings.social_note && settings.show_note_link !== 'false' && (
              <a
                href={settings.social_note}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                aria-label="note"
              >
                <NoteIcon className="h-6 w-6" />
              </a>
            )}
            {settings.social_qiita && settings.show_qiita_link !== 'false' && (
              <a
                href={settings.social_qiita}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                aria-label="Qiita"
              >
                <QiitaIcon className="h-6 w-6" />
              </a>
            )}
            {settings.social_reddit &&
              settings.show_reddit_link !== 'false' && (
                <a
                  href={settings.social_reddit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  aria-label="Reddit"
                >
                  <RedditIcon className="h-6 w-6" />
                </a>
              )}
            {settings.social_techfeed &&
              settings.show_techfeed_link !== 'false' && (
                <a
                  href={settings.social_techfeed}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  aria-label="TechFeed"
                >
                  <TechFeedIcon className="h-6 w-6" />
                </a>
              )}
            {settings.social_threads &&
              settings.show_threads_link !== 'false' && (
                <a
                  href={settings.social_threads}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  aria-label="Threads"
                >
                  <ThreadsIcon className="h-6 w-6" />
                </a>
              )}
            {settings.social_wantedly &&
              settings.show_wantedly_link !== 'false' && (
                <a
                  href={settings.social_wantedly}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  aria-label="Wantedly"
                >
                  <WantedlyIcon className="h-6 w-6" />
                </a>
              )}
            {settings.social_twitter &&
              settings.show_twitter_link !== 'false' && (
                <a
                  href={settings.social_twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  aria-label="X (Twitter)"
                >
                  <XIcon className="h-6 w-6" />
                </a>
              )}
            {settings.social_zenn && settings.show_zenn_link !== 'false' && (
              <a
                href={settings.social_zenn}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                aria-label="Zenn"
              >
                <ZennIcon className="h-6 w-6" />
              </a>
            )}
            {settings.show_rss_link === 'true' && (
              <a
                href="/feed.xml"
                className="cursor-pointer text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                aria-label="RSS Feed"
              >
                <Rss className="h-6 w-6" />
              </a>
            )}
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            &copy; {new Date().getFullYear()} {settings.site_name}. All rights
            reserved.
          </p>
          {settings.footer_text && (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {settings.footer_text}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
