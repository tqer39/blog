'use client';

interface PixelRunnerProps {
  isRunning: boolean;
  isFinished?: boolean;
}

/**
 * A sushi character that runs across the timer track.
 */
export function PixelRunner({
  isRunning,
  isFinished = false,
}: PixelRunnerProps) {
  return (
    <div
      className={`text-xl select-none ${isRunning ? 'animate-bounce' : ''} ${isFinished ? 'animate-spin' : ''}`}
      style={{
        animationDuration: isRunning ? '0.3s' : '0.5s',
      }}
      aria-hidden="true"
    >
      {isFinished ? '🎉' : '🍣'}
    </div>
  );
}
