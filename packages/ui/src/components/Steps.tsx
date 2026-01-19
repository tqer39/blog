"use client";

import { cn } from "@blog/utils";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  ListOrdered,
  Maximize2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import YAML from "yaml";

import { FullscreenModal } from "./FullscreenModal";

interface StepsProps {
  content: string;
  className?: string;
  isFullscreen?: boolean;
}

interface Step {
  title: string;
  description?: string;
  code?: string;
}

function parseSteps(content: string): Step[] {
  try {
    const parsed = YAML.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is Step =>
          typeof item === "object" &&
          item !== null &&
          typeof item.title === "string",
      );
    }
    return [];
  } catch {
    return [];
  }
}

function StepItem({
  step,
  index,
  total,
}: {
  step: Step;
  index: number;
  total: number;
}) {
  const [isCodeExpanded, setIsCodeExpanded] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!step.code) return;
    try {
      await navigator.clipboard.writeText(step.code.trim());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [step.code]);

  const isLast = index === total - 1;

  return (
    <div className="relative flex gap-3">
      {/* Step number and line */}
      <div className="flex flex-col items-center">
        {/* Number circle */}
        <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white dark:bg-blue-500">
          {index + 1}
        </div>
        {/* Line */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-blue-200 dark:bg-blue-900" />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 pb-4", isLast && "pb-0")}>
        {/* Title */}
        <div className="font-semibold leading-7 text-stone-900 dark:text-stone-100">
          {step.title}
        </div>

        {/* Description */}
        {step.description && (
          <div className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">
            {step.description}
          </div>
        )}

        {/* Code block */}
        {step.code && (
          <div className="mt-2 overflow-hidden rounded-md border border-stone-300 dark:border-stone-600">
            {/* Code header */}
            <div className="flex items-center justify-between bg-stone-200 px-3 py-1 dark:bg-stone-700">
              <button
                type="button"
                onClick={() => setIsCodeExpanded((prev) => !prev)}
                className="flex cursor-pointer items-center gap-1 text-xs text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              >
                {isCodeExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
                <span>コード</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-xs text-stone-600 transition-colors hover:bg-stone-300 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-600 dark:hover:text-stone-200"
                aria-label="Copy code"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code content */}
            {isCodeExpanded && (
              <pre className="overflow-x-auto bg-stone-900 p-3 font-mono text-sm dark:bg-stone-950">
                <code className="text-stone-100">{step.code.trim()}</code>
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Steps({
  content,
  className,
  isFullscreen = false,
}: StepsProps) {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const steps = useMemo(() => parseSteps(content), [content]);

  if (steps.length === 0) {
    return (
      <div className="my-4 rounded-lg border border-dashed border-muted-foreground/50 p-4 text-center text-muted-foreground">
        ステップ設定が無効です。YAML形式で正しく記述してください。
        <pre className="mt-2 text-left text-xs">
          {`- title: ステップ名
  description: 説明文（オプション）
  code: |
    コマンド（オプション）`}
        </pre>
      </div>
    );
  }

  return (
    <div className={cn("my-4", className)}>
      {/* Header */}
      <div className="component-header flex items-center justify-between rounded-t-lg px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4" />
          <span>Steps</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">{steps.length} steps</span>
          {!isFullscreen && (
            <button
              type="button"
              onClick={() => setShowFullscreen(true)}
              className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
              aria-label="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Steps content */}
      <div
        className={cn(
          "rounded-b-lg border border-t-0 border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800",
          isFullscreen && "h-full overflow-y-auto",
        )}
      >
        {steps.map((step, index) => (
          <StepItem
            key={index}
            step={step}
            index={index}
            total={steps.length}
          />
        ))}
      </div>
      <FullscreenModal
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        title="Steps"
      >
        <Steps
          content={content}
          isFullscreen={true}
          className="h-full border-none"
        />
      </FullscreenModal>
    </div>
  );
}
