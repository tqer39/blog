'use client';

import ReactMarkdown from 'react-markdown';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { CodeBlock } from './CodeBlock';
import { Mermaid } from './Mermaid';

interface ArticleContentProps {
  content: string;
}

// Remove the first h1 heading from markdown (since it's already shown in the page header)
function removeFirstH1(content: string): string {
  return content.replace(/^#\s+.+\n+/, '');
}

export function ArticleContent({ content }: ArticleContentProps) {
  const processedContent = removeFirstH1(content);
  return (
    <ReactMarkdown
      rehypePlugins={[
        rehypeRaw,
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'prepend',
            properties: {
              className: ['anchor-link'],
              ariaHidden: true,
              tabIndex: -1,
            },
            content: {
              type: 'text',
              value: '#',
            },
          },
        ],
      ]}
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
      {processedContent}
    </ReactMarkdown>
  );
}
