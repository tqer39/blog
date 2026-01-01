import { ArticleCard } from "@/components/ArticleCard";
import { Pagination } from "@/components/Pagination";
import { getAllArticles } from "@/lib/articles";
import { ARTICLES_PER_PAGE } from "@/lib/pagination";

export default async function ArticlesPage() {
  const allArticles = await getAllArticles();
  const articles = allArticles.slice(0, ARTICLES_PER_PAGE);
  const totalPages = Math.ceil(allArticles.length / ARTICLES_PER_PAGE);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">All Articles</h1>
      {articles.length === 0 ? (
        <p className="text-stone-600 dark:text-stone-400">
          No articles yet. Stay tuned!
        </p>
      ) : (
        <>
          <div className="space-y-8">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
          <Pagination currentPage={1} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
