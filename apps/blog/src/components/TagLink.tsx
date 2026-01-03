'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface TagLinkProps {
  tag: string;
  size?: 'sm' | 'md';
}

export function TagLink({ tag, size = 'sm' }: TagLinkProps) {
  const searchParams = useSearchParams();
  const currentTags = searchParams.getAll('tags');
  const isActive = currentTags.includes(tag);

  // Build new URL with this tag added (if not already present)
  const newParams = new URLSearchParams();
  if (isActive) {
    // Remove this tag (for toggle behavior)
    for (const t of currentTags) {
      if (t !== tag) {
        newParams.append('tags', t);
      }
    }
  } else {
    // Add this tag to existing tags
    for (const t of currentTags) {
      newParams.append('tags', t);
    }
    newParams.append('tags', tag);
  }

  const href = newParams.toString() ? `/articles?${newParams.toString()}` : '/articles';

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2 py-1 text-sm';

  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      className={`rounded transition-colors ${sizeClasses} ${
        isActive
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-stone-200 text-stone-600 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600'
      }`}
    >
      {tag}
    </Link>
  );
}
