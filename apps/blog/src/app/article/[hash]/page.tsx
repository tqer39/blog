import dayjs from 'dayjs';
import { Clock } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { ArticleContent } from '@/components/ArticleContent';
import { ArticleNavigation } from '@/components/ArticleNavigation';
import { JsonLd } from '@/components/JsonLd';
import { TableOfContents } from '@/components/TableOfContents';
import { TagLink } from '@/components/TagLink';
import { getAllArticles, getArticleByHash } from '@/lib/articles';
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
} from '@/lib/jsonld';
import { calculateReadingTime } from '@/lib/readingTime';

interface ArticlePageProps {
  params: Promise<{ hash: string }>;
}

export async function generateStaticParams() {
  const result = await getAllArticles();
  const articles = result.ok ? result.data : [];
  return articles.map((article) => ({
    hash: article.hash,
  }));
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { hash } = await params;
  const result = await getArticleByHash(hash);

  if (!result.ok || !result.data) {
    return { title: 'Article not found' };
  }

  const article = result.data;

  const description = article.description || article.title;
  const url = `${BASE_URL}/article/${hash}`;

  const ogImages = article.headerImageUrl
    ? [
        {
          url: article.headerImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ]
    : undefined;

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      url,
      siteName: "tqer39's blog",
      type: 'article',
      publishedTime: article.publishedAt || undefined,
      modifiedTime: article.updatedAt,
      authors: ['tqer39'],
      tags: article.tags,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: article.headerImageUrl ? [article.headerImageUrl] : undefined,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { hash } = await params;
  const [articleResult, allArticlesResult] = await Promise.all([
    getArticleByHash(hash),
    getAllArticles(),
  ]);

  if (!articleResult.ok || !articleResult.data) {
    notFound();
  }

  const article = articleResult.data;
  const allArticles = allArticlesResult.ok ? allArticlesResult.data : [];

  // Find current article index and get prev/next articles
  // Articles are sorted by publishedAt descending (newest first)
  const currentIndex = allArticles.findIndex((a) => a.hash === hash);
  const prevArticle =
    currentIndex < allArticles.length - 1
      ? {
          hash: allArticles[currentIndex + 1].hash,
          title: allArticles[currentIndex + 1].title,
        }
      : null;
  const nextArticle =
    currentIndex > 0
      ? {
          hash: allArticles[currentIndex - 1].hash,
          title: allArticles[currentIndex - 1].title,
        }
      : null;

  const displayDate = article.publishedAt || article.createdAt;
  const readingTime = calculateReadingTime(article.content);

  const articleJsonLd = generateArticleJsonLd(article, BASE_URL);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    [
      { name: 'ホーム', url: '/' },
      { name: '記事一覧', url: '/articles' },
      { name: article.title },
    ],
    BASE_URL
  );

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <TableOfContents readingTime={readingTime} />
      <article className="mx-auto max-w-4xl px-4 py-8">
        {article.headerImageUrl && (
          <div className="relative mb-8 aspect-[2/1] w-full overflow-hidden rounded-lg">
            <Image
              src={article.headerImageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
        )}
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{article.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <time
              dateTime={displayDate}
              className="text-stone-600 dark:text-stone-400"
            >
              {dayjs(displayDate).format('YYYY/MM/DD')}
            </time>
            <span className="text-stone-400 dark:text-stone-500">·</span>
            <span className="flex items-center gap-1 text-stone-600 dark:text-stone-400">
              <Clock className="h-4 w-4" />約{readingTime}分で読めます
            </span>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <TagLink key={tag} tag={tag} size="md" />
              ))}
            </div>
          </div>
        </header>
        <ArticleContent content={article.content} />
        <ArticleNavigation
          prevArticle={prevArticle}
          nextArticle={nextArticle}
        />
      </article>
    </>
  );
}
