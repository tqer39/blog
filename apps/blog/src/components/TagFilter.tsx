'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

export function TagFilter() {
  const searchParams = useSearchParams();
  const selectedTags = searchParams.getAll('tags');

  if (selectedTags.length === 0) {
    return null;
  }

  const removeTag = (tagToRemove: string) => {
    const newParams = new URLSearchParams();
    for (const tag of selectedTags) {
      if (tag !== tagToRemove) {
        newParams.append('tags', tag);
      }
    }
    return newParams.toString() ? `/articles?${newParams.toString()}` : '/articles';
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-sm text-stone-500 dark:text-stone-400">
        Filtering by:
      </span>
      {selectedTags.map((tag) => (
        <Link
          key={tag}
          href={removeTag(tag)}
          className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
        >
          {tag}
          <X className="h-3 w-3" />
        </Link>
      ))}
      <Link
        href="/articles"
        className="text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
      >
        Clear all
      </Link>
    </div>
  );
}
