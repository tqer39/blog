import dayjs from "dayjs";
import Link from "next/link";

import type { Article } from "@/types/article";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const displayDate = article.publishedAt || article.createdAt;

  return (
    <article className="group">
      <Link href={`/article/${article.slug}`} className="block">
        <h2 className="text-xl font-semibold text-stone-900 group-hover:text-blue-600 dark:text-stone-100 dark:group-hover:text-blue-400">
          {article.title}
        </h2>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          {article.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <time
            dateTime={displayDate}
            className="text-sm text-stone-500 dark:text-stone-500"
          >
            {dayjs(displayDate).format("YYYY/MM/DD")}
          </time>
          <div className="flex flex-wrap gap-1">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-stone-200 px-2 py-0.5 text-xs text-stone-600 dark:bg-stone-700 dark:text-stone-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}
