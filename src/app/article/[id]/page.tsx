import { FC } from 'react';
import Layout from '@/components/Layout';

type ArticleProps = {
  params: {
    id: string;

  };
};

const Article: FC<ArticleProps> = ({ params }) => {
  return (
    <>
      <Layout>
        <div className="m-4 font-bold">Blog ID: {params.id}</div>
      </Layout>
    </>
  );
};

export default Article;
