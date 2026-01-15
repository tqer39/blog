'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
        <h1 className="text-3xl font-bold">エラーが発生しました</h1>
        <p className="text-stone-600 dark:text-stone-400">
          申し訳ございません。問題が発生しました。
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={reset}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            もう一度試す
          </button>
          <span className="text-stone-400 dark:text-stone-500">·</span>
          <Link
            href="/"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
