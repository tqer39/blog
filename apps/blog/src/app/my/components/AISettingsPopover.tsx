'use client';

import type {
  AIModelSettings,
  AnthropicModel,
  GeminiImageModel,
  ImageModel,
  OpenAIImageModel,
  OpenAIModel,
} from '@blog/cms-types';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from '@blog/ui';
import { RotateCcw, Settings } from 'lucide-react';
import { useI18n } from '@/i18n';
import {
  type ModelOption,
  type ModelOptionWithProvider,
  ModelSelectField,
} from './ModelSelectField';

interface AISettingsPopoverProps {
  settings: AIModelSettings;
  onSettingsChange: (settings: Partial<AIModelSettings>) => void;
  onReset: () => void;
}

// Model options with display labels (exported for reuse)
export const OPENAI_MODELS: ModelOption<OpenAIModel>[] = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4.1-mini-2025-04-14', label: 'GPT-4.1 Mini' },
  { value: 'gpt-4.1-2025-04-14', label: 'GPT-4.1 (Best)' },
];

export const ANTHROPIC_MODELS: ModelOption<AnthropicModel>[] = [
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (Fast)' },
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5 (Best)' },
  { value: 'claude-opus-4-5-20251101', label: 'Claude Opus 4.5 (Premium)' },
];

export const GEMINI_IMAGE_MODELS: ModelOption<GeminiImageModel>[] = [
  { value: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash (Fast)' },
  { value: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro (Best)' },
];

export const OPENAI_IMAGE_MODELS: ModelOption<OpenAIImageModel>[] = [
  { value: 'dall-e-3', label: 'DALL-E 3 (Best)' },
  { value: 'dall-e-2', label: 'DALL-E 2 (Fast)' },
];

// Combined image models for all providers
export const ALL_IMAGE_MODELS: ModelOptionWithProvider<ImageModel>[] = [
  ...GEMINI_IMAGE_MODELS.map((m) => ({ ...m, provider: 'Gemini' })),
  ...OPENAI_IMAGE_MODELS.map((m) => ({ ...m, provider: 'OpenAI' })),
];

export function AISettingsPopover({
  settings,
  onSettingsChange,
  onReset,
}: AISettingsPopoverProps) {
  const { messages } = useI18n();
  const t = messages.aiModelSettings;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label={t.title}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{t.title}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-7 px-2 text-xs text-muted-foreground"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              {t.reset}
            </Button>
          </div>

          <Separator />

          {/* Metadata Generation (OpenAI) */}
          <ModelSelectField
            label={t.metadata}
            value={settings.metadata}
            onChange={(v) => onSettingsChange({ metadata: v })}
            options={OPENAI_MODELS}
          />

          {/* Image Generation (Gemini / OpenAI) */}
          <ModelSelectField
            label={t.image}
            value={settings.image}
            onChange={(v) => onSettingsChange({ image: v })}
            options={ALL_IMAGE_MODELS}
            renderItem={(opt) => (
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  [{(opt as ModelOptionWithProvider).provider}]
                </span>
                {opt.label}
              </span>
            )}
          />

          <Separator />

          <p className="text-xs text-muted-foreground">{t.claudeAnthropic}</p>

          {/* Article Review */}
          <ModelSelectField
            label={t.review}
            value={settings.review}
            onChange={(v) => onSettingsChange({ review: v })}
            options={ANTHROPIC_MODELS}
          />

          {/* Outline Generation */}
          <ModelSelectField
            label={t.outline}
            value={settings.outline}
            onChange={(v) => onSettingsChange({ outline: v })}
            options={ANTHROPIC_MODELS}
          />

          {/* Text Transform */}
          <ModelSelectField
            label={t.transform}
            value={settings.transform}
            onChange={(v) => onSettingsChange({ transform: v })}
            options={ANTHROPIC_MODELS}
          />

          {/* Continuation Suggestion */}
          <ModelSelectField
            label={t.continuation}
            value={settings.continuation}
            onChange={(v) => onSettingsChange({ continuation: v })}
            options={ANTHROPIC_MODELS}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
