'use client';

import { Check, Copy, Maximize2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
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
} from 'react-icons/si';
import {
  type BundledLanguage,
  createHighlighter,
  type Highlighter,
} from 'shiki';

import { FullscreenModal } from './FullscreenModal';
import { ImageCarousel } from './ImageCarousel';
import { Mermaid } from './Mermaid';
import { Skeleton } from './ui/skeleton';

interface CodeBlockProps {
  children: string;
  className?: string;
  inline?: boolean;
}

const SUPPORTED_LANGUAGES: BundledLanguage[] = [
  'typescript',
  'javascript',
  'tsx',
  'jsx',
  'python',
  'bash',
  'shellscript',
  'json',
  'yaml',
  'markdown',
  'html',
  'css',
  'sql',
  'go',
  'rust',
  'java',
  'c',
  'cpp',
];

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

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: SUPPORTED_LANGUAGES,
    });
  }
  return highlighterPromise;
}

export function CodeBlock({ children, className, inline }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const match = /language-(\w+)(:?.+)?/.exec(className || '');
  const lang = match?.[1] || '';
  const filename = match?.[2]?.slice(1) || '';

  const code = String(children).replace(/\n$/, '');

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, [code]);

  useEffect(() => {
    if (!mounted) return;

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
          : 'typescript'; // fallback to typescript for unknown languages
        const isDarkTheme =
          resolvedTheme === 'dark' || resolvedTheme === 'tokyonight';
        const theme = isDarkTheme ? 'github-dark' : 'github-light';

        console.log(
          '[CodeBlock] resolvedTheme:',
          resolvedTheme,
          'isDarkTheme:',
          isDarkTheme,
          'theme:',
          theme
        );

        const html = highlighter.codeToHtml(code, {
          lang: language,
          theme,
        });

        if (!cancelled) {
          setHighlightedHtml(html);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to highlight code:', error);
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    highlight();

    return () => {
      cancelled = true;
    };
  }, [code, lang, resolvedTheme, inline, match, mounted]);

  // Inline code
  if (inline || !match) {
    return (
      <code className="rounded bg-stone-200 px-1 py-0.5 text-red-600 dark:bg-stone-700 dark:text-[#f7768e]">
        {children}
      </code>
    );
  }

  // Mermaid diagrams
  if (lang === 'mermaid') {
    return <Mermaid chart={code} />;
  }

  // Image carousel
  if (lang === 'carousel') {
    return <ImageCarousel content={code} />;
  }

  // Loading state - skeleton with line-like patterns
  if (isLoading) {
    const lineCount = Math.min(code.split('\n').length, 8);
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
            filename ? 'rounded-b-lg' : 'rounded-lg'
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
        const lines = content.split('\n');
        const wrappedLines = lines
          .map((line: string, i: number) => {
            // Don't add line number to empty last line
            if (i === lines.length - 1 && line === '') return '';
            const lineNum = i + 1;
            return `<span class="line"><span class="line-number">${lineNum}</span><span class="line-content">${line}</span></span>`;
          })
          .filter(Boolean)
          .join('\n');
        return `<code${attrs}>${wrappedLines}</code>`;
      }
    );
  };

  const htmlWithLineNumbers = addLineNumbers(highlightedHtml);

  const headerLabel = filename || lang;
  const LangIcon = languageIcons[lang];

  const codeContent = (
    <div
      className="shiki-wrapper not-prose rounded-b-lg [&_pre]:m-0! [&_pre]:py-4! [&_pre]:px-0! [&_pre]:overflow-x-auto [&_pre]:rounded-lg"
      dangerouslySetInnerHTML={{ __html: htmlWithLineNumbers }}
    />
  );

  return (
    <>
      <div className="group relative my-4 overflow-hidden rounded-lg ring-1 ring-stone-200 dark:ring-stone-900">
        <div className="flex items-center justify-between rounded-t-lg bg-stone-700 px-4 py-2 text-sm text-stone-300">
          <div className="flex items-center gap-2">
            {LangIcon && <LangIcon className="h-4 w-4" />}
            <span>{headerLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="cursor-pointer flex items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
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
              className="cursor-pointer flex items-center gap-1 rounded px-2 py-1 text-stone-300 transition-colors hover:bg-stone-600 hover:text-stone-100"
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
        <div className="h-full overflow-auto rounded-lg">{codeContent}</div>
      </FullscreenModal>
    </>
  );
}
