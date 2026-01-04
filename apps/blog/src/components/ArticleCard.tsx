import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";

import type { Article } from "@/types/article";
import { TagLink } from "./TagLink";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const displayDate = article.publishedAt || article.createdAt;

  return (
    <article className="group border-b border-stone-200 pb-6 dark:border-stone-700">
      <Link href={`/article/${article.hash}`} className="block">
        {article.headerImageUrl && (
          <div className="relative mb-3 aspect-[3/1] max-h-40 w-full overflow-hidden rounded-lg">
            <Image
              src={article.headerImageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized
            />
          </div>
        )}
        <h2 className="text-2xl font-bold text-stone-900 group-hover:text-blue-600 dark:text-stone-100 dark:group-hover:text-blue-400">
          {article.title}
        </h2>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          {article.description}
        </p>
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <time
          dateTime={displayDate}
          className="text-xs text-stone-500 dark:text-stone-500"
        >
          {dayjs(displayDate).format("YYYY/MM/DD")}
        </time>
        <div className="flex flex-wrap gap-1">
          {article.tags.map((tag) => (
            <TagLink key={tag} tag={tag} size="sm" />
          ))}
        </div>
      </div>
    </article>
  );
}
