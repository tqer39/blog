'use client';

import type {
  AIModelSettings,
  AnthropicModel,
  GeminiImageModel,
  OpenAIModel,
} from '@blog/cms-types';
import {
  Button,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@blog/ui';
import { RotateCcw, Settings } from 'lucide-react';

interface AISettingsPopoverProps {
  settings: AIModelSettings;
  onSettingsChange: (settings: Partial<AIModelSettings>) => void;
  onReset: () => void;
}

// Model options with display labels (exported for reuse)
export const OPENAI_MODELS: { value: OpenAIModel; label: string }[] = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
  { value: 'gpt-4o', label: 'GPT-4o (Best)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Economy)' },
];

export const ANTHROPIC_MODELS: { value: AnthropicModel; label: string }[] = [
  { value: 'claude-sonnet-4-20250514', label: 'Claude 4 Sonnet (Latest)' },
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Best)' },
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast)' },
];

export const GEMINI_IMAGE_MODELS: { value: GeminiImageModel; label: string }[] =
  [
    { value: 'gemini-2.5-flash-image', label: '2.5 Flash (Fast)' },
    { value: 'gemini-3-pro-image-preview', label: '3 Pro (Best)' },
  ];

export function AISettingsPopover({
  settings,
  onSettingsChange,
  onReset,
}: AISettingsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="AI設定"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">AI Model Settings</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-7 px-2 text-xs text-muted-foreground"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          </div>

          <Separator />

          {/* Metadata Generation (OpenAI) */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Metadata (OpenAI)
            </Label>
            <Select
              value={settings.metadata}
              onValueChange={(v: string) =>
                onSettingsChange({ metadata: v as OpenAIModel })
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPENAI_MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image Generation (Gemini) */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Image (Gemini)
            </Label>
            <Select
              value={settings.image}
              onValueChange={(v: string) =>
                onSettingsChange({ image: v as GeminiImageModel })
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GEMINI_IMAGE_MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <p className="text-xs text-muted-foreground">Claude (Anthropic)</p>

          {/* Article Review */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Review</Label>
            <Select
              value={settings.review}
              onValueChange={(v: string) =>
                onSettingsChange({ review: v as AnthropicModel })
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANTHROPIC_MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Outline Generation */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Outline</Label>
            <Select
              value={settings.outline}
              onValueChange={(v: string) =>
                onSettingsChange({ outline: v as AnthropicModel })
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANTHROPIC_MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Transform */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Transform</Label>
            <Select
              value={settings.transform}
              onValueChange={(v: string) =>
                onSettingsChange({ transform: v as AnthropicModel })
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANTHROPIC_MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Continuation Suggestion */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Continuation
            </Label>
            <Select
              value={settings.continuation}
              onValueChange={(v: string) =>
                onSettingsChange({ continuation: v as AnthropicModel })
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANTHROPIC_MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
