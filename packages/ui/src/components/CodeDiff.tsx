"use client";

import { cn } from "@blog/utils";
import { Check, Copy, FileDiff, Maximize2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  SiCss3,
  SiDocker,
  SiGnubash,
  SiGo,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiMarkdown,
  SiPython,
  SiRust,
  SiTerraform,
  SiTypescript,
  SiYaml,
} from "react-icons/si";
import YAML from "yaml";

import { FullscreenModal } from "./FullscreenModal";

interface CodeDiffProps {
  content: string;
  className?: string;
  isFullscreen?: boolean;
}

interface DiffLine {
  type: "added" | "removed" | "unchanged" | "header";
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

interface YamlDiffConfig {
  language?: string;
  before: string;
  after: string;
}

const languageIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  typescript: SiTypescript,
  tsx: SiTypescript,
  javascript: SiJavascript,
  jsx: SiJavascript,
  python: SiPython,
  go: SiGo,
  rust: SiRust,
  html: SiHtml5,
  css: SiCss3,
  json: SiJson,
  yaml: SiYaml,
  markdown: SiMarkdown,
  bash: SiGnubash,
  shellscript: SiGnubash,
  terraform: SiTerraform,
  hcl: SiTerraform,
  dockerfile: SiDocker,
  docker: SiDocker,
};

function isYamlDiffConfig(content: string): YamlDiffConfig | null {
  try {
    const parsed = YAML.parse(content) as YamlDiffConfig;
    if (
      parsed &&
      typeof parsed.before === "string" &&
      typeof parsed.after === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function computeDiff(before: string, after: string): DiffLine[] {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const result: DiffLine[] = [];

  // Simple line-by-line diff (not optimal LCS, but good enough for display)
  let oldLineNum = 1;
  let newLineNum = 1;
  let i = 0;
  let j = 0;

  while (i < beforeLines.length || j < afterLines.length) {
    if (i >= beforeLines.length) {
      // Remaining lines in after are additions
      result.push({
        type: "added",
        content: afterLines[j],
        newLineNum: newLineNum++,
      });
      j++;
    } else if (j >= afterLines.length) {
      // Remaining lines in before are removals
      result.push({
        type: "removed",
        content: beforeLines[i],
        oldLineNum: oldLineNum++,
      });
      i++;
    } else if (beforeLines[i] === afterLines[j]) {
      // Lines match
      result.push({
        type: "unchanged",
        content: beforeLines[i],
        oldLineNum: oldLineNum++,
        newLineNum: newLineNum++,
      });
      i++;
      j++;
    } else {
      // Lines differ - show removal then addition
      result.push({
        type: "removed",
        content: beforeLines[i],
        oldLineNum: oldLineNum++,
      });
      result.push({
        type: "added",
        content: afterLines[j],
        newLineNum: newLineNum++,
      });
      i++;
      j++;
    }
  }

  return result;
}

function parseStandardDiff(content: string): DiffLine[] {
  const lines = content.split("\n");
  const result: DiffLine[] = [];
  let oldLineNum = 1;
  let newLineNum = 1;

  for (const line of lines) {
    if (
      line.startsWith("+++") ||
      line.startsWith("---") ||
      line.startsWith("@@")
    ) {
      result.push({ type: "header", content: line });
    } else if (line.startsWith("+")) {
      result.push({
        type: "added",
        content: line.slice(1),
        newLineNum: newLineNum++,
      });
    } else if (line.startsWith("-")) {
      result.push({
        type: "removed",
        content: line.slice(1),
        oldLineNum: oldLineNum++,
      });
    } else {
      // Unchanged line (may have a space prefix or no prefix)
      const contentWithoutPrefix = line.startsWith(" ") ? line.slice(1) : line;
      result.push({
        type: "unchanged",
        content: contentWithoutPrefix,
        oldLineNum: oldLineNum++,
        newLineNum: newLineNum++,
      });
    }
  }

  return result;
}

export function CodeDiff({
  content,
  className,
  isFullscreen = false,
}: CodeDiffProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const { diffLines, language } = useMemo(() => {
    // Try YAML format first
    const yamlConfig = isYamlDiffConfig(content);
    if (yamlConfig) {
      return {
        diffLines: computeDiff(yamlConfig.before, yamlConfig.after),
        language: yamlConfig.language || "text",
      };
    }

    // Fall back to standard diff format
    return {
      diffLines: parseStandardDiff(content),
      language: "diff",
    };
  }, [content]);

  // Determine which icon to use
  const LangIcon = languageIcons[language] || FileDiff;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [content]);

  return (
    <div
      className={cn(
        "group relative my-2 overflow-hidden rounded-lg ring-1 ring-stone-300 dark:ring-[#333]",
        isFullscreen && "my-0 rounded-none ring-0",
        className,
      )}
    >
      {/* Header */}
      {!isFullscreen && (
        <div className="component-header flex items-center justify-between px-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            <LangIcon className="h-4 w-4" />
            <span>diff</span>
            {language !== "diff" && language !== "text" && (
              <span className="text-stone-400">({language})</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
              aria-label="Copy diff"
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
              onClick={() => setShowFullscreen(true)}
              className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
              aria-label="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Diff content */}
      <div
        className={cn(
          "code-diff-content overflow-x-auto bg-white font-mono text-sm dark:bg-[#0d1117]",
          isFullscreen && "h-full",
        )}
      >
        <table className="w-full border-collapse">
          <tbody>
            {diffLines.map((line, index) => (
              <tr
                key={index}
                className={cn(
                  line.type === "added" && "bg-green-100 dark:bg-green-900/30",
                  line.type === "removed" && "bg-red-100 dark:bg-red-900/30",
                  line.type === "header" && "bg-blue-100 dark:bg-blue-900/30",
                )}
              >
                {/* Old line number */}
                <td className="code-diff-border w-12 select-none border-r border-stone-200 px-2 py-0.5 text-right text-stone-400">
                  {line.oldLineNum || ""}
                </td>
                {/* New line number */}
                <td className="code-diff-border w-12 select-none border-r border-stone-200 px-2 py-0.5 text-right text-stone-400">
                  {line.newLineNum || ""}
                </td>
                {/* Sign */}
                <td
                  className={cn(
                    "w-6 select-none px-1 py-0.5 text-center font-bold",
                    line.type === "added" &&
                      "text-green-600 dark:text-green-400",
                    line.type === "removed" && "text-red-600 dark:text-red-400",
                  )}
                >
                  {line.type === "added" && "+"}
                  {line.type === "removed" && "-"}
                </td>
                {/* Content */}
                <td className="whitespace-pre px-2 py-0.5">
                  <span
                    className={cn(
                      "code-diff-text",
                      line.type === "added" &&
                        "text-green-800 dark:text-green-200",
                      line.type === "removed" &&
                        "text-red-800 dark:text-red-200",
                      line.type === "header" &&
                        "text-blue-800 dark:text-blue-200",
                      line.type === "unchanged" && "text-stone-700",
                    )}
                  >
                    {line.content}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FullscreenModal
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        title={
          <div className="flex items-center gap-2">
            <LangIcon className="h-4 w-4" />
            <span>diff</span>
            {language !== "diff" && language !== "text" && (
              <span className="text-stone-400">({language})</span>
            )}
          </div>
        }
        headerActions={
          <button
            type="button"
            onClick={handleCopy}
            className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
            aria-label="Copy diff"
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
        }
        headerClassName="component-header rounded-none border-b-0"
      >
        <CodeDiff
          content={content}
          isFullscreen={true}
          className="h-full border-none ring-0"
        />
      </FullscreenModal>
    </div>
  );
}
