'use client';

import { ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface ArticleNavigationProps {
  prevArticle: { hash: string; title: string } | null;
  nextArticle: { hash: string; title: string } | null;
}

export function ArticleNavigation({
  prevArticle,
  nextArticle,
}: ArticleNavigationProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="mt-12 border-t border-stone-200 pt-8 dark:border-stone-700">
      <button
        type="button"
        onClick={scrollToTop}
        className={`cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 p-3 text-stone-600 transition-colors hover:border-stone-400 hover:bg-stone-50 hover:text-stone-900 dark:border-stone-700 dark:text-stone-400 dark:hover:border-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-100 ${prevArticle || nextArticle ? 'mb-6' : ''}`}
      >
        <ChevronUp className="h-5 w-5" />
        トップに戻る
      </button>
      {(prevArticle || nextArticle) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          {prevArticle ? (
            <Link
              href={`/article/${prevArticle.hash}`}
              className="group flex flex-1 flex-col rounded-lg border border-stone-200 p-4 transition-colors hover:border-stone-400 hover:bg-stone-50 dark:border-stone-700 dark:hover:border-stone-500 dark:hover:bg-stone-800"
            >
              <span className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
                <ChevronLeft className="h-4 w-4" />
                前の記事
              </span>
              <span className="mt-1 line-clamp-2 font-medium text-stone-900 group-hover:text-blue-600 dark:text-stone-100 dark:group-hover:text-blue-400">
                {prevArticle.title}
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {nextArticle ? (
            <Link
              href={`/article/${nextArticle.hash}`}
              className="group flex flex-1 flex-col items-end rounded-lg border border-stone-200 p-4 text-right transition-colors hover:border-stone-400 hover:bg-stone-50 dark:border-stone-700 dark:hover:border-stone-500 dark:hover:bg-stone-800"
            >
              <span className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
                次の記事
                <ChevronRight className="h-4 w-4" />
              </span>
              <span className="mt-1 line-clamp-2 font-medium text-stone-900 group-hover:text-blue-600 dark:text-stone-100 dark:group-hover:text-blue-400">
                {nextArticle.title}
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      )}
    </nav>
  );
}
