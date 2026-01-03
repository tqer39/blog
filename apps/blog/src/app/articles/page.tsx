import { Suspense } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { Pagination } from "@/components/Pagination";
import { TagFilter } from "@/components/TagFilter";
import { getAllArticles } from "@/lib/articles";
import { ARTICLES_PER_PAGE } from "@/lib/pagination";

interface ArticlesPageProps {
  searchParams: Promise<{ tags?: string | string[] }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { tags } = await searchParams;
  const selectedTags = tags
    ? Array.isArray(tags)
      ? tags
      : [tags]
    : [];

  const allArticles = await getAllArticles();

  // Filter by tags (AND condition)
  const filteredArticles = selectedTags.length > 0
    ? allArticles.filter((article) =>
        selectedTags.every((tag) => article.tags.includes(tag))
      )
    : allArticles;

  const articles = filteredArticles.slice(0, ARTICLES_PER_PAGE);
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">All Articles</h1>

      <Suspense fallback={null}>
        <TagFilter />
      </Suspense>

      {articles.length === 0 ? (
        <p className="text-stone-600 dark:text-stone-400">
          {selectedTags.length > 0
            ? "No articles match the selected tags."
            : "No articles yet. Stay tuned!"}
        </p>
      ) : (
        <>
          <div className="space-y-8">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
          {selectedTags.length === 0 && (
            <Pagination currentPage={1} totalPages={totalPages} />
          )}
        </>
      )}
    </div>
  );
}
