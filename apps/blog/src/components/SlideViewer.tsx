'use client';

import { FullscreenModal } from '@blog/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArticleContent } from './ArticleContent';
import { SlideTimer } from './SlideTimer';

/** Default timer duration in seconds (3 minutes) */
const DEFAULT_DURATION = 180;

interface SlideViewerProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title: string;
  /** Timer duration in seconds, null means use default (180 seconds) */
  slideDuration?: number | null;
}

/**
 * Split markdown content into slides by `---` delimiter.
 * Handles code blocks correctly by not splitting inside them.
 */
function splitIntoSlides(content: string): string[] {
  const lines = content.split('\n');
  const slides: string[] = [];
  let currentSlide: string[] = [];
  let inCodeBlock = false;
  let codeBlockDelimiter = '';

  for (const line of lines) {
    // Check for code fence start/end (``` or ~~~)
    const fenceMatch = line.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockDelimiter = fenceMatch[1][0]; // ` or ~
      } else if (line.startsWith(codeBlockDelimiter.repeat(3))) {
        inCodeBlock = false;
        codeBlockDelimiter = '';
      }
    }

    // Check for slide separator (only if not in code block)
    // Match `---` at the start of line (with optional trailing whitespace)
    if (!inCodeBlock && /^---+\s*$/.test(line)) {
      if (currentSlide.length > 0) {
        slides.push(currentSlide.join('\n').trim());
        currentSlide = [];
      }
      continue;
    }

    currentSlide.push(line);
  }

  // Don't forget the last slide
  if (currentSlide.length > 0) {
    slides.push(currentSlide.join('\n').trim());
  }

  return slides.filter((slide) => slide.length > 0);
}

export function SlideViewer({
  isOpen,
  onClose,
  content,
  title,
  slideDuration,
}: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const slides = useMemo(() => splitIntoSlides(content), [content]);

  // Reset to first slide when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          event.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          event.preventDefault();
          goPrev();
          break;
        case 'Home':
          event.preventDefault();
          setCurrentSlide(0);
          break;
        case 'End':
          event.preventDefault();
          setCurrentSlide(slides.length - 1);
          break;
      }
    },
    [goNext, goPrev, slides.length]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Touch/swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null) return;
      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStart - touchEnd;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          goNext();
        } else {
          goPrev();
        }
      }
      setTouchStart(null);
    },
    [touchStart, goNext, goPrev]
  );

  if (!isOpen || slides.length === 0) return null;

  return (
    <FullscreenModal isOpen={isOpen} onClose={onClose} title={title}>
      <div
        className="flex h-full flex-col"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slide content area */}
        <div className="flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-8 lg:p-12">
          <div className="slide-content w-full max-w-5xl">
            <ArticleContent content={slides[currentSlide]} keepFirstH1 />
          </div>
        </div>

        {/* Timer */}
        <SlideTimer
          duration={slideDuration ?? DEFAULT_DURATION}
          isOpen={isOpen}
          currentSlide={currentSlide}
          totalSlides={slides.length}
        />

        {/* Navigation controls */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentSlide === 0}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-stone-400 dark:hover:bg-stone-800"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-stone-400 dark:hover:bg-stone-800"
            aria-label="Next slide"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </FullscreenModal>
  );
}
