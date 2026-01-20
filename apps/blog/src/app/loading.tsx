import { Skeleton } from "@blog/ui";
import { ArticleCardSkeleton } from "@/components/ArticleCardSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <section>
        {/* Page Title Skeleton */}
        <Skeleton className="mb-8 h-9 w-48" />

        {/* Article Cards Skeleton List */}
        <div className="space-y-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
