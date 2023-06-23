'use client';

import type { CodeComponent } from 'react-markdown/lib/ast-to-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const customCode: CodeComponent = ({ children, className, inline }) => {
  const style = a11yDark;
  const match = /language-(\w+)(:?.+)?/.exec(className || '');
  const lang = match && match[1] ? match[1] : '';
  const name = match && match[2] ? match[2].slice(1) : '';
  return !inline && match ? (
    <>
      {name && <span className="bg-stone-200 px-2 py-1 text-xs">{name}</span>}
      <SyntaxHighlighter style={style} language={lang} PreTag="div">
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </>
  ) : (
    <code className="rounded-md bg-stone-200 text-red-600">{children}</code>
  );
};

export const CodeBlock = {
  code: customCode,
};
