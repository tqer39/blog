'use client';

import Link from 'next/link';

export default function GlobalError({
  error: _error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
            <h1 className="text-3xl font-bold">システムエラーが発生しました</h1>
            <p className="text-stone-600 dark:text-stone-400">
              予期しないエラーが発生しました。ページを再読み込みしてください。
            </p>
            <Link
              href="/"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
