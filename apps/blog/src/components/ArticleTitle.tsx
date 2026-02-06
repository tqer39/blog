'use client';

import { devError } from '@blog/utils';
import { Copy, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      devError('Failed to copy:', err);
    }
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
          className="cursor-pointer ml-1 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 align-middle"
          aria-label="Copy link to clipboard"
        >
          {copied ? (
            <span className="text-primary text-xs font-bold">Copied!</span>
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </button>
        {isLoggedIn && hash && (
          <Link
            href={`/my/articles/${hash}/edit`}
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
