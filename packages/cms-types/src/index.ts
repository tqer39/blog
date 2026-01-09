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
  slug: string;
  createdAt: string;
}

export interface TagInput {
  name: string;
  slug?: string;
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
}

export interface ContinuationSuggestion {
  text: string;
  confidence: number;
}

export interface SuggestContinuationResponse {
  suggestions: ContinuationSuggestion[];
}
