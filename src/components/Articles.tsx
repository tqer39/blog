import Link from 'next/link';
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
        {articles && articles.length > 0 ? (
          articles.map((article) => {
            return (
              <div key={article.id}>
                <Link href={`/article/${article.article_id}`} passHref>
                  {article.title}
                </Link>
              </div>
            );
          })
        ) : (
          <div>no data</div>
        )}
      </div>
    </Layout>
  );
};

export default Articles;