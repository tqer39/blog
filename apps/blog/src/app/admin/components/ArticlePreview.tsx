'use client';

import { FullscreenModal } from '@blog/ui';
import dayjs from 'dayjs';
import { Clock } from 'lucide-react';
import Image from 'next/image';

import { ArticleContent } from '@/components/ArticleContent';
import { TableOfContents } from '@/components/TableOfContents';
import { TagLink } from '@/components/TagLink';
import { calculateReadingTime } from '@/lib/readingTime';

interface ArticlePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  tags: string[];
  headerImageUrl: string | null;
  publishedAt?: string | null;
}

export function ArticlePreview({
  isOpen,
  onClose,
  title,
  content,
  tags,
  headerImageUrl,
  publishedAt,
}: ArticlePreviewProps) {
  const displayDate = publishedAt || new Date().toISOString();
  const readingTime = calculateReadingTime(content);

  return (
    <FullscreenModal isOpen={isOpen} onClose={onClose} title="プレビュー">
      <div className="min-h-full bg-white dark:bg-stone-950">
        <TableOfContents readingTime={readingTime} />
        <article className="mx-auto max-w-4xl px-4 py-8">
          {headerImageUrl && (
            <div className="relative mb-8 aspect-[2/1] w-full overflow-hidden rounded-lg">
              <Image
                src={headerImageUrl}
                alt={title || 'ヘッダー画像'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          )}
          <header className="mb-8">
            <h1 className="text-3xl font-bold">
              {title || '(タイトル未入力)'}
            </h1>
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
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <TagLink key={tag} tag={tag} size="md" />
                  ))}
                </div>
              )}
            </div>
          </header>
          {content ? (
            <ArticleContent content={content} />
          ) : (
            <p className="text-stone-500 dark:text-stone-400">
              (コンテンツ未入力)
            </p>
          )}
        </article>
      </div>
    </FullscreenModal>
  );
}
