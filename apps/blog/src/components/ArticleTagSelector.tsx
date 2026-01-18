'use client';

import { ChevronDown, ChevronUp, X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface ArticleTagSelectorProps {
  allTags: string[];
}

const INITIAL_TAGS_COUNT = 10;

export function ArticleTagSelector({ allTags }: ArticleTagSelectorProps) {
  const searchParams = useSearchParams();
  const selectedTags = searchParams.getAll('tags');
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleTags = isExpanded
    ? allTags
    : allTags.slice(0, INITIAL_TAGS_COUNT);
  const hasMoreTags = allTags.length > INITIAL_TAGS_COUNT;

  const buildTagUrl = (tag: string) => {
    const newParams = new URLSearchParams();
    const isSelected = selectedTags.includes(tag);

    if (isSelected) {
      // Remove tag
      for (const t of selectedTags) {
        if (t !== tag) {
          newParams.append('tags', t);
        }
      }
    } else {
      // Add tag
      for (const t of selectedTags) {
        newParams.append('tags', t);
      }
      newParams.append('tags', tag);
    }

    return newParams.toString()
      ? `/articles?${newParams.toString()}`
      : '/articles';
  };

  if (allTags.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Tags
        </span>
        {selectedTags.length > 0 && (
          <Link
            href="/articles"
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
          >
            <X className="h-3 w-3" />
            Clear filters
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <Link
              key={tag}
              href={buildTagUrl(tag)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                isSelected
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600'
              }`}
            >
              {tag}
            </Link>
          );
        })}
      </div>

      {hasMoreTags && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer mt-3 flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show all ({allTags.length} tags)
            </>
          )}
        </button>
      )}
    </div>
  );
}
