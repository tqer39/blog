import type { Article, ArticleListResponse, Tag } from '@blog/cms-types';

const API_URL = process.env.CMS_API_URL || 'http://localhost:8787/v1';
const API_KEY = process.env.CMS_API_KEY || '';

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  return response.json();
}

export async function getAllArticles(): Promise<Article[]> {
  try {
    const data = await fetchApi<ArticleListResponse>(
      '/articles?status=published&perPage=1000'
    );
    // Sort by publishedAt descending
    return data.articles.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return dateA > dateB ? -1 : 1;
    });
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
}

export async function getArticleByHash(hash: string): Promise<Article | null> {
  try {
    return await fetchApi<Article>(`/articles/${hash}`);
  } catch (error) {
    console.error(`Failed to fetch article ${hash}:`, error);
    return null;
  }
}

export async function getAllTags(): Promise<string[]> {
  try {
    const tags = await fetchApi<Tag[]>('/tags');
    return tags.map((t) => t.name).sort();
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return [];
  }
}

export async function getArticlesByTag(tag: string): Promise<Article[]> {
  try {
    const data = await fetchApi<ArticleListResponse>(
      `/articles?status=published&tag=${encodeURIComponent(tag)}&perPage=1000`
    );
    return data.articles.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return dateA > dateB ? -1 : 1;
    });
  } catch (error) {
    console.error(`Failed to fetch articles for tag ${tag}:`, error);
    return [];
  }
}
