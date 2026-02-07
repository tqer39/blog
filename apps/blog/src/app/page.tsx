import { ArticleCard } from '@/components/ArticleCard';
import { JsonLd } from '@/components/JsonLd';
import {
  LatestArticlesHeader,
  ViewAllArticlesLink,
} from '@/components/LatestArticlesHeader';
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
          <LatestArticlesHeader hasArticles={articles.length > 0} />
          {articles.length > 0 && (
            <>
              <div className="space-y-8">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
              <ViewAllArticlesLink />
            </>
          )}
        </section>
      </div>
    </>
  );
}
