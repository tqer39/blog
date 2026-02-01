'use client';

import { Loader2 } from 'lucide-react';

/**
 * LoadingState のProps。
 *
 * 読み込み中状態を表示するコンポーネント。
 * スピナーとオプションのメッセージを中央に配置。
 */
interface LoadingStateProps {
  /** 表示するメッセージ (省略可) */
  message?: string;
  /** スピナーのサイズ (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** メッセージの位置 (default: 'below') */
  messagePosition?: 'below' | 'beside';
  /** 追加のCSSクラス */
  className?: string;
}

const SIZES = {
  sm: { spinner: 'h-5 w-5', padding: 'py-4' },
  md: { spinner: 'h-6 w-6', padding: 'py-8' },
  lg: { spinner: 'h-8 w-8', padding: 'py-12' },
} as const;

/**
 * 読み込み中状態を表示するコンポーネント。
 *
 * ReviewPanel, TextTransformPopover, MarkdownEditor 等で使用される
 * 共通のローディングパターンを抽象化。
 *
 * @example
 * // メッセージなし
 * <LoadingState />
 *
 * @example
 * // メッセージ付き (下)
 * <LoadingState message="レビュー中..." size="lg" />
 *
 * @example
 * // メッセージ付き (横)
 * <LoadingState message="変換中..." messagePosition="beside" />
 */
export function LoadingState({
  message,
  size = 'md',
  messagePosition = 'below',
  className = '',
}: LoadingStateProps) {
  const { spinner, padding } = SIZES[size];

  if (messagePosition === 'beside') {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className={`${spinner} animate-spin text-muted-foreground`} />
        {message && (
          <span className="ml-2 text-sm text-muted-foreground">{message}</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center ${padding} ${className}`}
    >
      <Loader2 className={`${spinner} animate-spin text-muted-foreground`} />
      {message && <p className="mt-4 text-muted-foreground">{message}</p>}
    </div>
  );
}
