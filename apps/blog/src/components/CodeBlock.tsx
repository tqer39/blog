"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
} from "shiki";
import { Mermaid } from "./Mermaid";
import { Check, Copy } from "lucide-react";

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
        const theme =
          resolvedTheme === "dark" ? "github-dark" : "github-light";

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

  // Loading state
  if (isLoading) {
    return (
      <div className="my-4">
        {filename && (
          <div className="rounded-t-lg bg-stone-700 px-4 py-2 text-sm text-stone-300">
            {filename}
          </div>
        )}
        <div
          className={`overflow-x-auto bg-stone-100 p-4 text-sm dark:bg-stone-800 ${
            filename ? "rounded-b-lg" : "rounded-lg"
          }`}
        >
          <pre className="text-stone-600 dark:text-stone-400">
            <code>{code}</code>
          </pre>
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
            return `<span class="line" data-line="${i + 1}">${line}</span>`;
          })
          .filter(Boolean)
          .join("\n");
        return `<code${attrs}>${wrappedLines}</code>`;
      }
    );
  };

  const htmlWithLineNumbers = addLineNumbers(highlightedHtml);

  return (
    <div className="group relative my-4">
      {filename && (
        <div className="flex items-center justify-between rounded-t-lg bg-stone-700 px-4 py-2 text-sm text-stone-300">
          <span>{filename}</span>
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
        </div>
      )}
      {!filename && (
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-2 top-2 flex items-center gap-1 rounded bg-stone-700/80 px-2 py-1 text-stone-400 opacity-0 transition-all hover:bg-stone-600 hover:text-stone-200 group-hover:opacity-100"
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
      )}
      <div
        className={`shiki-wrapper overflow-x-auto ${
          filename ? "rounded-b-lg" : "rounded-lg"
        } [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:p-4 [&_code]:grid [&_code]:text-sm [&_.line]:before:mr-4 [&_.line]:before:inline-block [&_.line]:before:w-4 [&_.line]:before:text-right [&_.line]:before:text-stone-500 [&_.line]:before:content-[attr(data-line)]`}
        dangerouslySetInnerHTML={{ __html: htmlWithLineNumbers }}
      />
    </div>
  );
}
