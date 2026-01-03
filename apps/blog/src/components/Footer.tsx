import { BsGithub, BsTwitter, BsLink45Deg } from 'react-icons/bs';

export function Footer() {
  return (
    <footer className="border-t border-stone-200 dark:border-stone-700">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <a
              href="https://github.com/tqer39"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              aria-label="GitHub"
            >
              <BsGithub className="h-6 w-6" />
            </a>
            <a
              href="https://twitter.com/tqer39"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              aria-label="Twitter"
            >
              <BsTwitter className="h-6 w-6" />
            </a>
            <a
              href="https://bento.me/tqer39"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              aria-label="Bento"
            >
              <BsLink45Deg className="h-6 w-6" />
            </a>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            &copy; {new Date().getFullYear()} tqer39. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
