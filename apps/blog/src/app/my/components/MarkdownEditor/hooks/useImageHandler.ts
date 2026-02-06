import { type RefObject, useEffect } from 'react';

interface UseImageHandlerProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onImageUpload: (file: File) => Promise<string>;
  insertTextAtCursor: (text: string) => void;
  setIsUploading: (value: boolean) => void;
}

export function useImageHandler({
  textareaRef,
  onImageUpload,
  insertTextAtCursor,
  setIsUploading,
}: UseImageHandlerProps) {
  // Handle paste events for images
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          setIsUploading(true);
          try {
            const url = await onImageUpload(file);
            insertTextAtCursor(`![](${url})`);
          } catch (err) {
            alert(
              err instanceof Error ? err.message : 'Failed to upload image'
            );
          } finally {
            setIsUploading(false);
          }
          break;
        }
      }
    };

    textarea.addEventListener('paste', handlePaste);
    return () => textarea.removeEventListener('paste', handlePaste);
  }, [onImageUpload, insertTextAtCursor, textareaRef, setIsUploading]);

  // Handle drag and drop
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer?.files;
      if (!files?.length) return;

      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          setIsUploading(true);
          try {
            const url = await onImageUpload(file);
            insertTextAtCursor(`![](${url})\n`);
          } catch (err) {
            alert(
              err instanceof Error ? err.message : 'Failed to upload image'
            );
          } finally {
            setIsUploading(false);
          }
        }
      }
    };

    textarea.addEventListener('dragover', handleDragOver);
    textarea.addEventListener('drop', handleDrop);
    return () => {
      textarea.removeEventListener('dragover', handleDragOver);
      textarea.removeEventListener('drop', handleDrop);
    };
  }, [onImageUpload, insertTextAtCursor, textareaRef, setIsUploading]);
}
