'use client';

import { Flag, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PixelRunner } from './PixelRunner';

interface SlideTimerProps {
  /** Total duration in seconds */
  duration: number;
  /** Whether the slide viewer is open */
  isOpen: boolean;
  /** Current slide index (0-based) */
  currentSlide: number;
  /** Total number of slides */
  totalSlides: number;
  /** Callback when time runs out */
  onTimeUp?: () => void;
}

/**
 * Formats seconds to MM:SS display
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function SlideTimer({
  duration,
  isOpen,
  currentSlide,
  totalSlides,
  onTimeUp,
}: SlideTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep onTimeUp ref updated
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Reset timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setRemaining(duration);
      setIsPaused(false);
      setIsFinished(false);
    }
  }, [isOpen, duration]);

  // Timer countdown logic
  useEffect(() => {
    if (!isOpen || isPaused || isFinished) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsFinished(true);
          onTimeUpRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen, isPaused, isFinished]);

  const togglePause = useCallback(() => {
    if (!isFinished) {
      setIsPaused((prev) => !prev);
    }
  }, [isFinished]);

  // Calculate time progress percentage (0 to 100)
  const elapsed = duration - remaining;
  const timeProgress = Math.min((elapsed / duration) * 100, 100);

  // Calculate slide progress percentage (0 to 100)
  const slideProgress =
    totalSlides > 1 ? (currentSlide / (totalSlides - 1)) * 100 : 100;

  // Determine time display color based on remaining time
  const timeColorClass =
    remaining <= 30
      ? 'text-red-500'
      : remaining <= 60
        ? 'text-amber-500'
        : 'text-stone-600 dark:text-stone-400';

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-700">
      {/* Two tracks container */}
      <div className="flex-1 flex flex-col gap-1">
        {/* Time track with cat */}
        <div className="relative h-6 flex items-center pr-10">
          {/* Track background */}
          <div className="absolute left-0 right-10 h-1 bg-stone-200 dark:bg-stone-700 rounded-full" />

          {/* Progress track */}
          <div
            className="absolute left-0 h-1 bg-amber-400 dark:bg-amber-500 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `calc((100% - 2.5rem) * ${timeProgress / 100})` }}
          />

          {/* Cat runner */}
          <div
            className="absolute transition-all duration-1000 ease-linear"
            style={{
              left: `calc((100% - 2.5rem) * ${timeProgress / 100} - 10px)`,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <PixelRunner
              isRunning={!isPaused && !isFinished}
              isFinished={isFinished}
              emoji="🐱"
            />
          </div>

          {/* Finish flag */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <Flag
              className={`h-4 w-4 ${isFinished ? 'text-amber-500' : 'text-stone-400 dark:text-stone-500'}`}
            />
          </div>
        </div>

        {/* Slide progress track with fish */}
        <div className="relative h-6 flex items-center pr-10">
          {/* Track background */}
          <div className="absolute left-0 right-10 h-1 bg-stone-200 dark:bg-stone-700 rounded-full" />

          {/* Progress track */}
          <div
            className="absolute left-0 h-1 bg-blue-400 dark:bg-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `calc((100% - 2.5rem) * ${slideProgress / 100})` }}
          />

          {/* Fish runner */}
          <div
            className="absolute transition-all duration-300 ease-out"
            style={{
              left: `calc((100% - 2.5rem) * ${slideProgress / 100} - 10px)`,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <span className="text-lg select-none" aria-hidden="true">
              🐟
            </span>
          </div>

          {/* Slide counter */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-mono tabular-nums text-stone-500 dark:text-stone-400">
            {currentSlide + 1}/{totalSlides}
          </div>
        </div>
      </div>

      {/* Info display */}
      <div className="flex flex-col items-end gap-0.5 min-w-17.5">
        {/* Time display */}
        <div className={`font-mono text-sm tabular-nums ${timeColorClass}`}>
          {isFinished ? (
            <span className="animate-pulse">Done!</span>
          ) : (
            formatTime(remaining)
          )}
        </div>
      </div>

      {/* Pause/Play button */}
      <button
        type="button"
        onClick={togglePause}
        disabled={isFinished}
        className="cursor-pointer p-1.5 rounded-md text-stone-500 hover:text-stone-700 hover:bg-stone-200 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
      >
        {isPaused ? (
          <Play className="h-4 w-4" />
        ) : (
          <Pause className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
