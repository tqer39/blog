import Link from 'next/link';

import { ThemeSwitcher } from './ThemeSwitcher';

export function Header() {
  return (
    <header className="border-b border-stone-200 dark:border-stone-700">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-xl font-bold text-stone-900 dark:text-stone-100"
        >
          tqer39&apos;s blog
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/articles"
            className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            Articles
          </Link>
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}
