'use client';

import { cn } from '@blog/utils';
import {
  Check,
  Copy,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Terminal as TerminalIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { FullscreenModal } from './FullscreenModal';

interface TerminalProps {
  content: string;
  className?: string;
}

interface TerminalLine {
  text: string;
  isCommand: boolean;
}

function parseLines(content: string): TerminalLine[] {
  return content
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => ({
      text: line,
      isCommand: line.trimStart().startsWith('$'),
    }));
}

interface HighlightedPart {
  text: string;
  type: 'prompt' | 'command' | 'flag' | 'string' | 'path' | 'number' | 'text';
}

function highlightCommand(line: string): HighlightedPart[] {
  const parts: HighlightedPart[] = [];
  const trimmed = line.trimStart();

  if (!trimmed.startsWith('$')) {
    return [{ text: line, type: 'text' }];
  }

  // Find the leading whitespace
  const leadingSpace = line.slice(0, line.length - trimmed.length);
  if (leadingSpace) {
    parts.push({ text: leadingSpace, type: 'text' });
  }

  // Add the $ prompt
  parts.push({ text: '$', type: 'prompt' });

  // Get the rest after $
  const afterPrompt = trimmed.slice(1);
  if (!afterPrompt) {
    return parts;
  }

  // Tokenize the rest
  const tokens = afterPrompt.match(/\s+|"[^"]*"|'[^']*'|[^\s"']+/g) || [];
  let isFirstWord = true;

  for (const token of tokens) {
    // Whitespace
    if (/^\s+$/.test(token)) {
      parts.push({ text: token, type: 'text' });
      continue;
    }

    // String (quoted)
    if (/^["'].*["']$/.test(token)) {
      parts.push({ text: token, type: 'string' });
      isFirstWord = false;
      continue;
    }

    // First word is the command
    if (isFirstWord) {
      parts.push({ text: token, type: 'command' });
      isFirstWord = false;
      continue;
    }

    // Flags (starting with -)
    if (token.startsWith('-')) {
      parts.push({ text: token, type: 'flag' });
      continue;
    }

    // Paths (containing /)
    if (token.includes('/')) {
      parts.push({ text: token, type: 'path' });
      continue;
    }

    // Numbers
    if (/^\d+(\.\d+)?$/.test(token)) {
      parts.push({ text: token, type: 'number' });
      continue;
    }

    // Default text
    parts.push({ text: token, type: 'text' });
  }

  return parts;
}

const highlightColors: Record<HighlightedPart['type'], string> = {
  prompt: '#22c55e', // green-500
  command: '#38bdf8', // sky-400
  flag: '#f472b6', // pink-400
  string: '#fcd34d', // amber-300
  path: '#a78bfa', // violet-400
  number: '#fb923c', // orange-400
  text: '#ffffff', // white
};

function HighlightedLine({ line }: { line: string }) {
  const parts = highlightCommand(line);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i} style={{ color: highlightColors[part.type] }}>
          {part.text}
        </span>
      ))}
    </>
  );
}

export function Terminal({ content, className }: TerminalProps) {
  const lines = parseLines(content);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Typing speed (ms per character)
  const CHAR_DELAY = 30;
  // Delay before showing output (non-command lines)
  const OUTPUT_DELAY = 300;
  // Delay between lines
  const LINE_DELAY = 100;

  const reset = useCallback(() => {
    setDisplayedLines([]);
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);
    setIsComplete(false);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (isComplete) {
      reset();
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [isComplete, reset]);

  const handleCopy = useCallback(async () => {
    // Copy only command lines (without $)
    const commandsOnly = lines
      .filter((line) => line.isCommand)
      .map((line) => line.text.replace(/^\s*\$\s*/, ''))
      .join('\n');

    try {
      await navigator.clipboard.writeText(commandsOnly);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [lines]);

  useEffect(() => {
    if (!isPlaying || isComplete) return;

    const currentLine = lines[currentLineIndex];
    if (!currentLine) {
      setIsComplete(true);
      setIsPlaying(false);
      return;
    }

    // For command lines, type character by character
    if (currentLine.isCommand) {
      if (currentCharIndex < currentLine.text.length) {
        const timer = setTimeout(() => {
          setDisplayedLines((prev) => {
            const newLines = [...prev];
            if (newLines.length <= currentLineIndex) {
              newLines.push(currentLine.text.slice(0, currentCharIndex + 1));
            } else {
              newLines[currentLineIndex] = currentLine.text.slice(
                0,
                currentCharIndex + 1
              );
            }
            return newLines;
          });
          setCurrentCharIndex((prev) => prev + 1);
        }, CHAR_DELAY);
        return () => clearTimeout(timer);
      }
      // Move to next line
      const timer = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }, LINE_DELAY);
      return () => clearTimeout(timer);
    }

    // For output lines, show all at once after a delay
    const timer = setTimeout(() => {
      setDisplayedLines((prev) => [...prev, currentLine.text]);
      setCurrentLineIndex((prev) => prev + 1);
      setCurrentCharIndex(0);
    }, OUTPUT_DELAY);
    return () => clearTimeout(timer);
  }, [isPlaying, isComplete, currentLineIndex, currentCharIndex, lines]);

  // Auto-scroll to bottom when new lines are added
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally depends on displayedLines to scroll on new content
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedLines]);

  return (
    <div
      className={cn(
        'group relative my-4 overflow-hidden rounded-lg ring-1 ring-stone-200 dark:ring-stone-900',
        className
      )}
    >
      {/* Terminal header */}
      <div className="component-header flex items-center justify-between rounded-t-lg px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-4 w-4" />
            <span>Terminal</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-stone-300 transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label={isComplete ? 'Replay' : isPlaying ? 'Pause' : 'Play'}
          >
            {isComplete ? (
              <RotateCcw className="h-4 w-4" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-stone-300 transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Copy commands"
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4" />
                <span className="text-xs">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-stone-300 transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Terminal body */}
      <div
        ref={terminalRef}
        className="max-h-[400px] overflow-y-auto rounded-b-lg bg-stone-900 p-3 font-mono text-sm"
      >
        {displayedLines.map((line, index) => {
          const originalLine = lines[index];
          const isCommand = originalLine?.isCommand ?? false;

          return (
            <div key={index} className="leading-relaxed">
              {isCommand ? (
                <HighlightedLine line={line} />
              ) : (
                <span className="text-stone-300">{line}</span>
              )}
            </div>
          );
        })}

        {/* Cursor */}
        {!isComplete && isPlaying && (
          <span className="inline-block h-4 w-2 animate-pulse bg-green-400" />
        )}
      </div>
      <FullscreenModal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title="Terminal"
      >
        <div className="h-full overflow-auto rounded-lg bg-stone-900 p-4 font-mono text-sm">
          {lines.map((line, index) => (
            <div key={index} className="leading-relaxed">
              {line.isCommand ? (
                <HighlightedLine line={line.text} />
              ) : (
                <span className="text-stone-300">{line.text}</span>
              )}
            </div>
          ))}
        </div>
      </FullscreenModal>
    </div>
  );
}
