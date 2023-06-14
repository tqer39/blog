import { getArticleMetadata } from '../lib/notion';
import Layout from './Layout';

const Articles = async () => {
  const articles = await getArticleMetadata();

  if (!articles) {
    return <div>Loading...</div>;
  }
  return (
    <Layout>
      <div>
        {articles ? (
          articles.map((article) => <div key={article.id}>{article.id}</div>)
        ) : (
          <div>no data</div>
        )}
      </div>
    </Layout>
  );
};

export default Articles;
