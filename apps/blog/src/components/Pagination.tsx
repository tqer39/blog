import Link from 'next/link';

import { getPagination } from '@/lib/pagination';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPagination(currentPage, totalPages);

  return (
    <nav className="mt-8 flex justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={`/articles/${currentPage - 1}`}
          className="rounded px-3 py-2 text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          Previous
        </Link>
      )}

      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-stone-400"
            >
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <Link
            key={pageNum}
            href={`/articles/${pageNum}`}
            className={`rounded px-3 py-2 ${
              isActive
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                : 'text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-700'
            }`}
          >
            {pageNum}
          </Link>
        );
      })}

      {currentPage < totalPages && (
        <Link
          href={`/articles/${currentPage + 1}`}
          className="rounded px-3 py-2 text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
