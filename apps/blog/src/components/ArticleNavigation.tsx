import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ArticleNavigationProps {
  prevArticle: { hash: string; title: string } | null;
  nextArticle: { hash: string; title: string } | null;
}

export function ArticleNavigation({ prevArticle, nextArticle }: ArticleNavigationProps) {
  if (!prevArticle && !nextArticle) {
    return null;
  }

  return (
    <nav className="mt-12 border-t border-stone-200 pt-8 dark:border-stone-700">
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
    </nav>
  );
}
