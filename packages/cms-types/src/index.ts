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
  categoryId: string | null;
  category: Category | null;
  headerImageId: string | null;
  headerImageUrl: string | null;
  slideMode: boolean;
  slideDuration: number | null;
  reviewResult?: ReviewArticleResponse | null;
  reviewUpdatedAt?: string | null;
}

export interface ArticleInput {
  title: string;
  description?: string;
  content: string;
  status?: ArticleStatus;
  tags?: string[];
  categoryId?: string | null;
  headerImageId?: string | null;
  slideMode?: boolean;
  slideDuration?: number | null;
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

export interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface TagListResponse {
  tags: TagWithCount[];
  pagination: PaginationInfo;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  displayOrder: number;
  createdAt: string;
}

export interface CategoryInput {
  name: string;
  slug: string;
  color?: string;
  displayOrder?: number;
}

export interface CategoryWithCount extends Category {
  articleCount: number;
}

export interface CategoryListResponse {
  categories: CategoryWithCount[];
  pagination: PaginationInfo;
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

export interface ImageListResponse {
  images: Image[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
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
  category?: string;
}

// AI Model types (defined first as they're used in request types)
export type OpenAIModel =
  | 'gpt-4o-mini'
  | 'gpt-4o'
  | 'gpt-4.1-2025-04-14'
  | 'gpt-4.1-mini-2025-04-14';

export type AnthropicModel =
  | 'claude-sonnet-4-20250514'
  | 'claude-sonnet-4-5-20250929'
  | 'claude-opus-4-5-20251101'
  | 'claude-haiku-4-5-20251001';

export type GeminiImageModel =
  | 'gemini-2.5-flash-image'
  | 'gemini-3-pro-image-preview';

export type GeminiTextModel =
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro'
  | 'gemini-3-flash-preview';

export type OpenAIImageModel = 'dall-e-3' | 'dall-e-2';

export type ImageModel = GeminiImageModel | OpenAIImageModel;

export type ImageProvider = 'gemini' | 'openai';

// Unified text model type for multi-provider support
export type TextModel = OpenAIModel | AnthropicModel | GeminiTextModel;
export type TextProvider = 'openai' | 'anthropic' | 'gemini';

// AI Model Settings
export interface AIModelSettings {
  metadata: TextModel;
  review: TextModel;
  outline: TextModel;
  transform: TextModel;
  continuation: TextModel;
  image: ImageModel;
}

export const DEFAULT_AI_MODEL_SETTINGS: AIModelSettings = {
  metadata: 'gpt-4o-mini',
  review: 'claude-sonnet-4-5-20250929',
  outline: 'claude-sonnet-4-5-20250929',
  transform: 'claude-sonnet-4-5-20250929',
  continuation: 'claude-sonnet-4-5-20250929',
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
  model?: TextModel;
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
  model?: TextModel;
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
  model?: TextModel;
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
  model?: TextModel;
}

export interface TransformTextResponse {
  result: string;
}

// AI Metadata types
export interface GenerateMetadataRequest {
  title: string;
  content: string;
  existingTags?: string[];
  model?: TextModel;
}

export interface GenerateMetadataResponse {
  description: string;
  tags: string[];
}

// AI Image types
export interface GenerateImageRequest {
  prompt: string;
  title?: string;
  model?: ImageModel;
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
  social_bluesky: string;
  social_threads: string;
  social_linkedin: string;
  social_wantedly: string;
  social_lapras: string;
  social_devto: string; // https://dev.to/[username]
  social_hackernews: string; // https://news.ycombinator.com/user?id=[username]
  social_hatena: string; // https://[username].hatenablog.com/
  social_medium: string; // https://medium.com/@[username]
  social_note: string; // https://note.com/[username]
  social_qiita: string; // https://qiita.com/[username]
  social_reddit: string; // https://www.reddit.com/user/[username]
  social_techfeed: string; // https://techfeed.io/people/@[username]
  social_zenn: string; // https://zenn.dev/[username]
  show_rss_link: string; // "true" or "false" (stored as text in DB)
  show_github_link: string; // "true" or "false" (stored as text in DB)
  show_twitter_link: string; // "true" or "false" (stored as text in DB)
  show_bento_link: string; // "true" or "false" (stored as text in DB)
  show_bluesky_link: string; // "true" or "false" (stored as text in DB)
  show_threads_link: string; // "true" or "false" (stored as text in DB)
  show_linkedin_link: string; // "true" or "false" (stored as text in DB)
  show_wantedly_link: string; // "true" or "false" (stored as text in DB)
  show_lapras_link: string; // "true" or "false" (stored as text in DB)
  show_devto_link: string; // "true" or "false" (stored as text in DB)
  show_hackernews_link: string; // "true" or "false" (stored as text in DB)
  show_hatena_link: string; // "true" or "false" (stored as text in DB)
  show_medium_link: string; // "true" or "false" (stored as text in DB)
  show_note_link: string; // "true" or "false" (stored as text in DB)
  show_qiita_link: string; // "true" or "false" (stored as text in DB)
  show_reddit_link: string; // "true" or "false" (stored as text in DB)
  show_techfeed_link: string; // "true" or "false" (stored as text in DB)
  show_zenn_link: string; // "true" or "false" (stored as text in DB)
  default_theme: string; // "system" | "light" | "dark" | "tokyonight" | "nord-light" | "autumn"
  default_locale: string; // "auto" | "ja" | "en"
  // AI API Keys (masked in GET response)
  ai_openai_api_key: string; // OpenAI API key for metadata generation, DALL-E images
  ai_anthropic_api_key: string; // Anthropic API key for review, outline, transform, continuation
  ai_gemini_api_key: string; // Gemini API key for image generation
}

export interface SiteSettingsResponse {
  settings: SiteSettings;
  updatedAt: string | null;
}

export type SiteSettingsInput = Partial<SiteSettings>;

// API Key Management types
export interface ApiKeyStatus {
  hasKey: boolean;
  enabled: boolean;
  createdAt: string | null;
}

export interface GenerateApiKeyResponse {
  key: string;
  createdAt: string;
}

// AI Tools Status types
export interface AIToolsStatus {
  hasAnyKey: boolean;
  hasOpenAI: boolean;
  hasAnthropic: boolean;
  hasGemini: boolean;
}

// AI API Key Test types
export type AIProvider = 'openai' | 'anthropic' | 'gemini';

export interface TestAIKeyRequest {
  provider: AIProvider;
  apiKey?: string; // Optional: test this key instead of the saved one
}

export interface TestAIKeyResponse {
  success: boolean;
  provider: AIProvider;
  message?: string;
}
