'use client';

import { Check, Copy, Maximize2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import {
  type BundledLanguage,
  createHighlighter,
  type Highlighter,
} from 'shiki';
import { useCopyToClipboard } from '../hooks/use-copy-to-clipboard';
import { useMounted } from '../hooks/use-mounted';
import { LANGUAGE_ICONS } from '../lib/language-icons';

import { BlockSkeleton } from './BlockSkeleton';
import { FullscreenModal } from './FullscreenModal';
import { Mermaid } from './Mermaid';

const Chart = dynamic(() => import('./Chart').then((mod) => mod.Chart), {
  loading: () => <BlockSkeleton filename="Chart" />,
});
const CodeDiff = dynamic(
  () => import('./CodeDiff').then((mod) => mod.CodeDiff),
  {
    loading: () => <BlockSkeleton filename="Code Diff" />,
  }
);
const FileTree = dynamic(
  () => import('./FileTree').then((mod) => mod.FileTree),
  {
    loading: () => <BlockSkeleton filename="File Tree" />,
  }
);
const ImageCarousel = dynamic(
  () => import('./ImageCarousel').then((mod) => mod.ImageCarousel),
  {
    loading: () => <BlockSkeleton filename="Image Carousel" />,
  }
);
const ImageCompare = dynamic(
  () => import('./ImageCompare').then((mod) => mod.ImageCompare),
  {
    loading: () => <BlockSkeleton filename="Image Compare" />,
  }
);
const ModelViewer = dynamic(
  () => import('./ModelViewer').then((mod) => mod.ModelViewer),
  {
    loading: () => <BlockSkeleton filename="3D Model" />,
  }
);
const Terminal = dynamic(
  () => import('./Terminal').then((mod) => mod.Terminal),
  {
    loading: () => <BlockSkeleton filename="Terminal" />,
  }
);

/**
 * コードブロックのProps。
 *
 * Shikiによるシンタックスハイライト、行番号、コピー機能、
 * フルスクリーン表示をサポート。mermaid, chart, terminal等の
 * 特殊ブロックも自動判定して対応コンポーネントに委譲。
 */
interface CodeBlockProps {
  /** コードコンテンツ */
  children: string;
  /** 言語指定 (language-{lang} または language-{lang}:{filename}) */
  className?: string;
  /** インラインコード表示 (ハイライトなし) */
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
  const mounted = useMounted();
  const { isCopied, copy } = useCopyToClipboard();
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const match = /language-(\w+)(:?.+)?/.exec(className || '');
  const lang = match?.[1] || '';
  const filename = match?.[2]?.slice(1) || '';

  const code = String(children).replace(/\n$/, '');

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

  // Image comparison (Before/After)
  if (lang === 'compare') {
    return <ImageCompare content={code} />;
  }

  // Interactive chart
  if (lang === 'chart') {
    return <Chart content={code} />;
  }

  // Terminal with typing animation
  if (lang === 'terminal') {
    return <Terminal content={code} />;
  }

  // 3D Model viewer
  if (lang === 'model') {
    return <ModelViewer content={code} />;
  }

  // Code diff
  if (lang === 'diff') {
    return <CodeDiff content={code} />;
  }

  // File tree
  if (lang === 'tree') {
    return <FileTree content={code} />;
  }

  // Loading state - skeleton with line-like patterns
  if (isLoading) {
    const lineCount = Math.min(code.split('\n').length, 8);
    return <BlockSkeleton filename={filename} lineCount={lineCount} />;
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
  const LangIcon = LANGUAGE_ICONS[lang];

  const codeContent = (
    <div
      className="shiki-wrapper not-prose [&_pre]:m-0! [&_pre]:p-0! [&_pre]:overflow-x-auto [&_pre]:rounded-none!"
      dangerouslySetInnerHTML={{ __html: htmlWithLineNumbers }}
    />
  );

  return (
    <>
      <div className="group relative my-5 overflow-hidden rounded-lg ring-1 ring-stone-300 dark:ring-[#333]">
        <div className="component-header flex items-center justify-between px-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            {LangIcon && <LangIcon className="h-4 w-4" />}
            <span>{headerLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => copy(code)}
              className="cursor-pointer flex items-center gap-1 rounded-md px-2 py-1 text-stone-300 transition-colors hover:bg-accent hover:text-accent-foreground"
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
              className="cursor-pointer flex items-center gap-1 rounded-md px-2 py-1 text-stone-300 transition-colors hover:bg-accent hover:text-accent-foreground"
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
        title={
          <div className="flex items-center gap-2">
            {LangIcon && <LangIcon className="h-4 w-4" />}
            <span>{headerLabel}</span>
          </div>
        }
        headerActions={
          <button
            type="button"
            onClick={() => copy(code)}
            className="cursor-pointer flex items-center gap-1 rounded-md px-2 py-1 text-stone-300 transition-colors hover:bg-accent hover:text-accent-foreground"
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
        }
        headerClassName="component-header rounded-none border-b-0"
      >
        <div className="h-full overflow-auto p-4">
          <div
            className="shiki-wrapper not-prose rounded-lg [&_pre]:m-0! [&_pre]:py-4! [&_pre]:px-0! [&_pre]:overflow-x-auto [&_pre]:rounded-lg"
            dangerouslySetInnerHTML={{ __html: htmlWithLineNumbers }}
          />
        </div>
      </FullscreenModal>
    </>
  );
}
