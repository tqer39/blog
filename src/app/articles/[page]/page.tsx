import BlogCard from '../../../components/BlogCard';
import Layout from '../../../components/Layout';
import PageNation from '../../../components/PageNation';
import { BlogPost, getArticleMetadata } from '../../../lib/notion';

type ArticlesProps = {
  params?: {
    page: number;
  };
};

const Articles = async ({ params = { page: 1 } }: ArticlesProps) => {
  const { page } = params;
  const articles: BlogPost = await getArticleMetadata();
  const PER_PAGE = 10;

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
      <PageNation
        current={page}
        last={Math.ceil(articles.length / PER_PAGE)}
        articles={articles.length}
        perPage={PER_PAGE}
      />
    </Layout>
  );
};

export default Articles;
