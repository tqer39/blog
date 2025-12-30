import dayjs from 'dayjs';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleContent } from '@/components/ArticleContent';
import { getAllArticles, getArticleBySlug } from '@/lib/articles';

interface ArticlePageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export function generateMetadata({ params }: ArticlePageProps): Metadata {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    return { title: 'Article not found' };
  }

  return {
    title: `${article.title} | tqer39's blog`,
    description: article.description,
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{article.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <time
            dateTime={article.date}
            className="text-stone-600 dark:text-stone-400"
          >
            {dayjs(article.date).format('YYYY/MM/DD')}
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
