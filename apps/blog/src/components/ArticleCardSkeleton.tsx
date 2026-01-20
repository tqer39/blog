import { Skeleton } from '@blog/ui';

export function ArticleCardSkeleton() {
  return (
    <div className="border-b border-stone-200 pb-6 dark:border-stone-700">
      {/* Header Image Skeleton */}
      <div className="mb-3 aspect-[3/1] max-h-40 w-full overflow-hidden rounded-lg">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Title & Description Skeleton */}
      <div className="space-y-3">
        {/* Title */}
        <Skeleton className="h-8 w-3/4" />

        {/* Description (2 lines) */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      {/* Meta Info Skeleton (Date, Category, Tags) */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {/* Date */}
        <Skeleton className="h-4 w-24" />

        {/* Category Badge */}
        <Skeleton className="h-5 w-20 rounded-full" />

        {/* Tags */}
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}
