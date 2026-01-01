// Article types
export type ArticleStatus = "draft" | "published";

export interface Article {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface ArticleInput {
  slug: string;
  title: string;
  description?: string;
  content: string;
  status?: ArticleStatus;
  tags?: string[];
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
