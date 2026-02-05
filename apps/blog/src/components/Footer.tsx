import { Github, LayoutGrid, Linkedin, Rss } from 'lucide-react';
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

// Wantedly icon
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

// Lapras icon
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

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="border-t border-stone-200 dark:border-stone-700">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center gap-4">
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
