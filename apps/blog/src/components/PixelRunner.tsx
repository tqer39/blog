'use client';

interface PixelRunnerProps {
  isRunning: boolean;
  isFinished?: boolean;
}

/**
 * A 16x16 pixel art running character.
 * Uses CSS to create sprite-like pixel art with running animation.
 */
export function PixelRunner({
  isRunning,
  isFinished = false,
}: PixelRunnerProps) {
  return (
    <div
      className={`pixel-runner ${isRunning ? 'running' : ''} ${isFinished ? 'finished' : ''}`}
      aria-hidden="true"
    >
      <div className="pixel-runner-body" />
      <style jsx>{`
        .pixel-runner {
          width: 16px;
          height: 16px;
          position: relative;
          image-rendering: pixelated;
        }

        .pixel-runner-body {
          width: 16px;
          height: 16px;
          position: absolute;
          background-color: #4a90d9;
          clip-path: polygon(
            /* Head */
            25% 0%, 75% 0%, 75% 25%, 25% 25%,
            /* Body */
            25% 25%, 75% 25%, 75% 62.5%, 25% 62.5%,
            /* Left leg */
            25% 62.5%, 43.75% 62.5%, 43.75% 100%, 25% 100%,
            /* Right leg */
            56.25% 62.5%, 75% 62.5%, 75% 100%, 56.25% 100%
          );
        }

        /* Standing pose */
        .pixel-runner:not(.running) .pixel-runner-body {
          clip-path: polygon(
            /* Head */
            25% 0%, 75% 0%, 75% 25%, 25% 25%,
            /* Body */
            25% 25%, 75% 25%, 75% 62.5%, 25% 62.5%,
            /* Legs together */
            31.25% 62.5%, 68.75% 62.5%, 68.75% 100%, 31.25% 100%
          );
        }

        /* Running animation frames */
        .pixel-runner.running .pixel-runner-body {
          animation: run-cycle 0.3s steps(1) infinite;
        }

        @keyframes run-cycle {
          0%, 100% {
            /* Frame 1: Right leg forward */
            clip-path: polygon(
              /* Head */
              25% 0%, 75% 0%, 75% 25%, 25% 25%,
              /* Body */
              25% 25%, 75% 25%, 75% 62.5%, 25% 62.5%,
              /* Left leg back */
              12.5% 62.5%, 31.25% 62.5%, 31.25% 87.5%, 12.5% 87.5%,
              /* Right leg forward */
              56.25% 62.5%, 87.5% 62.5%, 87.5% 87.5%, 56.25% 87.5%
            );
          }
          50% {
            /* Frame 2: Left leg forward */
            clip-path: polygon(
              /* Head */
              25% 0%, 75% 0%, 75% 25%, 25% 25%,
              /* Body */
              25% 25%, 75% 25%, 75% 62.5%, 25% 62.5%,
              /* Left leg forward */
              12.5% 62.5%, 43.75% 62.5%, 43.75% 87.5%, 12.5% 87.5%,
              /* Right leg back */
              68.75% 62.5%, 87.5% 62.5%, 87.5% 87.5%, 68.75% 87.5%
            );
          }
        }

        /* Celebration pose when finished */
        .pixel-runner.finished .pixel-runner-body {
          animation: celebrate 0.5s steps(1) infinite;
          background-color: #f59e0b;
        }

        @keyframes celebrate {
          0%, 100% {
            /* Arms up - left */
            clip-path: polygon(
              /* Head */
              25% 0%, 75% 0%, 75% 25%, 25% 25%,
              /* Left arm up */
              0% 12.5%, 25% 12.5%, 25% 37.5%, 0% 37.5%,
              /* Body */
              25% 25%, 75% 25%, 75% 62.5%, 25% 62.5%,
              /* Legs */
              31.25% 62.5%, 68.75% 62.5%, 68.75% 100%, 31.25% 100%
            );
          }
          50% {
            /* Arms up - right */
            clip-path: polygon(
              /* Head */
              25% 0%, 75% 0%, 75% 25%, 25% 25%,
              /* Right arm up */
              75% 12.5%, 100% 12.5%, 100% 37.5%, 75% 37.5%,
              /* Body */
              25% 25%, 75% 25%, 75% 62.5%, 25% 62.5%,
              /* Legs */
              31.25% 62.5%, 68.75% 62.5%, 68.75% 100%, 31.25% 100%
            );
          }
        }
      `}</style>
    </div>
  );
}
