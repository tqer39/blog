'use client';

import { cn } from '@blog/utils';
import { useCallback, useRef, useState } from 'react';

interface ImageData {
  alt: string;
  src: string;
}

interface ImageCompareProps {
  content: string;
  className?: string;
}

/**
 * Parses markdown-style image syntax from the content.
 * Expects exactly 2 images: ![Before](url) and ![After](url)
 */
function parseImages(content: string): ImageData[] {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images: ImageData[] = [];
  let match: RegExpExecArray | null;

  match = imageRegex.exec(content);
  while (match !== null) {
    images.push({
      alt: match[1] || '',
      src: match[2],
    });
    match = imageRegex.exec(content);
  }

  return images;
}

export function ImageCompare({ content, className }: ImageCompareProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const images = parseImages(content);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    },
    [handleMove]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    },
    [isDragging, handleMove]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Click anywhere to move slider
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientX);
    },
    [handleMove]
  );

  if (images.length < 2) {
    return (
      <div className="my-4 rounded-lg border border-dashed border-muted-foreground/50 p-4 text-center text-muted-foreground">
        Before/After比較には2枚の画像が必要です。
        <br />
        <code className="text-xs">
          ![Before](url1)
          <br />
          ![After](url2)
        </code>
      </div>
    );
  }

  const [beforeImage, afterImage] = images;

  return (
    <div className={cn('my-4', className)}>
      <div
        ref={containerRef}
        className="relative cursor-ew-resize select-none overflow-hidden rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        role="slider"
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Image comparison slider"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            setPosition((p) => Math.max(0, p - 5));
          } else if (e.key === 'ArrowRight') {
            setPosition((p) => Math.min(100, p + 5));
          }
        }}
      >
        {/* After image (full width, background) */}
        {/* biome-ignore lint/performance/noImgElement: External URLs from user content require native img element */}
        <img
          src={afterImage.src}
          alt={afterImage.alt || 'After'}
          className="block w-full"
          draggable={false}
        />

        {/* Before image (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          {/* biome-ignore lint/performance/noImgElement: External URLs from user content require native img element */}
          <img
            src={beforeImage.src}
            alt={beforeImage.alt || 'Before'}
            className="block h-full w-auto max-w-none"
            style={{
              width: containerRef.current
                ? `${containerRef.current.offsetWidth}px`
                : '100%',
            }}
            draggable={false}
          />
        </div>

        {/* Slider line */}
        <div
          className="absolute bottom-0 top-0 w-1 bg-white shadow-lg"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          {/* Handle */}
          <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
            <svg
              className="h-6 w-6 text-stone-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-label="Drag to compare"
              role="img"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="mt-2 flex justify-between text-sm text-stone-600 dark:text-stone-400">
        <span>{beforeImage.alt || 'Before'}</span>
        <span>{afterImage.alt || 'After'}</span>
      </div>
    </div>
  );
}
