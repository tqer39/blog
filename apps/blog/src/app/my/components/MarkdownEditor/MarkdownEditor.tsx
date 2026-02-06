'use client';

import type { AIModelSettings, AIToolsStatus } from '@blog/cms-types';
import { FullscreenModal, TooltipProvider } from '@blog/ui';
import { GripVertical } from 'lucide-react';
import { useRef, useState } from 'react';
import { ArticleContent } from '@/components/ArticleContent';
import { useI18n } from '@/i18n';
import { EmojiSuggester } from '../EmojiSuggester';
import { TextTransformPopover } from '../TextTransformPopover';
import { EditorToolbar } from './components';
import {
  useContinuationSuggestion,
  useImageHandler,
  useResizableSplit,
  useTextOperations,
} from './hooks';

type PreviewMode = 'edit' | 'preview' | 'split';

/**
 * マークダウンエディタのProps。
 *
 * 分割ビュー、ツールバー、画像ペースト/D&D、AI続き生成、
 * テキスト変換、絵文字サジェスト、フルスクリーン対応。
 */
interface MarkdownEditorProps {
  /** マークダウンコンテンツ (controlled) */
  value: string;
  /** コンテンツ変更時のコールバック */
  onChange: (value: string) => void;
  /** 画像アップロードハンドラ。URLを返す */
  onImageUpload: (file: File) => Promise<string>;
  /** AI続き生成のコンテキスト用タイトル */
  title?: string;
  /** AI機能のモデル設定 */
  aiSettings?: AIModelSettings;
  /** AI Tools の API Key ステータス */
  aiToolsStatus?: AIToolsStatus | null;
}

export function MarkdownEditor({
  value,
  onChange,
  onImageUpload,
  title,
  aiSettings,
  aiToolsStatus,
}: MarkdownEditorProps) {
  const { messages } = useI18n();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Custom hooks
  const { insertTextAtCursor, wrapSelection } = useTextOperations({
    textareaRef,
    value,
    onChange,
  });

  useImageHandler({
    textareaRef,
    onImageUpload,
    insertTextAtCursor,
    setIsUploading,
  });

  const { splitRatio, isDragging, handleMouseDown } = useResizableSplit({
    containerRef,
  });

  const {
    splitRatio: fullscreenSplitRatio,
    isDragging: isFullscreenDragging,
    handleMouseDown: handleFullscreenMouseDown,
  } = useResizableSplit({
    containerRef: fullscreenContainerRef,
  });

  const {
    isSuggesting,
    suggestions,
    suggestionError,
    isSuggestionOpen,
    selectedLength,
    setIsSuggestionOpen,
    handleSuggestContinuation,
    handleAcceptSuggestion,
  } = useContinuationSuggestion({
    textareaRef,
    title,
    value,
    aiSettings,
    insertTextAtCursor,
  });

  const handleEmojiSelect = (emoji: string) => {
    insertTextAtCursor(emoji);
    setIsEmojiPickerOpen(false);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col overflow-hidden rounded-md border">
        {/* Toolbar */}
        <EditorToolbar
          previewMode={previewMode}
          onPreviewModeChange={setPreviewMode}
          onFullscreen={() => setIsFullscreen(true)}
          onInsertText={insertTextAtCursor}
          onWrapSelection={wrapSelection}
          isEmojiPickerOpen={isEmojiPickerOpen}
          onEmojiPickerOpenChange={setIsEmojiPickerOpen}
          onEmojiSelect={handleEmojiSelect}
          aiToolsStatus={aiToolsStatus}
          title={title}
          isSuggesting={isSuggesting}
          suggestions={suggestions}
          suggestionError={suggestionError}
          isSuggestionOpen={isSuggestionOpen}
          selectedLength={selectedLength}
          onSuggestionOpenChange={setIsSuggestionOpen}
          onSuggestContinuation={handleSuggestContinuation}
          onAcceptSuggestion={handleAcceptSuggestion}
        />

        {/* Character Count */}
        <div className="flex items-center justify-end border-b bg-muted/30 px-3 py-1">
          <span className="text-xs text-muted-foreground">
            {messages.editor.characters.replace(
              '{count}',
              value.length.toLocaleString()
            )}
          </span>
        </div>

        {/* Editor Area */}
        <div
          ref={containerRef}
          className={`flex min-h-[500px] ${isDragging ? 'select-none' : ''}`}
        >
          {(previewMode === 'edit' || previewMode === 'split') && (
            <div
              className="relative"
              style={{
                width: previewMode === 'split' ? `${splitRatio}%` : '100%',
                flexShrink: 0,
              }}
            >
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-full w-full resize-none bg-background p-4 font-mono text-sm focus:outline-none"
                placeholder={messages.editor.contentPlaceholder}
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <div className="text-muted-foreground">
                    {messages.editor.uploadingImage}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Resizable Divider */}
          {previewMode === 'split' && (
            <button
              type="button"
              aria-label="Resize editor and preview panels"
              onMouseDown={handleMouseDown}
              className={`group flex w-2 cursor-col-resize items-center justify-center border-x bg-muted/30 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary ${isDragging ? 'bg-primary/20' : ''}`}
            >
              <GripVertical className="h-6 w-4 text-muted-foreground/50 group-hover:text-muted-foreground" />
            </button>
          )}
          {(previewMode === 'preview' || previewMode === 'split') && (
            <div
              className="overflow-auto bg-background p-4"
              style={{
                width:
                  previewMode === 'split' ? `${100 - splitRatio}%` : '100%',
                flexGrow: previewMode === 'preview' ? 1 : 0,
              }}
            >
              <ArticleContent content={value} />
            </div>
          )}
        </div>
      </div>

      {/* Emoji Suggester */}
      <EmojiSuggester
        textareaRef={textareaRef}
        value={value}
        onChange={onChange}
      />

      {/* Text Transform Popover */}
      <TextTransformPopover
        textareaRef={textareaRef}
        value={value}
        onChange={onChange}
        model={aiSettings?.transform}
        disabled={!aiToolsStatus?.hasAnyKey}
      />

      {/* Fullscreen Modal */}
      <FullscreenModal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title={messages.editor.contentEditorTitle.replace(
          '{count}',
          value.length.toLocaleString()
        )}
        closeLabel={messages.common.close}
      >
        <div
          ref={fullscreenContainerRef}
          className={`flex h-full ${isFullscreenDragging ? 'select-none' : ''}`}
        >
          <div
            className="flex flex-col"
            style={{ width: `${fullscreenSplitRatio}%`, flexShrink: 0 }}
          >
            <textarea
              ref={fullscreenTextareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="h-full w-full flex-1 resize-none rounded-lg border bg-background p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Write your article in Markdown..."
            />
          </div>
          {/* Resizable Divider */}
          <button
            type="button"
            aria-label="Resize editor and preview panels"
            onMouseDown={handleFullscreenMouseDown}
            className={`group mx-1 flex w-3 cursor-col-resize items-center justify-center rounded-full bg-muted/50 transition-colors hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary ${isFullscreenDragging ? 'bg-primary/30' : ''}`}
          >
            <GripVertical className="h-8 w-4 text-muted-foreground/70 group-hover:text-muted-foreground" />
          </button>
          <div
            className="overflow-auto rounded-lg border bg-background p-4"
            style={{ width: `${100 - fullscreenSplitRatio}%` }}
          >
            <ArticleContent content={value} />
          </div>
        </div>
      </FullscreenModal>
    </TooltipProvider>
  );
}
