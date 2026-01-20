'use client';

import type {
  AnthropicModel,
  TransformAction,
  TransformLanguage,
} from '@blog/cms-types';
import { Button } from '@blog/ui';
import {
  ArrowRightLeft,
  CaseSensitive,
  Expand,
  FileText,
  Languages,
  type LucideIcon,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { transformText } from '@/lib/api/client';
import { AlertBox } from './AlertBox';
import { LoadingState } from './LoadingState';

interface TextTransformPopoverProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  model?: AnthropicModel;
}

interface TransformOption {
  action: TransformAction;
  label: string;
  icon: LucideIcon;
  description: string;
}

const TRANSFORM_OPTIONS: TransformOption[] = [
  {
    action: 'rewrite',
    label: '書き直し',
    icon: RefreshCw,
    description: 'より簡潔で明確に',
  },
  {
    action: 'expand',
    label: '展開',
    icon: Expand,
    description: 'より詳細に説明',
  },
  {
    action: 'summarize',
    label: '要約',
    icon: FileText,
    description: '短くまとめる',
  },
  {
    action: 'translate',
    label: '翻訳',
    icon: Languages,
    description: '英語⇔日本語',
  },
  {
    action: 'formal',
    label: 'フォーマル',
    icon: CaseSensitive,
    description: '丁寧な文体に',
  },
  {
    action: 'casual',
    label: 'カジュアル',
    icon: MessageSquare,
    description: 'くだけた文体に',
  },
];

export function TextTransformPopover({
  textareaRef,
  value,
  onChange,
  model,
}: TextTransformPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformedText, setTransformedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Detect text selection
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleSelectionChange = () => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.substring(start, end);

      if (selected.length > 0 && document.activeElement === textarea) {
        setSelectedText(selected);
        setSelectionStart(start);
        setSelectionEnd(end);

        // Calculate position for popover
        const textareaRect = textarea.getBoundingClientRect();
        const lineHeight = 20; // approximate line height
        const charsPerLine = Math.floor(textarea.clientWidth / 8); // approximate chars per line
        const selectionLine = Math.floor((start + end) / 2 / charsPerLine);

        // Position above the selection
        const top =
          textareaRect.top +
          window.scrollY +
          selectionLine * lineHeight -
          textarea.scrollTop;
        const left =
          textareaRect.left +
          window.scrollX +
          ((start % charsPerLine) * 8 + (end % charsPerLine) * 8) / 2;

        setPosition({
          top: Math.max(top - 10, textareaRect.top + window.scrollY),
          left: Math.min(
            Math.max(left, textareaRect.left + window.scrollX + 50),
            textareaRect.right + window.scrollX - 200
          ),
        });

        setIsOpen(true);
        setTransformedText(null);
        setError(null);
      } else {
        // Delay closing to allow clicking on popover
        setTimeout(() => {
          if (
            document.activeElement !== textarea &&
            !popoverRef.current?.contains(document.activeElement)
          ) {
            setIsOpen(false);
          }
        }, 200);
      }
    };

    // Listen for both mouseup and keyup to detect selection changes
    textarea.addEventListener('mouseup', handleSelectionChange);
    textarea.addEventListener('keyup', handleSelectionChange);

    return () => {
      textarea.removeEventListener('mouseup', handleSelectionChange);
      textarea.removeEventListener('keyup', handleSelectionChange);
    };
  }, [textareaRef, value]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        textareaRef.current !== target
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [textareaRef]);

  const handleTransform = useCallback(
    async (action: TransformAction) => {
      if (!selectedText) return;

      setIsTransforming(true);
      setError(null);
      setTransformedText(null);

      try {
        // Detect language for translation
        let targetLanguage: TransformLanguage | undefined;
        if (action === 'translate') {
          // Simple heuristic: if mostly ASCII, translate to Japanese; otherwise to English
          let asciiCount = 0;
          for (const char of selectedText) {
            if (char.charCodeAt(0) <= 127) {
              asciiCount++;
            }
          }
          const asciiRatio = asciiCount / selectedText.length;
          targetLanguage = asciiRatio > 0.5 ? 'ja' : 'en';
        }

        const result = await transformText({
          text: selectedText,
          action,
          targetLanguage,
          model,
        });

        setTransformedText(result.result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to transform text'
        );
      } finally {
        setIsTransforming(false);
      }
    },
    [selectedText, model]
  );

  const handleApply = useCallback(() => {
    if (!transformedText) return;

    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionEnd);
    onChange(before + transformedText + after);

    setIsOpen(false);
    setTransformedText(null);

    // Restore focus to textarea
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        textarea.selectionStart = selectionStart;
        textarea.selectionEnd = selectionStart + transformedText.length;
      }
    });
  }, [
    transformedText,
    value,
    selectionStart,
    selectionEnd,
    onChange,
    textareaRef,
  ]);

  if (!isOpen || !selectedText) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 animate-in fade-in-0 zoom-in-95"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="rounded-lg border bg-popover shadow-lg">
        {!transformedText && !isTransforming && !error && (
          <div className="flex items-center gap-1 p-1">
            {TRANSFORM_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.action}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => handleTransform(option.action)}
                  title={option.description}
                >
                  <Icon className="mr-1 h-3 w-3" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        )}

        {isTransforming && (
          <LoadingState
            message="変換中..."
            size="sm"
            messagePosition="beside"
          />
        )}

        {error && (
          <div className="max-w-sm p-3">
            <AlertBox>{error}</AlertBox>
            <div className="mt-2 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setError(null);
                }}
              >
                戻る
              </Button>
            </div>
          </div>
        )}

        {transformedText && (
          <div className="max-w-md p-3">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              変換結果:
            </div>
            <div className="max-h-40 overflow-y-auto rounded-md border bg-muted/50 p-2 text-sm">
              <p className="whitespace-pre-wrap">{transformedText}</p>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTransformedText(null);
                }}
              >
                戻る
              </Button>
              <Button size="sm" onClick={handleApply}>
                <ArrowRightLeft className="mr-1 h-3 w-3" />
                置換
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
