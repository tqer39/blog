'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  children: string;
  className?: string;
  inline?: boolean;
}

export function CodeBlock({ children, className, inline }: CodeBlockProps) {
  const match = /language-(\w+)(:?.+)?/.exec(className || '');
  const lang = match?.[1] || '';
  const filename = match?.[2]?.slice(1) || '';

  if (inline || !match) {
    return (
      <code className="rounded bg-stone-200 px-1 py-0.5 text-red-600 dark:bg-stone-700 dark:text-red-400">
        {children}
      </code>
    );
  }

  return (
    <div className="my-4">
      {filename && (
        <div className="rounded-t bg-stone-700 px-3 py-1 text-xs text-stone-300">
          {filename}
        </div>
      )}
      <SyntaxHighlighter
        style={oneDark}
        language={lang}
        PreTag="div"
        className={filename ? '!mt-0 !rounded-t-none' : ''}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
}
