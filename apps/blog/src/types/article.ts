// Re-export types from shared cms-types package
export type { Article, ArticleStatus } from "@blog/cms-types";

// Legacy type alias for backwards compatibility
// Note: This type is deprecated. Use Article from @blog/cms-types instead.
export interface ArticleFrontmatter {
  title: string;
  date: string;
  published: boolean;
  tags: string[];
  description: string;
}
