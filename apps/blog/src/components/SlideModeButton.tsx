'use client';

import { Presentation } from 'lucide-react';
import { useState } from 'react';
import { SlideViewer } from './SlideViewer';

interface SlideModeButtonProps {
  content: string;
  title: string;
  /** Timer duration in seconds, null means use default (180 seconds) */
  slideDuration?: number | null;
}

export function SlideModeButton({
  content,
  title,
  slideDuration,
}: SlideModeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-sm text-stone-700 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
        aria-label="スライドモードで表示"
      >
        <Presentation className="h-4 w-4" />
        <span>スライド</span>
      </button>
      <SlideViewer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={content}
        title={title}
        slideDuration={slideDuration}
      />
    </>
  );
}
