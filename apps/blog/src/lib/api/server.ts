import type {
  Article,
  ArticleInput,
  ArticleListResponse,
  ImageUploadResponse,
  Tag,
  TagInput,
  TagListResponse,
} from '@blog/cms-types';

const API_URL = process.env.CMS_API_URL || 'http://localhost:8787/v1';
const API_KEY = process.env.CMS_API_KEY || 'dev-api-key';

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Articles
export async function getArticles(params?: {
  status?: string;
  tag?: string;
  page?: number;
  perPage?: number;
}): Promise<ArticleListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.perPage) searchParams.set('perPage', String(params.perPage));

  const query = searchParams.toString();
  return fetchApi(`/articles${query ? `?${query}` : ''}`);
}

export async function getArticle(hash: string): Promise<Article> {
  return fetchApi(`/articles/${hash}`);
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  return fetchApi('/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function updateArticle(
  hash: string,
  input: Partial<ArticleInput>
): Promise<Article> {
  return fetchApi(`/articles/${hash}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function deleteArticle(hash: string): Promise<void> {
  await fetchApi(`/articles/${hash}`, { method: 'DELETE' });
}

export async function publishArticle(hash: string): Promise<Article> {
  return fetchApi(`/articles/${hash}/publish`, { method: 'POST' });
}

export async function unpublishArticle(hash: string): Promise<Article> {
  return fetchApi(`/articles/${hash}/unpublish`, { method: 'POST' });
}

// Tags
export async function getTags(): Promise<TagListResponse> {
  return fetchApi('/tags');
}

export async function getTag(slug: string): Promise<Tag> {
  return fetchApi(`/tags/${slug}`);
}

export async function createTag(input: TagInput): Promise<Tag> {
  return fetchApi('/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function updateTag(slug: string, input: TagInput): Promise<Tag> {
  return fetchApi(`/tags/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function deleteTag(slug: string): Promise<void> {
  await fetchApi(`/tags/${slug}`, { method: 'DELETE' });
}

// Images
export async function uploadImage(
  formData: FormData
): Promise<ImageUploadResponse> {
  return fetchApi('/images', {
    method: 'POST',
    body: formData,
  });
}

export async function deleteImage(id: string): Promise<void> {
  await fetchApi(`/images/${id}`, { method: 'DELETE' });
}

// AI
export interface GenerateMetadataRequest {
  title: string;
  content: string;
  existingTags?: string[];
}

export interface GenerateMetadataResponse {
  description: string;
  tags: string[];
}

export interface GenerateImageRequest {
  prompt: string;
  title?: string;
}

export interface GenerateImageResponse {
  id: string;
  url: string;
}

export async function generateMetadata(
  request: GenerateMetadataRequest
): Promise<GenerateMetadataResponse> {
  return fetchApi('/ai/generate-metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

export async function generateImage(
  request: GenerateImageRequest
): Promise<GenerateImageResponse> {
  return fetchApi('/ai/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}
