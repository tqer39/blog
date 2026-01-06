import type { Article, ArticleListResponse, Tag } from '@blog/cms-types';
import {
  createFetchClient,
  err,
  ok,
  toError,
  type Result,
} from '@blog/utils';

const API_URL = process.env.CMS_API_URL || 'http://localhost:8787/v1';
const API_KEY = process.env.CMS_API_KEY || '';

const fetchApi = createFetchClient({
  baseUrl: API_URL,
  headers: { Authorization: `Bearer ${API_KEY}` },
});

/**
 * Sort articles by date (publishedAt or createdAt) in descending order
 */
function sortArticlesByDate(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => {
    const dateA = a.publishedAt || a.createdAt;
    const dateB = b.publishedAt || b.createdAt;
    return dateA > dateB ? -1 : 1;
  });
}

export async function getAllArticles(): Promise<Result<Article[]>> {
  try {
    const data = await fetchApi<ArticleListResponse>(
      '/articles?status=published&perPage=1000',
      { next: { revalidate: 60 } }
    );
    return ok(sortArticlesByDate(data.articles));
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return err(toError(error));
  }
}

export async function getArticleByHash(
  hash: string
): Promise<Result<Article | null>> {
  try {
    const article = await fetchApi<Article>(`/articles/${hash}`, {
      next: { revalidate: 60 },
    });
    return ok(article);
  } catch (error) {
    // 404 is expected for non-existent articles
    if (error instanceof Error && error.message.includes('404')) {
      return ok(null);
    }
    console.error(`Failed to fetch article ${hash}:`, error);
    return err(toError(error));
  }
}

export async function getAllTags(): Promise<Result<string[]>> {
  try {
    const tags = await fetchApi<Tag[]>('/tags', { next: { revalidate: 60 } });
    return ok(tags.map((t) => t.name).sort());
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return err(toError(error));
  }
}

export async function getArticlesByTag(
  tag: string
): Promise<Result<Article[]>> {
  try {
    const data = await fetchApi<ArticleListResponse>(
      `/articles?status=published&tag=${encodeURIComponent(tag)}&perPage=1000`,
      { next: { revalidate: 60 } }
    );
    return ok(sortArticlesByDate(data.articles));
  } catch (error) {
    console.error(`Failed to fetch articles for tag ${tag}:`, error);
    return err(toError(error));
  }
}
