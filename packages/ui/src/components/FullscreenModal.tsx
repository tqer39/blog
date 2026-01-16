'use client';

import { X } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function FullscreenModal({
  isOpen,
  onClose,
  children,
  title,
}: FullscreenModalProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-white dark:bg-stone-900">
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-700">
        {title && (
          <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
            {title}
          </span>
        )}
        {!title && <div />}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
          aria-label="Close fullscreen"
        >
          <span className="text-sm">Close</span>
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>,
    document.body
  );
}
