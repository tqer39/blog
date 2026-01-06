import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/articles';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result = await getAllArticles();
  const articles = result.ok ? result.data : [];

  const articleUrls = articles.map((article) => ({
    url: `${BASE_URL}/article/${article.hash}`,
    lastModified: new Date(article.updatedAt || article.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...articleUrls,
  ];
}
