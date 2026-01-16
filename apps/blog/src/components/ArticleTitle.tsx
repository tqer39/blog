'use client';

import { Copy, Pencil } from 'lucide-react';
import Link from 'next/link';

interface ArticleTitleProps {
  title: string;
  id?: string;
  hash?: string;
  isLoggedIn?: boolean;
}

export function ArticleTitle({
  title,
  id = 'title',
  hash,
  isLoggedIn,
}: ArticleTitleProps) {
  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <h1 id={id} className="group text-3xl font-bold scroll-mt-20">
      {title}
      <span className="ml-2 inline-flex items-baseline gap-1 opacity-0 transition-opacity group-hover:opacity-40 hover:!opacity-100">
        <a
          href={`#${id}`}
          className="text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
          aria-label="Link to this section"
        >
          #
        </a>
        <button
          type="button"
          onClick={handleCopyLink}
          className="ml-1 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
          aria-label="Copy link to clipboard"
        >
          <Copy className="h-5 w-5" />
        </button>
        {isLoggedIn && hash && (
          <Link
            href={`/admin/articles/${hash}/edit`}
            className="ml-1 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
            aria-label="Edit article"
            title="記事を編集"
          >
            <Pencil className="h-5 w-5" />
          </Link>
        )}
      </span>
    </h1>
  );
}
