"use client";

import { CodeBlock } from "@blog/ui";
import { h } from "hastscript";
import { isValidElement, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

// Custom sanitize schema: allow className on code/pre for syntax highlighting
// and SVG elements for anchor link icons
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "svg",
    "path",
    "rect",
    "button",
    "span",
  ],
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), "className"],
    pre: [...(defaultSchema.attributes?.pre || []), "className"],
    svg: [
      "xmlns",
      "width",
      "height",
      "viewBox",
      "fill",
      "stroke",
      "strokeWidth",
      "strokeLinecap",
      "strokeLinejoin",
      "className",
    ],
    path: ["d"],
    rect: ["x", "y", "width", "height", "rx", "ry"],
    button: ["type", "className", "ariaLabel"],
    span: ["className"],
  },
};

interface ArticleContentProps {
  content: string;
  /** Skip removing the first H1 heading (useful for slide mode) */
  keepFirstH1?: boolean;
}

// Remove the first h1 heading from markdown (since it's already shown in the page header)
function removeFirstH1(content: string): string {
  return content.replace(/^#\s+.+\n+/, "");
}

export function ArticleContent({
  content,
  keepFirstH1 = false,
}: ArticleContentProps) {
  const processedContent = keepFirstH1 ? content : removeFirstH1(content);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const copyButton = target.closest(".anchor-copy") as HTMLElement | null;

      if (copyButton) {
        // Copy button clicked - copy URL to clipboard
        e.preventDefault();
        e.stopPropagation();
        const heading = copyButton.closest("h1, h2, h3, h4, h5, h6");
        if (heading?.id) {
          const url = `${window.location.origin}${window.location.pathname}#${heading.id}`;
          navigator.clipboard.writeText(url);

          // Show "Copied!" feedback
          copyButton.classList.add("copied");
          setTimeout(() => {
            copyButton.classList.remove("copied");
          }, 2000);
        }
      }
      // For anchor-hash (#), let the default anchor behavior work
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  return (
    <div className="prose prose-stone max-w-none dark:prose-invert">
      <ReactMarkdown
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, sanitizeSchema],
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: {
                className: ["anchor-link"],
                ariaLabel: "Link to this section",
              },
              content: [
                h("span", { className: "anchor-hash" }, "#"),
                h(
                  "button",
                  {
                    type: "button",
                    className: "anchor-copy",
                    ariaLabel: "Copy link to clipboard",
                  },
                  [
                    h(
                      "svg",
                      {
                        xmlns: "http://www.w3.org/2000/svg",
                        width: 18,
                        height: 18,
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: 2,
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                      },
                      [
                        h("rect", {
                          x: 9,
                          y: 9,
                          width: 13,
                          height: 13,
                          rx: 2,
                          ry: 2,
                        }),
                        h("path", {
                          d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
                        }),
                      ],
                    ),
                  ],
                ),
              ],
            },
          ],
        ]}
        remarkPlugins={[remarkGfm]}
        components={{
          code({ children, className, ...props }) {
            return (
              <CodeBlock className={className} {...props}>
                {String(children)}
              </CodeBlock>
            );
          },
          pre({ children, className }) {
            // Let CodeBlock handle mermaid via the code component
            // This ensures consistent DOM structure: <pre><CodeBlock/></pre> or <pre><Mermaid/></pre>
            if (isValidElement(children)) {
              const childClassName = children.props?.className;
              if (
                typeof childClassName === "string" &&
                childClassName.includes("language-carousel")
              ) {
                return <div className="not-prose">{children}</div>;
              }
            }
            return <pre className={className}>{children}</pre>;
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
