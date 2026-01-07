'use client';

import type { ReviewArticleResponse, ReviewItem } from '@blog/cms-types';
import { Badge, Button, Separator } from '@blog/ui';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  X,
} from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ReviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  review: ReviewArticleResponse | null;
  isLoading: boolean;
  error: string | null;
}

const categoryLabels: Record<string, string> = {
  clarity: '明確さ',
  structure: '構成',
  accuracy: '正確性',
  grammar: '文法',
  style: 'スタイル',
};

const severityConfig = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-300',
    iconColor: 'text-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    iconColor: 'text-yellow-500',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-700 dark:text-red-300',
    iconColor: 'text-red-500',
  },
};

function ScoreIndicator({ score }: { score: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-green-600 dark:text-green-400';
    if (s >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreIcon = (s: number) => {
    if (s >= 8) return CheckCircle2;
    if (s >= 6) return AlertTriangle;
    return AlertCircle;
  };

  const Icon = getScoreIcon(score);

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-6 w-6 ${getScoreColor(score)}`} />
      <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
        {score}
      </span>
      <span className="text-muted-foreground">/ 10</span>
    </div>
  );
}

function ReviewItemCard({ item }: { item: ReviewItem }) {
  const config = severityConfig[item.severity];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {categoryLabels[item.category] || item.category}
            </Badge>
            {item.location && (
              <span className="text-xs text-muted-foreground">
                {item.location}
              </span>
            )}
          </div>
          <p className={`text-sm font-medium ${config.textColor}`}>
            {item.issue}
          </p>
          {item.suggestion && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">提案:</span> {item.suggestion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReviewPanel({
  isOpen,
  onClose,
  review,
  isLoading,
  error,
}: ReviewPanelProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const groupedItems = review?.items.reduce(
    (acc, item) => {
      if (!acc[item.severity]) {
        acc[item.severity] = [];
      }
      acc[item.severity].push(item);
      return acc;
    },
    {} as Record<string, ReviewItem[]>
  );

  return createPortal(
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default border-none bg-black/50"
        onClick={onClose}
        aria-label="Close panel"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">AI レビュー結果</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">レビュー中...</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}

          {review && !isLoading && !error && (
            <div className="space-y-6">
              {/* Score */}
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    総合スコア
                  </span>
                  <ScoreIndicator score={review.overallScore} />
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  概要
                </h3>
                <p className="text-sm leading-relaxed">{review.summary}</p>
              </div>

              <Separator />

              {/* Review Items */}
              {review.items.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    詳細フィードバック ({review.items.length}件)
                  </h3>

                  {/* Errors first */}
                  {groupedItems?.error?.map((item, index) => (
                    <ReviewItemCard
                      key={`error-${index}-${item.issue.slice(0, 20)}`}
                      item={item}
                    />
                  ))}

                  {/* Then warnings */}
                  {groupedItems?.warning?.map((item, index) => (
                    <ReviewItemCard
                      key={`warning-${index}-${item.issue.slice(0, 20)}`}
                      item={item}
                    />
                  ))}

                  {/* Then info */}
                  {groupedItems?.info?.map((item, index) => (
                    <ReviewItemCard
                      key={`info-${index}-${item.issue.slice(0, 20)}`}
                      item={item}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <p className="text-sm text-green-700 dark:text-green-300">
                      特に問題は見つかりませんでした
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
