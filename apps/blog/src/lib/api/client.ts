import type {
  Article,
  ArticleCategory,
  ArticleInput,
  ArticleListResponse,
  ContinuationLength,
  GeminiImageModel,
  GenerateImageRequest,
  GenerateImageResponse,
  GenerateMetadataRequest,
  GenerateMetadataResponse,
  GenerateOutlineRequest,
  GenerateOutlineResponse,
  ImageUploadResponse,
  ReviewArticleRequest,
  ReviewArticleResponse,
  SiteSettingsInput,
  SiteSettingsResponse,
  SuggestContinuationRequest,
  SuggestContinuationResponse,
  Tag,
  TagInput,
  TagListResponse,
  TransformAction,
  TransformTextRequest,
  TransformTextResponse,
} from '@blog/cms-types';

export type {
  ArticleCategory,
  ContinuationLength,
  GeminiImageModel as ImageModel,
  TransformAction,
};

import { createFetchClient } from '@blog/utils';

const baseFetchApi = createFetchClient({ baseUrl: '/api' });

/**
 * Get CSRF token from cookie
 */
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Fetch API wrapper that automatically adds CSRF token for mutating requests
 */
async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method?.toUpperCase() || 'GET';
  const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

  if (isMutating) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      const headers = new Headers(options?.headers);
      headers.set('X-CSRF-Token', csrfToken);
      options = { ...options, headers };
    }
  }

  return baseFetchApi(path, options);
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
  file: File,
  articleId?: string,
  altText?: string
): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (articleId) formData.append('articleId', articleId);
  if (altText) formData.append('altText', altText);

  return fetchApi('/images', {
    method: 'POST',
    body: formData,
  });
}

export async function deleteImage(id: string): Promise<void> {
  await fetchApi(`/images/${id}`, { method: 'DELETE' });
}

// AI
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

export async function reviewArticle(
  request: ReviewArticleRequest
): Promise<ReviewArticleResponse> {
  return fetchApi('/ai/review-article', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

export async function suggestContinuation(
  request: SuggestContinuationRequest
): Promise<SuggestContinuationResponse> {
  return fetchApi('/ai/suggest-continuation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

export async function generateOutline(
  request: GenerateOutlineRequest
): Promise<GenerateOutlineResponse> {
  return fetchApi('/ai/generate-outline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

export async function transformText(
  request: TransformTextRequest
): Promise<TransformTextResponse> {
  return fetchApi('/ai/transform-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

// Settings
export async function getSiteSettings(): Promise<SiteSettingsResponse> {
  return fetchApi('/settings');
}

export async function updateSiteSettings(
  input: SiteSettingsInput
): Promise<SiteSettingsResponse> {
  return fetchApi('/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}
