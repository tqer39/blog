import { BlogPost, getArticleMetadata } from '../lib/notion';
import BlogCard from './BlogCard';
import Layout from './Layout';

const Articles = async () => {
  const articles: BlogPost = await getArticleMetadata();

  if (!articles) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-y-16">
          {articles && articles.length > 0 ? (
            articles.map((article) => {
              return (
                <div key={article.id}>
                  <BlogCard article={article} />
                </div>
              );
            })
          ) : (
            <div>no data</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Articles;
