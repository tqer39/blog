'use client';

import { cn } from '@blog/utils';
import { Calendar, Maximize2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import YAML from 'yaml';

import { FullscreenModal } from './FullscreenModal';

interface TimelineProps {
  content: string;
  className?: string;
  isFullscreen?: boolean;
}

interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
}

function parseTimeline(content: string): TimelineEvent[] {
  try {
    const parsed = YAML.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is TimelineEvent =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.date === 'string' &&
          typeof item.title === 'string'
      );
    }
    return [];
  } catch {
    return [];
  }
}

export function Timeline({
  content,
  className,
  isFullscreen = false,
}: TimelineProps) {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const events = useMemo(() => parseTimeline(content), [content]);

  if (events.length === 0) {
    return (
      <div className="my-4 rounded-lg border border-dashed border-muted-foreground/50 p-4 text-center text-muted-foreground">
        タイムライン設定が無効です。YAML形式で正しく記述してください。
        <pre className="mt-2 text-left text-xs">
          {`- date: 2024-01
  title: イベント名
  description: 説明文（オプション）`}
        </pre>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'my-5 overflow-hidden rounded-lg ring-1 ring-stone-300 dark:ring-[#333]',
        className
      )}
    >
      {/* Header */}
      <div className="component-header flex items-center justify-between px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Timeline</span>
        </div>
        {!isFullscreen && (
          <button
            type="button"
            onClick={() => setShowFullscreen(true)}
            className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
            aria-label="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Timeline content */}
      <div
        className={cn(
          'bg-white px-6 py-6 dark:bg-stone-800',
          isFullscreen && 'h-full overflow-y-auto'
        )}
      >
        <ol className="relative ml-2 border-l-2 border-red-500 dark:border-red-400">
          {events.map((event, index) => (
            <li key={index} className="relative pb-8 pl-6 last:pb-0">
              {/* ●ポチ */}
              <span className="absolute left-[-9px] top-1 h-4 w-4 rounded-full bg-blue-500 ring-4 ring-white dark:bg-blue-400 dark:ring-stone-800" />
              {/* Date */}
              <time className="mb-1 block text-sm font-semibold text-blue-600 dark:text-blue-400">
                {event.date}
              </time>
              {/* Title */}
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                {event.title}
              </h3>
              {/* Description */}
              {event.description && (
                <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {event.description}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>

      <FullscreenModal
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        title="Timeline"
      >
        <Timeline
          content={content}
          isFullscreen={true}
          className="h-full ring-0"
        />
      </FullscreenModal>
    </div>
  );
}
