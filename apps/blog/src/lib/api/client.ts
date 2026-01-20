import type {
  Article,
  ArticleCategory,
  ArticleInput,
  ArticleListResponse,
  Category,
  CategoryInput,
  CategoryListResponse,
  ContinuationLength,
  GenerateImageRequest,
  GenerateImageResponse,
  GenerateMetadataRequest,
  GenerateMetadataResponse,
  GenerateOutlineRequest,
  GenerateOutlineResponse,
  ImageModel,
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
  ImageModel,
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
      const existingHeaders =
        (options?.headers as Record<string, string>) || {};
      options = {
        ...options,
        headers: {
          ...existingHeaders,
          'X-CSRF-Token': csrfToken,
        },
      };
    }
  }

  return baseFetchApi(path, options);
}

// ==============================
// JSON Request Helpers
// ==============================

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * POST request with JSON body
 */
function postJson<T>(path: string, data: unknown): Promise<T> {
  return fetchApi(path, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
}

/**
 * PUT request with JSON body
 */
function putJson<T>(path: string, data: unknown): Promise<T> {
  return fetchApi(path, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request with JSON body
 */
function patchJson<T>(path: string, data: unknown): Promise<T> {
  return fetchApi(path, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
}

// Articles
export async function getArticles(params?: {
  status?: string;
  tag?: string;
  category?: string;
  page?: number;
  perPage?: number;
}): Promise<ArticleListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.perPage) searchParams.set('perPage', String(params.perPage));

  const query = searchParams.toString();
  return fetchApi(`/articles${query ? `?${query}` : ''}`);
}

export async function getArticle(hash: string): Promise<Article> {
  return fetchApi(`/articles/${hash}`);
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  return postJson('/articles', input);
}

export async function updateArticle(
  hash: string,
  input: Partial<ArticleInput>
): Promise<Article> {
  return putJson(`/articles/${hash}`, input);
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

export async function getTag(id: string): Promise<Tag> {
  return fetchApi(`/tags/${id}`);
}

export async function createTag(input: TagInput): Promise<Tag> {
  return postJson('/tags', input);
}

export async function updateTag(id: string, input: TagInput): Promise<Tag> {
  return putJson(`/tags/${id}`, input);
}

export async function deleteTag(id: string): Promise<void> {
  await fetchApi(`/tags/${id}`, { method: 'DELETE' });
}

// Categories
export async function getCategories(): Promise<CategoryListResponse> {
  return fetchApi('/categories');
}

export async function getCategory(id: string): Promise<Category> {
  return fetchApi(`/categories/${id}`);
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  return postJson('/categories', input);
}

export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<Category> {
  return putJson(`/categories/${id}`, input);
}

export async function deleteCategory(id: string): Promise<void> {
  await fetchApi(`/categories/${id}`, { method: 'DELETE' });
}

export async function updateCategoriesOrder(
  orderedIds: string[]
): Promise<void> {
  await patchJson('/categories/reorder', { orderedIds });
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
  return postJson('/ai/generate-metadata', request);
}

export async function generateImage(
  request: GenerateImageRequest
): Promise<GenerateImageResponse> {
  return postJson('/ai/generate-image', request);
}

export async function reviewArticle(
  request: ReviewArticleRequest
): Promise<ReviewArticleResponse> {
  return postJson('/ai/review-article', request);
}

export async function suggestContinuation(
  request: SuggestContinuationRequest
): Promise<SuggestContinuationResponse> {
  return postJson('/ai/suggest-continuation', request);
}

export async function generateOutline(
  request: GenerateOutlineRequest
): Promise<GenerateOutlineResponse> {
  return postJson('/ai/generate-outline', request);
}

export async function transformText(
  request: TransformTextRequest
): Promise<TransformTextResponse> {
  return postJson('/ai/transform-text', request);
}

// Settings
export async function getSiteSettings(): Promise<SiteSettingsResponse> {
  return fetchApi('/settings');
}

export async function updateSiteSettings(
  input: SiteSettingsInput
): Promise<SiteSettingsResponse> {
  return putJson('/settings', input);
}
