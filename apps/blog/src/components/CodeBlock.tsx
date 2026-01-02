"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
} from "shiki";

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
  "mermaid",
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

  const match = /language-(\w+)(:?.+)?/.exec(className || "");
  const lang = match?.[1] || "";
  const filename = match?.[2]?.slice(1) || "";

  const code = String(children).replace(/\n$/, "");

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
    <div className="my-4">
      {filename && (
        <div className="rounded-t-lg bg-stone-700 px-4 py-2 text-sm text-stone-300">
          {filename}
        </div>
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
