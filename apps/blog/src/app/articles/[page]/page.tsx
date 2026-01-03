import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleCard } from "@/components/ArticleCard";
import { ArticleTagSelector } from "@/components/ArticleTagSelector";
import { Pagination } from "@/components/Pagination";
import { getAllArticles } from "@/lib/articles";
import { ARTICLES_PER_PAGE } from "@/lib/pagination";

interface ArticlesPageProps {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ tags?: string | string[] }>;
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);

  return Array.from({ length: totalPages }, (_, i) => ({
    page: String(i + 1),
  }));
}

export default async function ArticlesPage({ params, searchParams }: ArticlesPageProps) {
  const { page: pageParam } = await params;
  const { tags } = await searchParams;
  const page = Number.parseInt(pageParam, 10);

  if (Number.isNaN(page) || page < 1) {
    notFound();
  }

  const selectedTags = tags
    ? Array.isArray(tags)
      ? tags
      : [tags]
    : [];

  const allArticles = await getAllArticles();

  // Extract all unique tags from articles
  const allTags = [...new Set(allArticles.flatMap((article) => article.tags))].sort();

  // Filter by tags (AND condition)
  const filteredArticles = selectedTags.length > 0
    ? allArticles.filter((article) =>
        selectedTags.every((tag) => article.tags.includes(tag))
      )
    : allArticles;

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);

  if (page > totalPages && totalPages > 0) {
    notFound();
  }

  const startIndex = (page - 1) * ARTICLES_PER_PAGE;
  const articles = filteredArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">All Articles</h1>

      <Suspense fallback={null}>
        <ArticleTagSelector allTags={allTags} />
      </Suspense>

      {articles.length === 0 ? (
        <p className="text-stone-600 dark:text-stone-400">
          {selectedTags.length > 0
            ? "No articles match the selected tags."
            : "No articles on this page."}
        </p>
      ) : (
        <>
          <div className="space-y-8">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
          {selectedTags.length === 0 && (
            <Pagination currentPage={page} totalPages={totalPages} />
          )}
        </>
      )}
    </div>
  );
}
