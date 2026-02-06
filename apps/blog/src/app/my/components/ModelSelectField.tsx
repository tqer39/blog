'use client';

import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@blog/ui';
import type { ReactNode } from 'react';

/**
 * モデル選択オプションの型定義。
 */
export interface ModelOption<T extends string = string> {
  value: T;
  label: string;
}

/**
 * プロバイダー情報付きモデルオプション。
 */
export interface ModelOptionWithProvider<T extends string = string>
  extends ModelOption<T> {
  provider: string;
}

/**
 * ModelSelectField のProps。
 *
 * AI モデル選択用のセレクトフィールド。
 * ラベル、セレクトボックス、オプションリストを一体化したコンポーネント。
 */
interface ModelSelectFieldProps<T extends string> {
  /** フィールドラベル */
  label: string;
  /** 現在の選択値 */
  value: T;
  /** 値変更時のコールバック */
  onChange: (value: T) => void;
  /** 選択可能なモデルオプション */
  options: ModelOption<T>[];
  /** カスタムアイテムレンダラー (省略時はlabelを表示) */
  renderItem?: (option: ModelOption<T>) => ReactNode;
  /** 無効状態 */
  disabled?: boolean;
}

/**
 * AI モデル選択用の共通セレクトフィールド。
 *
 * AISettingsPopover 内の繰り返しパターンを抽象化。
 * 標準のラベル表示またはカスタムレンダリングをサポート。
 *
 * @example
 * // 標準使用
 * <ModelSelectField
 *   label="Review"
 *   value={settings.review}
 *   onChange={(v) => onSettingsChange({ review: v })}
 *   options={ANTHROPIC_MODELS}
 * />
 *
 * @example
 * // カスタムレンダリング
 * <ModelSelectField
 *   label="Image"
 *   value={settings.image}
 *   onChange={(v) => onSettingsChange({ image: v })}
 *   options={ALL_IMAGE_MODELS}
 *   renderItem={(opt) => (
 *     <span>[{opt.provider}] {opt.label}</span>
 *   )}
 * />
 */
export function ModelSelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  renderItem,
  disabled,
}: ModelSelectFieldProps<T>) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select
        value={value}
        onValueChange={(v: string) => onChange(v as T)}
        disabled={disabled}
      >
        <SelectTrigger className="h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {renderItem ? renderItem(option) : option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
