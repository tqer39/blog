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
import { Settings } from 'lucide-react';
import {
  ANTHROPIC_MODELS,
  GEMINI_IMAGE_MODELS,
  OPENAI_MODELS,
} from './AISettingsPopover';

interface InlineModelSelectProps {
  type: 'openai' | 'anthropic' | 'gemini';
  value: string;
  onChange: (value: string) => void;
}

export function InlineModelSelect({
  type,
  value,
  onChange,
}: InlineModelSelectProps) {
  const models =
    type === 'openai'
      ? OPENAI_MODELS
      : type === 'anthropic'
        ? ANTHROPIC_MODELS
        : GEMINI_IMAGE_MODELS;

  const label =
    type === 'openai' ? 'OpenAI' : type === 'anthropic' ? 'Claude' : 'Gemini';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          aria-label={`${label} モデル設定`}
        >
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
