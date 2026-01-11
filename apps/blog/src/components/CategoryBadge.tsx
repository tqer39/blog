import type { Category } from '@blog/cms-types';
import Link from 'next/link';

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  return (
    <Link
      href={`/articles?category=${category.slug}`}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 ${className}`}
      style={{
        backgroundColor: `${category.color}20`,
        color: category.color,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: category.color }}
        aria-hidden="true"
      />
      {category.name}
    </Link>
  );
}
