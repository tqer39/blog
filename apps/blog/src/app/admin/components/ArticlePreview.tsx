'use client';

import { FullscreenModal } from '@blog/ui';
import dayjs from 'dayjs';
import { Clock, Monitor, Presentation } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { ArticleContent } from '@/components/ArticleContent';
import { SlideViewer } from '@/components/SlideViewer';
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
  slideMode?: boolean;
  slideDuration?: number | null;
}

export function ArticlePreview({
  isOpen,
  onClose,
  title,
  content,
  tags,
  headerImageUrl,
  publishedAt,
  slideMode = false,
  slideDuration,
}: ArticlePreviewProps) {
  const [isSlideView, setIsSlideView] = useState(false);
  const displayDate = publishedAt || new Date().toISOString();
  const readingTime = calculateReadingTime(content);

  // Reset slide view when modal closes
  const handleClose = () => {
    setIsSlideView(false);
    onClose();
  };

  // Slide preview view
  if (isSlideView && content) {
    return (
      <SlideViewer
        isOpen={isOpen}
        onClose={handleClose}
        content={content}
        title={title}
        slideDuration={slideDuration ?? undefined}
      />
    );
  }

  return (
    <FullscreenModal isOpen={isOpen} onClose={handleClose} title="プレビュー">
      <div className="min-h-full bg-white dark:bg-stone-950">
        <TableOfContents readingTime={readingTime} />
        <article className="mx-auto max-w-4xl px-4 py-8">
          {/* Preview mode toggle when slide mode is enabled */}
          {slideMode && content && (
            <div className="mb-6 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsSlideView(false)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  !isSlideView
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                }`}
              >
                <Monitor className="h-4 w-4" />
                記事
              </button>
              <button
                type="button"
                onClick={() => setIsSlideView(true)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isSlideView
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                }`}
              >
                <Presentation className="h-4 w-4" />
                スライド
              </button>
            </div>
          )}

          {headerImageUrl && (
            <div className="relative mb-8 aspect-[2/1] w-full overflow-hidden rounded-lg">
              <Image
                src={headerImageUrl}
                alt={title || 'ヘッダー画像'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                unoptimized={headerImageUrl.includes('localhost')}
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
