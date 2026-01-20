'use client';

import { Label } from '@blog/ui';
import type { ReactNode } from 'react';

/**
 * FormField のProps。
 *
 * ラベル + 入力フィールド + ヘルプテキストのレイアウトを統一するラッパー。
 */
interface FormFieldProps {
  /** フィールドのラベル */
  label: string;
  /** input要素のid (htmlForと連携) */
  htmlFor?: string;
  /** 入力フィールド */
  children: ReactNode;
  /** ヘルプテキスト (省略可) */
  description?: string;
  /** ラベルのスタイルバリアント */
  labelVariant?: 'default' | 'muted';
  /** 追加のCSSクラス */
  className?: string;
}

/**
 * フォームフィールドのラッパーコンポーネント。
 *
 * space-y-2 + Label + Input + description のパターンを抽象化。
 * ArticleEditor, CategoryEditor, TagSelector 等で共通利用可能。
 *
 * @example
 * // 基本使用
 * <FormField label="Title" htmlFor="title">
 *   <Input id="title" value={title} onChange={...} />
 * </FormField>
 *
 * @example
 * // ヘルプテキスト付き
 * <FormField
 *   label="Description"
 *   htmlFor="description"
 *   description="100-160文字を推奨"
 * >
 *   <Textarea id="description" value={description} />
 * </FormField>
 *
 * @example
 * // 控えめなラベル
 * <FormField label="Optional Field" labelVariant="muted">
 *   <Input value={value} />
 * </FormField>
 */
export function FormField({
  label,
  htmlFor,
  children,
  description,
  labelVariant = 'default',
  className = '',
}: FormFieldProps) {
  const labelClass =
    labelVariant === 'muted' ? 'text-sm text-muted-foreground' : '';

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={htmlFor} className={labelClass}>
        {label}
      </Label>
      {children}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
