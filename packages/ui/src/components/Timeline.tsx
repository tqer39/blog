'use client';

import { cn } from '@blog/utils';
import { Calendar } from 'lucide-react';
import { useMemo } from 'react';
import YAML from 'yaml';

interface TimelineProps {
  content: string;
  className?: string;
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

export function Timeline({ content, className }: TimelineProps) {
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
    <div className={cn('my-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-lg bg-stone-700 px-4 py-2 text-sm text-stone-300">
        <Calendar className="h-4 w-4" />
        <span>Timeline</span>
      </div>

      {/* Timeline content */}
      <div className="rounded-b-lg bg-stone-100 p-4 dark:bg-stone-800">
        <div className="relative">
          {events.map((event, index) => {
            const isLast = index === events.length - 1;

            return (
              <div key={index} className="relative flex gap-4">
                {/* Timeline line and dot */}
                <div className="flex flex-col items-center">
                  {/* Dot */}
                  <div
                    className="z-10 h-3 w-3 shrink-0 rounded-full border-2 border-blue-500 bg-white dark:bg-stone-800"
                    style={{ marginTop: '6px' }}
                  />
                  {/* Line */}
                  {!isLast && (
                    <div
                      className="w-0.5 flex-1 bg-stone-300 dark:bg-stone-600"
                      style={{ minHeight: '24px' }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={cn('pb-6', isLast && 'pb-0')}>
                  {/* Date */}
                  <div className="mb-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                    {event.date}
                  </div>
                  {/* Title */}
                  <div className="font-semibold text-stone-800 dark:text-stone-200">
                    {event.title}
                  </div>
                  {/* Description */}
                  {event.description && (
                    <div className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                      {event.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
