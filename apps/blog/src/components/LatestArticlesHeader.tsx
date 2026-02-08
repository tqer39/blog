'use client';

import Link from 'next/link';

import { useI18n } from '@/i18n';

interface LatestArticlesHeaderProps {
  hasArticles: boolean;
}

export function LatestArticlesHeader({
  hasArticles,
}: LatestArticlesHeaderProps) {
  const { t } = useI18n();

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">
        {t('publicArticles.latestArticles')}
      </h1>
      {!hasArticles && (
        <p className="text-stone-600 dark:text-stone-400">
          {t('publicArticles.noArticles')}
        </p>
      )}
    </>
  );
}

export function ViewAllArticlesLink() {
  const { t } = useI18n();

  return (
    <div className="mt-8">
      <Link
        href="/articles"
        className="text-blue-600 hover:underline dark:text-blue-400"
      >
        {t('publicArticles.viewAll')}
      </Link>
    </div>
  );
}
