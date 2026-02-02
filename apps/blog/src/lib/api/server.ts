import type {
  ApiKeyStatus,
  Article,
  ArticleInput,
  ArticleListResponse,
  Category,
  CategoryInput,
  CategoryListResponse,
  GenerateApiKeyResponse,
  GenerateImageRequest,
  GenerateImageResponse,
  GenerateOutlineRequest,
  GenerateOutlineResponse,
  ImageListResponse,
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
  TransformTextRequest,
  TransformTextResponse,
} from '@blog/cms-types';
import { DEFAULT_API_URL } from '@blog/config';
import { createFetchClient } from '@blog/utils';

const API_URL = process.env.CMS_API_URL || DEFAULT_API_URL;
const API_KEY = process.env.CMS_API_KEY || 'dev-api-key';

const fetchApi = createFetchClient({
  baseUrl: API_URL,
  headers: { Authorization: `Bearer ${API_KEY}` },
});

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

export async function getTag(id: string): Promise<Tag> {
  return fetchApi(`/tags/${id}`);
}

export async function createTag(input: TagInput): Promise<Tag> {
  return fetchApi('/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function updateTag(id: string, input: TagInput): Promise<Tag> {
  return fetchApi(`/tags/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
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
  return fetchApi('/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<Category> {
  return fetchApi(`/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await fetchApi(`/categories/${id}`, { method: 'DELETE' });
}

export async function updateCategoriesOrder(
  orderedIds: string[]
): Promise<void> {
  await fetchApi('/categories/reorder', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds }),
  });
}

// Images
export async function getImages(params?: {
  page?: number;
  perPage?: number;
}): Promise<ImageListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.perPage) searchParams.set('perPage', String(params.perPage));

  const query = searchParams.toString();
  return fetchApi(`/images${query ? `?${query}` : ''}`);
}

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

export type { ImageModel } from '@blog/cms-types';

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

export async function suggestContinuation(
  request: SuggestContinuationRequest
): Promise<SuggestContinuationResponse> {
  return fetchApi('/ai/suggest-continuation', {
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

// API Key Management
export async function getApiKeyStatus(): Promise<ApiKeyStatus> {
  return fetchApi('/api-key/status');
}

export async function generateApiKey(): Promise<GenerateApiKeyResponse> {
  return fetchApi('/api-key/generate', { method: 'POST' });
}

export async function disableApiKey(): Promise<{ success: boolean }> {
  return fetchApi('/api-key/disable', { method: 'POST' });
}

export async function enableApiKey(): Promise<{ success: boolean }> {
  return fetchApi('/api-key/enable', { method: 'POST' });
}
