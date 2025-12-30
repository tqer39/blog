export interface ArticleFrontmatter {
  title: string;
  date: string;
  published: boolean;
  tags: string[];
  description: string;
}

export interface Article extends ArticleFrontmatter {
  slug: string;
  content: string;
}
