'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import type { ReactNode } from 'react';

interface SortButtonProps<T extends string> {
  columnKey: T;
  currentSortKey: T;
  sortDirection: 'asc' | 'desc';
  onSort: (key: T) => void;
  children: ReactNode;
  ariaLabel?: string;
}

export function SortButton<T extends string>({
  columnKey,
  currentSortKey,
  sortDirection,
  onSort,
  children,
  ariaLabel,
}: SortButtonProps<T>) {
  const isActive = currentSortKey === columnKey;

  return (
    <button
      type="button"
      onClick={() => onSort(columnKey)}
      className="inline-flex items-center gap-1 hover:text-primary"
      aria-label={ariaLabel ?? `Sort by ${columnKey}`}
      title={ariaLabel ?? `Sort by ${columnKey}`}
    >
      {children}
      {isActive &&
        (sortDirection === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        ))}
    </button>
  );
}
