import type { Article } from '@blog/cms-types';

// JSON-LD Types
interface JsonLdPerson {
  '@type': 'Person';
  name: string;
  url?: string;
}

interface JsonLdOrganization {
  '@type': 'Organization';
  name: string;
  logo?: {
    '@type': 'ImageObject';
    url: string;
  };
}

interface JsonLdArticle {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author: JsonLdPerson;
  publisher: JsonLdOrganization;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
}

interface JsonLdBreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

interface JsonLdBreadcrumbList {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: JsonLdBreadcrumbItem[];
}

interface JsonLdWebSite {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
}

// Constants
const SITE_NAME = 'tB';
const SITE_DESCRIPTION = '未来の自分に向けた技術ログ';
const AUTHOR_NAME = 'tqer39';

/**
 * Generate Article JSON-LD for article pages
 */
export function generateArticleJsonLd(
  article: Article,
  baseUrl: string
): JsonLdArticle {
  const articleUrl = `${baseUrl}/article/${article.hash}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description || undefined,
    image: article.headerImageUrl || undefined,
    datePublished: article.publishedAt || undefined,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

/**
 * Generate BreadcrumbList JSON-LD for navigation
 */
export function generateBreadcrumbJsonLd(
  items: BreadcrumbItem[],
  baseUrl: string
): JsonLdBreadcrumbList {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.name,
      item: item.url ? `${baseUrl}${item.url}` : undefined,
    })),
  };
}

/**
 * Generate WebSite JSON-LD for homepage
 */
export function generateWebSiteJsonLd(baseUrl: string): JsonLdWebSite {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: baseUrl,
    description: SITE_DESCRIPTION,
  };
}
