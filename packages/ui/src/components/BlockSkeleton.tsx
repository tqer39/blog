'use client';

import { cn } from '@blog/utils';

import { Skeleton } from './ui/skeleton';

interface BlockSkeletonProps {
  className?: string;
  lineCount?: number;
  filename?: string;
}

export function BlockSkeleton({
  className,
  lineCount = 8,
  filename,
}: BlockSkeletonProps) {
  const lineWidths = [85, 70, 90, 60, 75, 80, 65, 95];

  return (
    <div
      className={cn(
        'group relative my-2 overflow-hidden rounded-lg ring-1 ring-stone-300 dark:ring-[#333]',
        className
      )}
    >
      {filename && (
        <div className="component-header flex items-center justify-between px-4 py-2 text-sm shadow-none">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <span>{filename}</span>
          </div>
        </div>
      )}
      <div className="overflow-x-auto bg-stone-100 p-4 dark:bg-stone-800 border-0 shadow-none ring-0">
        <div className="space-y-2">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-4 shrink-0" />
              <Skeleton
                className="h-4"
                style={{ width: `${lineWidths[i % lineWidths.length]}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
