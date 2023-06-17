import Layout from '@/components/Layout';
import { getPostData } from '@/lib/getArticle';

const Article = ({ params }: { params: { id: string } }) => {
  const data: { content: string } = getPostData(params.id);

  return (
    <Layout>
      {data.content && data.content !== '' ? (
        <div className="flex flex-col items-center justify-center">
          <p className="text-xl">{JSON.stringify(data)}</p>
        </div>
      ) : (
        <p>
          <div>no data</div>
        </p>
      )}
    </Layout>
  );
};

export default Article;
