import dayjs from "dayjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleContent } from "@/components/ArticleContent";
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
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
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
              <span
                key={tag}
                className="rounded bg-stone-200 px-2 py-1 text-sm dark:bg-stone-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>
      <ArticleContent content={article.content} />
    </article>
  );
}
