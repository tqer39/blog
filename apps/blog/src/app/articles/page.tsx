import { X } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArticleCard } from '@/components/ArticleCard';
import { ArticleCategorySelector } from '@/components/ArticleCategorySelector';
import { ArticleTagSelector } from '@/components/ArticleTagSelector';
import { JsonLd } from '@/components/JsonLd';
import { Pagination } from '@/components/Pagination';
import { getAllArticles } from '@/lib/articles';
import { generateBreadcrumbJsonLd } from '@/lib/jsonld';
import { ARTICLES_PER_PAGE } from '@/lib/pagination';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

interface ArticlesPageProps {
  searchParams: Promise<{ tags?: string | string[]; q?: string; category?: string }>;
}

export async function generateMetadata({
  searchParams,
}: ArticlesPageProps): Promise<Metadata> {
  const { tags, q, category } = await searchParams;
  const hasFilters = tags || q || category;

  if (hasFilters) {
    return {
      title: '検索結果',
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  return {
    title: '記事一覧',
    description: 'すべての記事を時系列で閲覧できます',
    alternates: {
      canonical: `${BASE_URL}/articles`,
    },
    openGraph: {
      title: '記事一覧 | tB',
      description: 'すべての記事を時系列で閲覧できます',
      url: `${BASE_URL}/articles`,
      type: 'website',
    },
  };
}

export default async function ArticlesPage({
  searchParams,
}: ArticlesPageProps) {
  const { tags, q, category } = await searchParams;
  const selectedTags = tags ? (Array.isArray(tags) ? tags : [tags]) : [];
  const searchQuery = q?.trim() || '';
  const selectedCategory = category?.trim() || '';

  const result = await getAllArticles();
  const allArticles = result.ok ? result.data : [];

  // Extract all unique tags from articles
  const allTags = [
    ...new Set(allArticles.flatMap((article) => article.tags)),
  ].sort();

  // Extract all unique categories from articles
  const allCategories = [
    ...new Map(
      allArticles
        .filter((article) => article.category)
        .map((article) => [article.category!.id, article.category!])
    ).values(),
  ].sort((a, b) => a.displayOrder - b.displayOrder);

  // Filter by tags (AND condition), category, and search query
  const filteredArticles = allArticles.filter((article) => {
    // Tag filter
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => article.tags.includes(tag));

    // Category filter
    const matchesCategory =
      !selectedCategory || article.category?.slug === selectedCategory;

    // Search filter (case-insensitive)
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTags && matchesCategory && matchesSearch;
  });

  const articles = filteredArticles.slice(0, ARTICLES_PER_PAGE);
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);

  // Build clear search URL (preserve tags and category)
  const clearSearchParams = [
    ...selectedTags.map((t) => `tags=${encodeURIComponent(t)}`),
    ...(selectedCategory ? [`category=${encodeURIComponent(selectedCategory)}`] : []),
  ];
  const clearSearchUrl =
    clearSearchParams.length > 0
      ? `/articles?${clearSearchParams.join('&')}`
      : '/articles';

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    [{ name: 'ホーム', url: '/' }, { name: '記事一覧' }],
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
              <span className="ml-2 text-sm">
                ({filteredArticles.length}件)
              </span>
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
          <ArticleCategorySelector
            allCategories={allCategories}
            selectedCategory={selectedCategory}
          />
          <ArticleTagSelector allTags={allTags} />
        </Suspense>

        {articles.length === 0 ? (
          <p className="text-stone-600 dark:text-stone-400">
            {searchQuery
              ? '検索結果が見つかりませんでした。'
              : selectedTags.length > 0
                ? 'No articles match the selected tags.'
                : 'No articles yet. Stay tuned!'}
          </p>
        ) : (
          <>
            <div className="space-y-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            {selectedTags.length === 0 && !searchQuery && (
              <Pagination currentPage={1} totalPages={totalPages} />
            )}
          </>
        )}
      </div>
    </>
  );
}
