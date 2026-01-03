import dayjs from "dayjs";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ArticleContent } from "@/components/ArticleContent";
import { TagLink } from "@/components/TagLink";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article not found" };
  }

  const description = article.description || article.title;
  const url = `${BASE_URL}/article/${slug}`;

  const ogImages = article.headerImageUrl
    ? [{ url: article.headerImageUrl, width: 1200, height: 630, alt: article.title }]
    : undefined;

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      url,
      siteName: "tqer39's blog",
      type: "article",
      publishedTime: article.publishedAt || undefined,
      modifiedTime: article.updatedAt,
      authors: ["tqer39"],
      tags: article.tags,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
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
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const displayDate = article.publishedAt || article.createdAt;

  return (
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
            {dayjs(displayDate).format("YYYY/MM/DD")}
          </time>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <TagLink key={tag} tag={tag} size="md" />
            ))}
          </div>
        </div>
      </header>
      <ArticleContent content={article.content} />
    </article>
  );
}
