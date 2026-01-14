import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'ページが見つかりません',
	robots: {
		index: false,
		follow: false,
	},
};

export default function NotFound() {
	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			<div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
				<h1 className="text-3xl font-bold">お探しのページが見つかりませんでした</h1>
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
		</div>
	);
}
