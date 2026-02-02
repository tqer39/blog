'use client';

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@blog/ui';
import { ChevronDown } from 'lucide-react';
import {
  ALL_IMAGE_MODELS,
  ANTHROPIC_MODELS,
  GEMINI_IMAGE_MODELS,
  OPENAI_MODELS,
} from './AISettingsPopover';

interface SplitButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  modelType: 'openai' | 'anthropic' | 'gemini' | 'image';
  modelValue: string;
  onModelChange: (value: string) => void;
}

export function SplitButton({
  children,
  onClick,
  disabled,
  modelType,
  modelValue,
  onModelChange,
}: SplitButtonProps) {
  const models =
    modelType === 'openai'
      ? OPENAI_MODELS
      : modelType === 'anthropic'
        ? ANTHROPIC_MODELS
        : modelType === 'image'
          ? ALL_IMAGE_MODELS
          : GEMINI_IMAGE_MODELS;

  const label =
    modelType === 'openai'
      ? 'OpenAI'
      : modelType === 'anthropic'
        ? 'Claude'
        : modelType === 'image'
          ? 'Image'
          : 'Gemini';

  return (
    <div className="inline-flex">
      {/* メインボタン */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className="gap-1.5 rounded-r-none border-r-0"
      >
        {children}
      </Button>

      {/* ドロップダウントリガー */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="rounded-l-none px-2"
            aria-label={`${label} モデル選択`}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2" align="end">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <Select value={modelValue} onValueChange={onModelChange}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {'provider' in m ? (
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          [{m.provider}]
                        </span>
                        {m.label}
                      </span>
                    ) : (
                      m.label
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
