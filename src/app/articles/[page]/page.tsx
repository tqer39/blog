import { notFound } from 'next/navigation';

import { ArticleCard } from '@/components/ArticleCard';
import { Pagination } from '@/components/Pagination';
import { getAllArticles } from '@/lib/articles';
import { ARTICLES_PER_PAGE } from '@/lib/pagination';

interface ArticlesPageProps {
  params: { page: string };
}

export function generateStaticParams() {
  const articles = getAllArticles();
  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);

  return Array.from({ length: totalPages }, (_, i) => ({
    page: String(i + 1),
  }));
}

export default function ArticlesPage({ params }: ArticlesPageProps) {
  const page = parseInt(params.page, 10);

  if (isNaN(page) || page < 1) {
    notFound();
  }

  const allArticles = getAllArticles();
  const totalPages = Math.ceil(allArticles.length / ARTICLES_PER_PAGE);

  if (page > totalPages && totalPages > 0) {
    notFound();
  }

  const startIndex = (page - 1) * ARTICLES_PER_PAGE;
  const articles = allArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">All Articles</h1>
      {articles.length === 0 ? (
        <p className="text-stone-600 dark:text-stone-400">
          No articles on this page.
        </p>
      ) : (
        <>
          <div className="space-y-8">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
