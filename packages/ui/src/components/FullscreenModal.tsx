'use client';

import { cn } from '@blog/utils';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEscapeKey } from '../hooks';

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  headerActions?: React.ReactNode;
  headerClassName?: string;
}

export function FullscreenModal({
  isOpen,
  onClose,
  children,
  title,
  headerActions,
  headerClassName,
}: FullscreenModalProps) {
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-white dark:bg-stone-900">
      <div
        className={cn(
          'flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-700',
          headerClassName
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {typeof title === 'string' ? (
            <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
              {title}
            </span>
          ) : (
            title
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {headerActions}
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10 text-inherit"
            aria-label="Close fullscreen"
          >
            <span className="text-xs">Close</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden h-full">{children}</div>
    </div>,
    document.body
  );
}
