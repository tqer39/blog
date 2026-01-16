'use client';

interface PixelRunnerProps {
  isRunning: boolean;
  isFinished?: boolean;
  emoji?: string;
}

/**
 * An emoji character that moves across the timer track.
 */
export function PixelRunner({
  isRunning,
  isFinished = false,
  emoji = '🐱',
}: PixelRunnerProps) {
  return (
    <div
      className={`text-lg select-none ${isRunning ? 'animate-pulse-slow' : ''} ${isFinished ? 'animate-spin' : ''}`}
      style={{
        animationDuration: isFinished ? '0.5s' : '5s',
      }}
      aria-hidden="true"
    >
      {isFinished ? '🎉' : emoji}
    </div>
  );
}
