import { Github, LayoutGrid, Rss, Twitter } from 'lucide-react';
import { getSiteSettings } from '@/lib/siteSettings';

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="border-t border-stone-200 dark:border-stone-700">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4">
            {settings.social_github && (
              <a
                href={settings.social_github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                aria-label="GitHub"
              >
                <Github className="h-6 w-6" />
              </a>
            )}
            {settings.social_twitter && (
              <a
                href={settings.social_twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
            )}
            {settings.social_bento && (
              <a
                href={settings.social_bento}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                aria-label="Bento"
              >
                <LayoutGrid className="h-6 w-6" />
              </a>
            )}
            {settings.show_rss_link === 'true' && (
              <a
                href="/feed.xml"
                className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
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
