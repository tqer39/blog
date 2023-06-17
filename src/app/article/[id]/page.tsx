import { FC } from 'react';

type ArticleProps = {
  params: {
    id: string;

  };
};

const Article: FC<ArticleProps> = ({ params }) => {
  return (
    <>
      <div className="m-4 font-bold">Blog ID: {params.id}</div>
    </>
  );
};

export default Article;
