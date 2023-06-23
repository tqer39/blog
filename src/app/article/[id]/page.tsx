import { readdirSync } from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import gfm from 'remark-gfm';

import { CodeBlock } from '@/components/CodeBlock';
import Layout from '@/components/Layout';
import { getMarkdown } from '@/lib/markdown';

type Params = {
  params: {
    id: string;
    content?: string;
  };
};

export async function generateStaticParams() {
  const postDirectory = path.join(process.cwd(), 'src/contents');
  const filenames = readdirSync(postDirectory);
  return filenames.map((filename) => ({
    id: filename.replace(/\.md$/, ''),
  }));
}

const Article = async ({ params }: Params) => {
  const content: string = await getMarkdown(params.id);

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
