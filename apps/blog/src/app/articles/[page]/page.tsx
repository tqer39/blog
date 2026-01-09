import type { Metadata } from 'next';
import { X } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { ArticleCard } from '@/components/ArticleCard';
import { ArticleTagSelector } from '@/components/ArticleTagSelector';
import { JsonLd } from '@/components/JsonLd';
import { Pagination } from '@/components/Pagination';
import { getAllArticles } from '@/lib/articles';
import { generateBreadcrumbJsonLd } from '@/lib/jsonld';
import { ARTICLES_PER_PAGE } from '@/lib/pagination';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

interface ArticlesPageProps {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ tags?: string | string[]; q?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: ArticlesPageProps): Promise<Metadata> {
  const { page: pageParam } = await params;
  const { tags, q } = await searchParams;
  const page = Number.parseInt(pageParam, 10);
  const hasFilters = tags || q;

  if (hasFilters) {
    return {
      title: '検索結果',
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title = page === 1 ? '記事一覧' : `記事一覧 - ページ${page}`;
  const url = `${BASE_URL}/articles/${page}`;

  return {
    title,
    description: `すべての記事を時系列で閲覧できます（ページ${page}）`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | tB`,
      description: `すべての記事を時系列で閲覧できます（ページ${page}）`,
      url,
      type: 'website',
    },
    robots: {
      index: page <= 5,
      follow: true,
    },
  };
}

export async function generateStaticParams() {
  const result = await getAllArticles();
  const articles = result.ok ? result.data : [];
  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);

  return Array.from({ length: totalPages }, (_, i) => ({
    page: String(i + 1),
  }));
}

export default async function ArticlesPage({
  params,
  searchParams,
}: ArticlesPageProps) {
  const { page: pageParam } = await params;
  const { tags, q } = await searchParams;
  const page = Number.parseInt(pageParam, 10);

  if (Number.isNaN(page) || page < 1) {
    notFound();
  }

  const selectedTags = tags ? (Array.isArray(tags) ? tags : [tags]) : [];
  const searchQuery = q?.trim() || '';

  const result = await getAllArticles();
  const allArticles = result.ok ? result.data : [];

  // Extract all unique tags from articles
  const allTags = [
    ...new Set(allArticles.flatMap((article) => article.tags)),
  ].sort();

  // Filter by tags (AND condition) and search query
  const filteredArticles = allArticles.filter((article) => {
    // Tag filter
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => article.tags.includes(tag));

    // Search filter (case-insensitive)
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTags && matchesSearch;
  });

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);

  if (page > totalPages && totalPages > 0) {
    notFound();
  }

  const startIndex = (page - 1) * ARTICLES_PER_PAGE;
  const articles = filteredArticles.slice(
    startIndex,
    startIndex + ARTICLES_PER_PAGE
  );

  // Build clear search URL (preserve tags)
  const clearSearchUrl =
    selectedTags.length > 0
      ? `/articles/${page}?${selectedTags.map((t) => `tags=${encodeURIComponent(t)}`).join('&')}`
      : `/articles/${page}`;

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    [
      { name: 'ホーム', url: '/' },
      { name: '記事一覧', url: '/articles' },
      { name: `ページ${page}` },
    ],
    BASE_URL
  );

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">All Articles</h1>

      {searchQuery && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-stone-100 px-4 py-3 dark:bg-stone-800">
          <span className="text-stone-600 dark:text-stone-400">
            「
            <span className="font-medium text-stone-900 dark:text-stone-100">
              {searchQuery}
            </span>
            」の検索結果
            <span className="ml-2 text-sm">({filteredArticles.length}件)</span>
          </span>
          <Link
            href={clearSearchUrl}
            className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-sm text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-200"
          >
            <X className="h-4 w-4" />
            クリア
          </Link>
        </div>
      )}

      <Suspense fallback={null}>
        <ArticleTagSelector allTags={allTags} />
      </Suspense>

      {articles.length === 0 ? (
        <p className="text-stone-600 dark:text-stone-400">
          {searchQuery
            ? '検索結果が見つかりませんでした。'
            : selectedTags.length > 0
              ? 'No articles match the selected tags.'
              : 'No articles on this page.'}
        </p>
      ) : (
        <>
          <div className="space-y-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          {selectedTags.length === 0 && !searchQuery && (
            <Pagination currentPage={page} totalPages={totalPages} />
          )}
        </>
      )}
      </div>
    </>
  );
}
