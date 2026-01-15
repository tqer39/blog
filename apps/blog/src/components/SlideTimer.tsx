'use client';

import { Flag, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PixelRunner } from './PixelRunner';

interface SlideTimerProps {
  /** Total duration in seconds */
  duration: number;
  /** Whether the slide viewer is open */
  isOpen: boolean;
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

export function SlideTimer({ duration, isOpen, onTimeUp }: SlideTimerProps) {
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

  // Calculate progress percentage (0 to 100)
  const elapsed = duration - remaining;
  const progress = Math.min((elapsed / duration) * 100, 100);

  // Determine time display color based on remaining time
  const timeColorClass =
    remaining <= 30
      ? 'text-red-500'
      : remaining <= 60
        ? 'text-amber-500'
        : 'text-stone-600 dark:text-stone-400';

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-700">
      {/* Track with runner */}
      <div className="relative flex-1 h-6 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1 bg-stone-200 dark:bg-stone-700 rounded-full" />

        {/* Progress track */}
        <div
          className="absolute left-0 h-1 bg-amber-400 dark:bg-amber-500 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />

        {/* Runner character */}
        <div
          className="absolute transition-all duration-1000 ease-linear"
          style={{
            left: `calc(${progress}% - 8px)`,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <PixelRunner
            isRunning={!isPaused && !isFinished}
            isFinished={isFinished}
          />
        </div>

        {/* Finish flag */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <Flag
            className={`h-4 w-4 ${isFinished ? 'text-amber-500' : 'text-stone-400 dark:text-stone-500'}`}
          />
        </div>
      </div>

      {/* Time display */}
      <div className={`font-mono text-sm tabular-nums ${timeColorClass}`}>
        {isFinished ? (
          <span className="animate-pulse">Time&apos;s up!</span>
        ) : (
          formatTime(remaining)
        )}
      </div>

      {/* Pause/Play button */}
      <button
        type="button"
        onClick={togglePause}
        disabled={isFinished}
        className="p-1.5 rounded-md text-stone-500 hover:text-stone-700 hover:bg-stone-200 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
