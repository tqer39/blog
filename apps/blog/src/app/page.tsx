import Link from 'next/link';

import { ArticleCard } from '@/components/ArticleCard';
import { JsonLd } from '@/components/JsonLd';
import { getAllArticles } from '@/lib/articles';
import { generateWebSiteJsonLd } from '@/lib/jsonld';
import { getSiteSettings } from '@/lib/siteSettings';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export default async function HomePage() {
  const [result, settings] = await Promise.all([
    getAllArticles(),
    getSiteSettings(),
  ]);
  const articles = result.ok ? result.data.slice(0, 5) : [];

  const websiteJsonLd = generateWebSiteJsonLd(BASE_URL, settings);

  return (
    <>
      <JsonLd data={websiteJsonLd} />
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
                <ArticleCard key={article.id} article={article} />
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
    </>
  );
}
