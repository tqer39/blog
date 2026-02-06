import type {
  AIToolsStatus,
  ContinuationLength,
  ContinuationSuggestion,
} from '@blog/cms-types';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@blog/ui';
import {
  Bold,
  Code,
  Columns2,
  Eye,
  Heading2,
  Italic,
  Link,
  List,
  Loader2,
  Maximize2,
  Pencil,
  Smile,
  Wand2,
} from 'lucide-react';
import { useI18n } from '@/i18n';
import { AlertBox } from '../../AlertBox';
import { EmojiPicker } from '../../EmojiPicker';
import { LoadingState } from '../../LoadingState';

type PreviewMode = 'edit' | 'preview' | 'split';

interface EditorToolbarProps {
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
  onFullscreen: () => void;
  onInsertText: (text: string) => void;
  onWrapSelection: (before: string, after: string) => void;
  // Emoji picker
  isEmojiPickerOpen: boolean;
  onEmojiPickerOpenChange: (open: boolean) => void;
  onEmojiSelect: (emoji: string) => void;
  // AI continuation
  aiToolsStatus?: AIToolsStatus | null;
  title?: string;
  isSuggesting: boolean;
  suggestions: ContinuationSuggestion[];
  suggestionError: string | null;
  isSuggestionOpen: boolean;
  selectedLength: ContinuationLength;
  onSuggestionOpenChange: (open: boolean) => void;
  onSuggestContinuation: (length?: ContinuationLength) => void;
  onAcceptSuggestion: (text: string) => void;
}

export function EditorToolbar({
  previewMode,
  onPreviewModeChange,
  onFullscreen,
  onInsertText,
  onWrapSelection,
  isEmojiPickerOpen,
  onEmojiPickerOpenChange,
  onEmojiSelect,
  aiToolsStatus,
  title,
  isSuggesting,
  suggestions,
  suggestionError,
  isSuggestionOpen,
  selectedLength,
  onSuggestionOpenChange,
  onSuggestContinuation,
  onAcceptSuggestion,
}: EditorToolbarProps) {
  const { messages } = useI18n();
  const t = messages.editor.toolbar;

  return (
    <div className="flex items-center justify-between border-b bg-muted/50 px-2 py-1">
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onWrapSelection('**', '**')}
            >
              <Bold className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.bold}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onWrapSelection('_', '_')}
            >
              <Italic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.italic}</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onInsertText('## ')}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.heading}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onInsertText('- ')}
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.list}</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onInsertText('```\n\n```')}
            >
              <Code className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.codeBlock}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onInsertText('[](url)')}
            >
              <Link className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.link}</TooltipContent>
        </Tooltip>

        {/* Emoji Picker Button */}
        <Popover
          open={isEmojiPickerOpen}
          onOpenChange={onEmojiPickerOpenChange}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>{t.emoji}</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-auto p-0" align="start">
            <EmojiPicker onSelect={onEmojiSelect} />
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* AI Continuation Button */}
        <Popover open={isSuggestionOpen} onOpenChange={onSuggestionOpenChange}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onSuggestContinuation()}
                  disabled={
                    isSuggesting ||
                    !title?.trim() ||
                    !aiToolsStatus?.hasAnthropic
                  }
                >
                  {isSuggesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>{t.aiContinuation}</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-96 p-0" align="start">
            <div className="border-b px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{t.continuationTitle}</h4>
                  <p className="text-xs text-muted-foreground">
                    {t.continuationHelp}
                  </p>
                </div>
                <div className="flex gap-1">
                  {[
                    { value: 'short' as const, label: t.short },
                    { value: 'medium' as const, label: t.medium },
                    { value: 'long' as const, label: t.long },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        selectedLength === option.value ? 'default' : 'outline'
                      }
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => onSuggestContinuation(option.value)}
                      disabled={isSuggesting}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {isSuggesting && <LoadingState />}
              {suggestionError && <AlertBox>{suggestionError}</AlertBox>}
              {!isSuggesting && suggestions.length > 0 && (
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`suggestion-${index}-${suggestion.text.slice(0, 20)}`}
                      type="button"
                      className="w-full rounded-md border p-3 text-left text-sm transition-colors hover:bg-muted"
                      onClick={() => onAcceptSuggestion(suggestion.text)}
                    >
                      <p className="line-clamp-4 whitespace-pre-wrap">
                        {suggestion.text}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {t.confidence}:{' '}
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {!isSuggesting &&
                !suggestionError &&
                suggestions.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {t.generateSuggestion}
                  </div>
                )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          value={previewMode}
          onValueChange={(v: string) =>
            v && onPreviewModeChange(v as PreviewMode)
          }
          size="sm"
        >
          <ToggleGroupItem value="edit" aria-label="Edit mode">
            <Pencil className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="split" aria-label="Split mode">
            <Columns2 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="preview" aria-label="Preview mode">
            <Eye className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="h-6" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onFullscreen}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.fullscreen}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
