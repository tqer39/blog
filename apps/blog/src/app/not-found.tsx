import type { Metadata } from 'next';
import Link from 'next/link';

import { ArticleCard } from '@/components/ArticleCard';
import { getAllArticles } from '@/lib/articles';

export const metadata: Metadata = {
  title: 'ページが見つかりません',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NotFound() {
  const result = await getAllArticles();
  const recentArticles = result.ok ? result.data.slice(0, 3) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 404メッセージセクション */}
      <div className="flex flex-col items-center justify-center space-y-6 py-12">
        <h1 className="text-3xl font-bold">
          お探しのページが見つかりませんでした
        </h1>
        <p className="text-stone-600 dark:text-stone-400">
          URLが間違っているか、ページが削除された可能性があります。
        </p>
        <div className="flex gap-4">
          <Link
            href="/"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            ホームに戻る
          </Link>
          <span className="text-stone-400 dark:text-stone-500">·</span>
          <Link
            href="/articles"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            記事一覧を見る
          </Link>
        </div>
      </div>

      {/* 最近の記事セクション */}
      {recentArticles.length > 0 && (
        <>
          <div className="border-t border-stone-200 dark:border-stone-700 my-12" />
          <section className="pb-12">
            <h2 className="text-2xl font-bold mb-6">最近の記事</h2>
            <div className="space-y-8">
              {recentArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
