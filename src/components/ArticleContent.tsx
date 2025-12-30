'use client';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { CodeBlock } from './CodeBlock';
import { Mermaid } from './Mermaid';

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm]}
      className="prose prose-stone max-w-none dark:prose-invert"
      components={{
        code({ children, className, ...props }) {
          return (
            <CodeBlock className={className} {...props}>
              {String(children)}
            </CodeBlock>
          );
        },
        pre({ children, className }) {
          if (className === 'mermaid') {
            const code = (children as React.ReactElement)?.props?.children;
            if (typeof code === 'string') {
              return <Mermaid chart={code} />;
            }
          }

          const codeElement = children as React.ReactElement;
          if (codeElement?.props?.className === 'language-mermaid') {
            const code = codeElement.props.children;
            if (typeof code === 'string') {
              return <Mermaid chart={code.trim()} />;
            }
          }

          return <pre className={className}>{children}</pre>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
