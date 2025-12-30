import Link from 'next/link';

import { ArticleCard } from '@/components/ArticleCard';
import { getAllArticles } from '@/lib/articles';

export default function HomePage() {
  const articles = getAllArticles().slice(0, 5);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <section>
        <h1 className="mb-8 text-3xl font-bold">Latest Articles</h1>
        {articles.length === 0 ? (
          <p className="text-stone-600 dark:text-stone-400">
            No articles yet. Stay tuned!
          </p>
        ) : (
          <div className="space-y-8">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
        {articles.length > 0 && (
          <div className="mt-8">
            <Link
              href="/articles"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              View all articles
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
