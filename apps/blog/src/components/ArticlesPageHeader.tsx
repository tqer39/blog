'use client';

import { X } from 'lucide-react';
import Link from 'next/link';

import { useI18n } from '@/i18n';

interface ArticlesPageTitleProps {
  searchQuery?: string;
}

export function ArticlesPageTitle({ searchQuery }: ArticlesPageTitleProps) {
  const { t } = useI18n();

  return (
    <h1 className="mb-8 text-3xl font-bold">
      {t('publicArticles.allArticles')}
    </h1>
  );
}

interface SearchResultsBannerProps {
  searchQuery: string;
  resultCount: number;
  clearUrl: string;
}

export function SearchResultsBanner({
  searchQuery,
  resultCount,
  clearUrl,
}: SearchResultsBannerProps) {
  const { t } = useI18n();

  return (
    <div className="mb-6 flex items-center gap-2 rounded-lg bg-stone-100 px-4 py-3 dark:bg-stone-800">
      <span className="text-stone-600 dark:text-stone-400">
        {t('publicArticles.searchResults', { query: searchQuery })}
        <span className="ml-2 text-sm">
          ({t('publicArticles.resultCount', { count: resultCount })})
        </span>
      </span>
      <Link
        href={clearUrl}
        className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-sm text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-200"
      >
        <X className="h-4 w-4" />
        {t('publicArticles.clear')}
      </Link>
    </div>
  );
}

interface EmptyStateMessageProps {
  hasSearchQuery: boolean;
  hasSelectedTags: boolean;
  isPaginated?: boolean;
}

export function EmptyStateMessage({
  hasSearchQuery,
  hasSelectedTags,
  isPaginated = false,
}: EmptyStateMessageProps) {
  const { t } = useI18n();

  let message: string;
  if (hasSearchQuery) {
    message = t('publicArticles.noSearchResults');
  } else if (hasSelectedTags) {
    message = t('publicArticles.noMatchingTags');
  } else if (isPaginated) {
    message = t('publicArticles.noArticlesOnPage');
  } else {
    message = t('publicArticles.noArticles');
  }

  return <p className="text-stone-600 dark:text-stone-400">{message}</p>;
}
