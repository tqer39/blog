'use client';

import { cn } from '@blog/utils';
import { Check, Copy, Pause, Play, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  prompt: 'text-green-500',
  command: 'text-sky-400',
  flag: 'text-pink-400',
  string: 'text-amber-300',
  path: 'text-violet-400',
  number: 'text-orange-400',
  text: 'text-white',
};

function HighlightedLine({ line }: { line: string }) {
  const parts = highlightCommand(line);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i} className={highlightColors[part.type]}>
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
    <div className={cn('my-4', className)}>
      {/* Terminal header */}
      <div className="flex items-center justify-between rounded-t-lg bg-stone-700 px-4 py-2">
        <div className="flex items-center gap-2">
          {/* Window controls */}
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <span className="ml-2 text-sm text-stone-400">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
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
            className="flex items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
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
        </div>
      </div>

      {/* Terminal body */}
      <div
        ref={terminalRef}
        className="max-h-[400px] overflow-y-auto rounded-b-lg bg-stone-900 p-4 font-mono text-sm"
      >
        {displayedLines.map((line, index) => {
          const originalLine = lines[index];
          const isCommand = originalLine?.isCommand ?? false;

          return (
            <div key={index} className="leading-relaxed">
              {isCommand ? (
                <HighlightedLine line={line} />
              ) : (
                <span className="text-stone-400">{line}</span>
              )}
            </div>
          );
        })}

        {/* Cursor */}
        {!isComplete && isPlaying && (
          <span className="inline-block h-4 w-2 animate-pulse bg-green-400" />
        )}
      </div>
    </div>
  );
}
