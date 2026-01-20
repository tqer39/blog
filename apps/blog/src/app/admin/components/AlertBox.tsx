'use client';

import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * AlertBox の重要度レベル。
 */
export type AlertVariant = 'info' | 'warning' | 'error' | 'success';

/**
 * AlertBox のProps。
 *
 * エラー、警告、情報、成功メッセージを統一的に表示するコンポーネント。
 */
interface AlertBoxProps {
  /** 表示するメッセージ */
  children: ReactNode;
  /** 重要度レベル (default: 'error') */
  variant?: AlertVariant;
  /** アイコンを表示するか (default: false) */
  showIcon?: boolean;
  /** 追加のCSSクラス */
  className?: string;
}

/**
 * 重要度別のスタイル設定。
 */
const VARIANT_STYLES = {
  info: {
    icon: Info,
    container: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    iconColor: 'text-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    container: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-300',
    iconColor: 'text-yellow-500',
  },
  error: {
    icon: AlertCircle,
    container: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    iconColor: 'text-red-500',
  },
  success: {
    icon: CheckCircle2,
    container: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300',
    iconColor: 'text-green-500',
  },
} as const;

/**
 * エラー、警告、情報、成功メッセージを表示するアラートボックス。
 *
 * MarkdownEditor, TextTransformPopover, ReviewPanel 等で使用される
 * 共通のアラートパターンを抽象化。
 *
 * @example
 * // シンプルなエラーメッセージ
 * <AlertBox>{errorMessage}</AlertBox>
 *
 * @example
 * // アイコン付き警告
 * <AlertBox variant="warning" showIcon>
 *   注意が必要です
 * </AlertBox>
 *
 * @example
 * // 成功メッセージ
 * <AlertBox variant="success" showIcon>
 *   保存しました
 * </AlertBox>
 */
export function AlertBox({
  children,
  variant = 'error',
  showIcon = false,
  className = '',
}: AlertBoxProps) {
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.icon;

  if (showIcon) {
    return (
      <div
        className={`rounded-lg border p-4 ${styles.container} ${styles.border} ${className}`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${styles.iconColor}`} />
          <p className={`text-sm ${styles.text}`}>{children}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-md p-3 text-sm ${styles.container} ${styles.text} ${className}`}
    >
      {children}
    </div>
  );
}
