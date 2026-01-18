import { Github, LayoutGrid, Rss } from 'lucide-react';
import { getSiteSettings } from '@/lib/siteSettings';

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

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="border-t border-stone-200 dark:border-stone-700">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4">
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
