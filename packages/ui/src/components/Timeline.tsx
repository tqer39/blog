'use client';

import { cn } from '@blog/utils';
import { Calendar, Maximize2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMemo, useState } from 'react';
import { Chrono } from 'react-chrono';
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
  const { resolvedTheme } = useTheme();
  const [showFullscreen, setShowFullscreen] = useState(false);
  const events = useMemo(() => parseTimeline(content), [content]);

  const isDark = resolvedTheme === 'dark';

  // Convert to react-chrono item format
  const items = useMemo(
    () =>
      events.map((event) => ({
        title: event.date,
        cardTitle: event.title,
        cardDetailedText: event.description,
      })),
    [events]
  );

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
          'bg-white p-4 dark:bg-stone-800',
          isFullscreen && 'h-full overflow-y-auto'
        )}
      >
        <Chrono
          items={items}
          mode="VERTICAL"
          disableToolbar
          scrollable={false}
          cardHeight={80}
          darkMode={isDark}
          theme={{
            primary: isDark ? '#60a5fa' : '#2563eb',
            secondary: isDark ? '#a8a29e' : '#78716c',
            cardBgColor: isDark ? '#292524' : '#fafaf9',
            cardTitleColor: isDark ? '#e7e5e4' : '#1c1917',
            cardSubtitleColor: isDark ? '#a8a29e' : '#57534e',
            cardDetailsColor: isDark ? '#a8a29e' : '#57534e',
            titleColor: isDark ? '#60a5fa' : '#2563eb',
            titleColorActive: isDark ? '#93c5fd' : '#1d4ed8',
          }}
          fontSizes={{
            title: '0.875rem',
            cardTitle: '1rem',
            cardSubtitle: '0.875rem',
            cardText: '0.875rem',
          }}
        />
      </div>
      <FullscreenModal
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        title="Timeline"
      >
        <Timeline
          content={content}
          isFullscreen={true}
          className="h-full border-none"
        />
      </FullscreenModal>
    </div>
  );
}
