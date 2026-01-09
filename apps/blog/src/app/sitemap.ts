import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/articles';
import { ARTICLES_PER_PAGE } from '@/lib/pagination';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result = await getAllArticles();
  const articles = result.ok ? result.data : [];

  // Calculate total pages for pagination
  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);

  const articleUrls = articles.map((article) => ({
    url: `${BASE_URL}/article/${article.hash}`,
    lastModified: new Date(article.updatedAt || article.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Generate pagination URLs
  const paginationUrls = Array.from({ length: totalPages }, (_, i) => ({
    url: `${BASE_URL}/articles/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
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
    ...paginationUrls,
    ...articleUrls,
  ];
}
