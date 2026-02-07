'use client';

import type { Category } from '@blog/cms-types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { useI18n } from '@/i18n';

interface ArticleCategorySelectorProps {
  allCategories: Category[];
  selectedCategory?: string;
}

export function ArticleCategorySelector({
  allCategories,
  selectedCategory,
}: ArticleCategorySelectorProps) {
  const { t } = useI18n();
  const searchParams = useSearchParams();

  const buildCategoryUrl = (categorySlug: string) => {
    const newParams = new URLSearchParams();
    const isSelected = selectedCategory === categorySlug;

    // Preserve existing tags
    const tags = searchParams.getAll('tags');
    for (const tag of tags) {
      newParams.append('tags', tag);
    }

    // Preserve search query
    const q = searchParams.get('q');
    if (q) {
      newParams.set('q', q);
    }

    if (!isSelected) {
      newParams.set('category', categorySlug);
    }

    return newParams.toString()
      ? `/articles?${newParams.toString()}`
      : '/articles';
  };

  if (allCategories.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="mb-2">
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {t('filter.category')}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {allCategories.map((category) => {
          const isSelected = selectedCategory === category.slug;
          return (
            <Link
              key={category.id}
              href={buildCategoryUrl(category.slug)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors ${
                isSelected
                  ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-stone-900'
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: isSelected
                  ? category.color
                  : `${category.color}20`,
                color: isSelected ? 'white' : category.color,
                ...(isSelected &&
                  ({
                    '--tw-ring-color': category.color,
                  } as React.CSSProperties)),
              }}
            >
              <span
                className={`h-2 w-2 rounded-full ${isSelected ? 'bg-white' : ''}`}
                style={
                  !isSelected ? { backgroundColor: category.color } : undefined
                }
                aria-hidden="true"
              />
              {category.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
