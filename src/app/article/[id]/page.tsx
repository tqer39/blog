import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import gfm from 'remark-gfm';

import { CodeBlock } from '@/components/CodeBlock';
import Layout from '@/components/Layout';
import { getMarkdown, markdownToHtml } from '@/lib/markdown';

async function getArticle(id: string) {
  const content = await getMarkdown(id);
  const html = await markdownToHtml(content);
  return html;
}

const Article = async ({ params }: { params: { id: string } }) => {
  const content: string = await getArticle(params.id);

  return (
    <Layout>
      {content && content !== '' ? (
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          components={CodeBlock}
          remarkPlugins={[gfm]}
          className="prose prose-stone m-auto mt-5 max-w-4xl"
        >
          {content}
        </ReactMarkdown>
      ) : (
        <p>
          <div>no data</div>
        </p>
      )}
    </Layout>
  );
};

export default Article;
