"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
} from "shiki";
import { Mermaid } from "./Mermaid";
import { Check, Copy, Maximize2 } from "lucide-react";
import { FullscreenModal } from "./FullscreenModal";
import { Skeleton } from "./ui/skeleton";

interface CodeBlockProps {
  children: string;
  className?: string;
  inline?: boolean;
}

const SUPPORTED_LANGUAGES: BundledLanguage[] = [
  "typescript",
  "javascript",
  "tsx",
  "jsx",
  "python",
  "bash",
  "shellscript",
  "json",
  "yaml",
  "markdown",
  "html",
  "css",
  "sql",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
];

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: SUPPORTED_LANGUAGES,
    });
  }
  return highlighterPromise;
}

export function CodeBlock({ children, className, inline }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const match = /language-(\w+)(:?.+)?/.exec(className || "");
  const lang = match?.[1] || "";
  const filename = match?.[2]?.slice(1) || "";

  const code = String(children).replace(/\n$/, "");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  }, [code]);

  useEffect(() => {
    if (inline || !match) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function highlight() {
      try {
        const highlighter = await getHighlighter();
        if (cancelled) return;

        const language = SUPPORTED_LANGUAGES.includes(lang as BundledLanguage)
          ? (lang as BundledLanguage)
          : "typescript"; // fallback to typescript for unknown languages
        const isDarkTheme = resolvedTheme === "dark" || resolvedTheme === "tokyonight";
        const theme = isDarkTheme ? "github-dark" : "github-light";

        const html = highlighter.codeToHtml(code, {
          lang: language,
          theme,
        });

        if (!cancelled) {
          setHighlightedHtml(html);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to highlight code:", error);
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    highlight();

    return () => {
      cancelled = true;
    };
  }, [code, lang, resolvedTheme, inline, match]);

  // Inline code
  if (inline || !match) {
    return (
      <code className="rounded bg-stone-200 px-1 py-0.5 text-red-600 dark:bg-stone-700 dark:text-red-400">
        {children}
      </code>
    );
  }

  // Mermaid diagrams
  if (lang === "mermaid") {
    return <Mermaid chart={code} />;
  }

  // Loading state - skeleton with line-like patterns
  if (isLoading) {
    const lineCount = Math.min(code.split("\n").length, 8);
    const lineWidths = [85, 70, 90, 60, 75, 80, 65, 95];

    return (
      <div className="my-4">
        {filename && (
          <div className="rounded-t-lg bg-stone-700 px-4 py-2 text-sm text-stone-300">
            {filename}
          </div>
        )}
        <div
          className={`overflow-x-auto bg-stone-100 p-4 dark:bg-stone-800 ${
            filename ? "rounded-b-lg" : "rounded-lg"
          }`}
        >
          <div className="space-y-2">
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-4 shrink-0" />
                <Skeleton
                  className="h-4"
                  style={{ width: `${lineWidths[i % lineWidths.length]}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Add line numbers by wrapping each line
  const addLineNumbers = (html: string): string => {
    // Extract the code content and wrap each line
    return html.replace(
      /<code([^>]*)>([\s\S]*?)<\/code>/,
      (_, attrs, content) => {
        const lines = content.split("\n");
        const wrappedLines = lines
          .map((line: string, i: number) => {
            // Don't add line number to empty last line
            if (i === lines.length - 1 && line === "") return "";
            const lineNum = i + 1;
            return `<span class="line"><span class="line-number">${lineNum}</span><span class="line-content">${line}</span></span>`;
          })
          .filter(Boolean)
          .join("\n");
        return `<code${attrs}>${wrappedLines}</code>`;
      }
    );
  };

  const htmlWithLineNumbers = addLineNumbers(highlightedHtml);

  const headerLabel = filename || lang;

  const codeContent = (
    <div
      className="shiki-wrapper not-prose rounded-b-lg [&_pre]:!m-0 [&_pre]:!py-4 [&_pre]:!px-0 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_code]:grid [&_code]:text-sm [&_.line]:flex [&_.line]:w-full [&_.line]:min-w-max [&_.line]:px-4 [&_.line]:isolate [&_.line:hover]:bg-stone-200 dark:[&_.line:hover]:bg-stone-700 [&_.line-number]:mr-4 [&_.line-number]:w-4 [&_.line-number]:shrink-0 [&_.line-number]:text-right [&_.line-number]:select-none [&_.line-number]:text-stone-500"
      dangerouslySetInnerHTML={{ __html: htmlWithLineNumbers }}
    />
  );

  return (
    <>
      <div className="group relative my-4 overflow-hidden rounded-lg">
        <div className="flex items-center justify-between rounded-t-lg bg-stone-700 px-4 py-2 text-sm text-stone-300">
          <span>{headerLabel}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded px-2 py-1 text-stone-400 transition-colors hover:bg-stone-600 hover:text-stone-200"
              aria-label="Copy code"
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
              className="flex items-center gap-1 rounded px-2 py-1 text-stone-400 transition-colors hover:bg-stone-600 hover:text-stone-200"
              aria-label="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {codeContent}
      </div>
      <FullscreenModal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title={filename || lang}
      >
        <div className="h-full overflow-auto rounded-lg">
          {codeContent}
        </div>
      </FullscreenModal>
    </>
  );
}
