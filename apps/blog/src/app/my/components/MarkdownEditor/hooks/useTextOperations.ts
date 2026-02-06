import { type RefObject, useCallback } from 'react';

interface UseTextOperationsProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
}

export function useTextOperations({
  textareaRef,
  value,
  onChange,
}: UseTextOperationsProps) {
  const insertTextAtCursor = useCallback(
    (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = value.substring(0, start);
      const after = value.substring(end);
      const newValue = before + text + after;

      onChange(newValue);

      // Set cursor position after inserted text
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
      });
    },
    [value, onChange, textareaRef]
  );

  const wrapSelection = useCallback(
    (before: string, after: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);
      const newValue = beforeText + before + selectedText + after + afterText;

      onChange(newValue);

      requestAnimationFrame(() => {
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = end + before.length;
        textarea.focus();
      });
    },
    [value, onChange, textareaRef]
  );

  return { insertTextAtCursor, wrapSelection };
}
