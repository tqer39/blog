import type {
  AIModelSettings,
  ContinuationLength,
  ContinuationSuggestion,
} from '@blog/cms-types';
import { type RefObject, useCallback, useEffect, useState } from 'react';
import { suggestContinuation } from '@/lib/api/client';

interface UseContinuationSuggestionProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  title?: string;
  value: string;
  aiSettings?: AIModelSettings;
  insertTextAtCursor: (text: string) => void;
}

interface UseContinuationSuggestionReturn {
  isSuggesting: boolean;
  suggestions: ContinuationSuggestion[];
  suggestionError: string | null;
  isSuggestionOpen: boolean;
  selectedLength: ContinuationLength;
  setIsSuggestionOpen: (value: boolean) => void;
  handleSuggestContinuation: (length?: ContinuationLength) => Promise<void>;
  handleAcceptSuggestion: (text: string) => void;
}

export function useContinuationSuggestion({
  textareaRef,
  title,
  value,
  aiSettings,
  insertTextAtCursor,
}: UseContinuationSuggestionProps): UseContinuationSuggestionReturn {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<ContinuationSuggestion[]>([]);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [selectedLength, setSelectedLength] =
    useState<ContinuationLength>('medium');

  const handleSuggestContinuation = useCallback(
    async (length: ContinuationLength = selectedLength) => {
      const textarea = textareaRef.current;
      if (!textarea || !title?.trim()) {
        setSuggestionError('タイトルを入力してください');
        return;
      }

      const cursorPosition = textarea.selectionStart;

      setIsSuggesting(true);
      setSuggestionError(null);
      setSuggestions([]);
      setIsSuggestionOpen(true);
      setSelectedLength(length);

      try {
        const result = await suggestContinuation({
          title: title.trim(),
          content: value,
          cursorPosition,
          length,
          model: aiSettings?.continuation,
        });
        setSuggestions(result.suggestions);
      } catch (err) {
        setSuggestionError(
          err instanceof Error ? err.message : 'Failed to generate suggestions'
        );
      } finally {
        setIsSuggesting(false);
      }
    },
    [title, value, selectedLength, aiSettings, textareaRef]
  );

  const handleAcceptSuggestion = useCallback(
    (text: string) => {
      insertTextAtCursor(text);
      setIsSuggestionOpen(false);
      setSuggestions([]);
    },
    [insertTextAtCursor]
  );

  // Keyboard shortcut for AI continuation (Cmd+J / Ctrl+J)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        if (!isSuggesting && title?.trim()) {
          handleSuggestContinuation();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSuggestContinuation, isSuggesting, title]);

  return {
    isSuggesting,
    suggestions,
    suggestionError,
    isSuggestionOpen,
    selectedLength,
    setIsSuggestionOpen,
    handleSuggestContinuation,
    handleAcceptSuggestion,
  };
}
