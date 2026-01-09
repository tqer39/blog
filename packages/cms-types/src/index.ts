// Error types
export * from './error';

// Article types
export type ArticleStatus = 'draft' | 'published';

export interface Article {
  id: string;
  hash: string;
  title: string;
  description: string | null;
  content: string;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  headerImageId: string | null;
  headerImageUrl: string | null;
  reviewResult?: ReviewArticleResponse | null;
  reviewUpdatedAt?: string | null;
}

export interface ArticleInput {
  title: string;
  description?: string;
  content: string;
  status?: ArticleStatus;
  tags?: string[];
  headerImageId?: string | null;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  perPage: number;
}

// Tag types
export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface TagInput {
  name: string;
}

export interface TagWithCount extends Tag {
  articleCount: number;
}

export interface TagListResponse {
  tags: TagWithCount[];
}

// Image types
export interface Image {
  id: string;
  articleId: string | null;
  filename: string;
  originalFilename: string;
  r2Key: string;
  mimeType: string;
  sizeBytes: number;
  altText: string | null;
  createdAt: string;
  url: string;
}

export interface ImageUploadResponse {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface ArticleFilters extends PaginationParams {
  status?: ArticleStatus;
  tag?: string;
}

// AI Model types (defined first as they're used in request types)
export type OpenAIModel =
  | 'gpt-4o-mini'
  | 'gpt-4o'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo';

export type AnthropicModel =
  | 'claude-sonnet-4-20250514'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-opus-20240229'
  | 'claude-3-haiku-20240307';

export type GeminiImageModel =
  | 'gemini-2.5-flash-image'
  | 'gemini-3-pro-image-preview';

// AI Model Settings
export interface AIModelSettings {
  metadata: OpenAIModel;
  review: AnthropicModel;
  outline: AnthropicModel;
  transform: AnthropicModel;
  continuation: AnthropicModel;
  image: GeminiImageModel;
}

export const DEFAULT_AI_MODEL_SETTINGS: AIModelSettings = {
  metadata: 'gpt-4o-mini',
  review: 'claude-sonnet-4-20250514',
  outline: 'claude-sonnet-4-20250514',
  transform: 'claude-sonnet-4-20250514',
  continuation: 'claude-sonnet-4-20250514',
  image: 'gemini-2.5-flash-image',
};

// AI Review types
export type ReviewCategory =
  | 'clarity'
  | 'structure'
  | 'accuracy'
  | 'grammar'
  | 'style';
export type ReviewSeverity = 'info' | 'warning' | 'error';

export interface ReviewItem {
  category: ReviewCategory;
  severity: ReviewSeverity;
  location?: string;
  issue: string;
  suggestion: string;
}

export interface ReviewArticleRequest {
  title: string;
  content: string;
  model?: AnthropicModel;
  articleHash?: string;
}

export interface ReviewArticleResponse {
  summary: string;
  overallScore: number;
  items: ReviewItem[];
}

// AI Continuation types
export type ContinuationLength = 'short' | 'medium' | 'long';

export interface SuggestContinuationRequest {
  title: string;
  content: string;
  cursorPosition: number;
  length?: ContinuationLength;
  model?: AnthropicModel;
}

export interface ContinuationSuggestion {
  text: string;
  confidence: number;
}

export interface SuggestContinuationResponse {
  suggestions: ContinuationSuggestion[];
}

// AI Outline types
export type ArticleCategory = 'tech' | 'life' | 'books';

export interface GenerateOutlineRequest {
  title: string;
  category?: ArticleCategory;
  model?: AnthropicModel;
}

export interface GenerateOutlineResponse {
  outline: string;
}

// AI Text Transform types
export type TransformAction =
  | 'rewrite'
  | 'expand'
  | 'summarize'
  | 'translate'
  | 'formal'
  | 'casual';

export type TransformLanguage = 'ja' | 'en';

export interface TransformTextRequest {
  text: string;
  action: TransformAction;
  targetLanguage?: TransformLanguage;
  model?: AnthropicModel;
}

export interface TransformTextResponse {
  result: string;
}

// AI Metadata types
export interface GenerateMetadataRequest {
  title: string;
  content: string;
  existingTags?: string[];
  model?: OpenAIModel;
}

export interface GenerateMetadataResponse {
  description: string;
  tags: string[];
}

// AI Image types
export interface GenerateImageRequest {
  prompt: string;
  title?: string;
  model?: GeminiImageModel;
}

export interface GenerateImageResponse {
  id: string;
  url: string;
}

// Site Settings types
export interface SiteSettings {
  site_name: string;
  site_description: string;
  author_name: string;
  footer_text: string;
  social_github: string;
  social_twitter: string;
  social_bento: string;
}

export interface SiteSettingsResponse {
  settings: SiteSettings;
  updatedAt: string | null;
}

export type SiteSettingsInput = Partial<SiteSettings>;
