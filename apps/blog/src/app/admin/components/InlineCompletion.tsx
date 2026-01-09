'use client';

import type { AnthropicModel } from '@blog/cms-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { suggestContinuation } from '@/lib/api/client';

interface InlineCompletionProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  title?: string;
  enabled?: boolean;
  model?: AnthropicModel;
}

// Calculate the position of the cursor in pixels within a textarea
function getCaretCoordinates(
  textarea: HTMLTextAreaElement,
  position: number
): { top: number; left: number } {
  // Create a mirror div to calculate position
  const mirror = document.createElement('div');
  const computed = getComputedStyle(textarea);

  // Copy textarea styles to mirror
  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.wordWrap = 'break-word';
  mirror.style.overflow = 'hidden';

  // Copy relevant styles
  const properties = [
    'fontFamily',
    'fontSize',
    'fontWeight',
    'fontStyle',
    'letterSpacing',
    'textTransform',
    'wordSpacing',
    'textIndent',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'boxSizing',
    'lineHeight',
  ] as const;

  for (const prop of properties) {
    mirror.style[prop] = computed[prop];
  }

  mirror.style.width = `${textarea.clientWidth}px`;

  // Set content up to cursor position
  const textBeforeCursor = textarea.value.substring(0, position);
  mirror.textContent = textBeforeCursor;

  // Add a span at the cursor position to measure
  const span = document.createElement('span');
  span.textContent = '|';
  mirror.appendChild(span);

  document.body.appendChild(mirror);

  const spanRect = span.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();

  const top = spanRect.top - mirrorRect.top;
  const left = spanRect.left - mirrorRect.left;

  document.body.removeChild(mirror);

  return { top, left };
}

export function InlineCompletion({
  textareaRef,
  value,
  onChange,
  title,
  enabled = true,
  model,
}: InlineCompletionProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastValueRef = useRef(value);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clear suggestion when value changes
  useEffect(() => {
    if (value !== lastValueRef.current) {
      setSuggestion(null);
      lastValueRef.current = value;
    }
  }, [value]);

  // Debounced fetch suggestion
  const fetchSuggestion = useCallback(async () => {
    const textarea = textareaRef.current;
    if (!textarea || !title?.trim() || !enabled) return;

    const cursor = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursor);

    // Don't suggest if cursor is not at the end of a line or content
    const textAfterCursor = value.substring(cursor);
    if (textAfterCursor.length > 0 && !textAfterCursor.startsWith('\n')) {
      return;
    }

    // Don't suggest if no content yet or just whitespace before cursor
    if (!textBeforeCursor.trim()) {
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setCursorPosition(cursor);

    try {
      const result = await suggestContinuation({
        title: title.trim(),
        content: value,
        cursorPosition: cursor,
        length: 'short',
        model,
      });

      // Only show suggestion if we're still at the same position
      if (textareaRef.current?.selectionStart === cursor) {
        const topSuggestion = result.suggestions[0];
        if (topSuggestion && topSuggestion.confidence > 0.5) {
          setSuggestion(topSuggestion.text);

          // Calculate position for ghost text
          const coords = getCaretCoordinates(textarea, cursor);
          setPosition({
            top: coords.top - textarea.scrollTop,
            left: coords.left,
          });
        }
      }
    } catch (err) {
      // Silently ignore errors for inline completion
      if (err instanceof Error && err.name !== 'AbortError') {
        console.debug('Inline completion error:', err.message);
      }
    }
  }, [textareaRef, title, value, enabled, model]);

  // Handle input changes with debounce
  useEffect(() => {
    if (!enabled) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Clear current suggestion
      setSuggestion(null);

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestion();
      }, 800); // 800ms debounce
    };

    textarea.addEventListener('input', handleInput);

    return () => {
      textarea.removeEventListener('input', handleInput);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [textareaRef, fetchSuggestion, enabled]);

  // Handle Tab to accept, Esc to dismiss
  useEffect(() => {
    if (!suggestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && suggestion) {
        e.preventDefault();
        // Insert suggestion at cursor position
        const before = value.substring(0, cursorPosition);
        const after = value.substring(cursorPosition);
        onChange(before + suggestion + after);
        setSuggestion(null);

        // Move cursor to end of inserted text
        requestAnimationFrame(() => {
          const textarea = textareaRef.current;
          if (textarea) {
            const newPosition = cursorPosition + suggestion.length;
            textarea.selectionStart = newPosition;
            textarea.selectionEnd = newPosition;
            textarea.focus();
          }
        });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSuggestion(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [suggestion, value, cursorPosition, onChange, textareaRef]);

  // Clear suggestion when clicking elsewhere
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (textareaRef.current && e.target !== textareaRef.current) {
        setSuggestion(null);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [textareaRef]);

  // Clear on scroll
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleScroll = () => {
      if (suggestion) {
        // Recalculate position on scroll
        const coords = getCaretCoordinates(textarea, cursorPosition);
        setPosition({
          top: coords.top - textarea.scrollTop,
          left: coords.left,
        });
      }
    };

    textarea.addEventListener('scroll', handleScroll);
    return () => textarea.removeEventListener('scroll', handleScroll);
  }, [textareaRef, suggestion, cursorPosition]);

  if (!suggestion || !enabled) return null;

  const textarea = textareaRef.current;
  if (!textarea) return null;

  const textareaRect = textarea.getBoundingClientRect();
  const paddingTop =
    Number.parseInt(getComputedStyle(textarea).paddingTop, 10) || 0;
  const paddingLeft =
    Number.parseInt(getComputedStyle(textarea).paddingLeft, 10) || 0;

  // Limit suggestion display length
  const displaySuggestion =
    suggestion.length > 200 ? `${suggestion.substring(0, 200)}...` : suggestion;

  return (
    <div
      className="pointer-events-none absolute overflow-hidden"
      style={{
        top: textareaRect.top + window.scrollY + paddingTop + position.top,
        left: textareaRect.left + window.scrollX + paddingLeft + position.left,
        maxWidth: textareaRect.width - paddingLeft - position.left - 20,
        maxHeight: textareaRect.height - paddingTop - position.top - 20,
        zIndex: 10,
      }}
    >
      <span
        className="whitespace-pre-wrap font-mono text-sm text-muted-foreground/50"
        style={{
          fontFamily: getComputedStyle(textarea).fontFamily,
          fontSize: getComputedStyle(textarea).fontSize,
          lineHeight: getComputedStyle(textarea).lineHeight,
        }}
      >
        {displaySuggestion}
      </span>
      <span className="ml-2 rounded bg-muted px-1 text-xs text-muted-foreground">
        Tab で挿入
      </span>
    </div>
  );
}
