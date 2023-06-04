import { useEffect, useState } from 'react';
import { PartialBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const ArticleList = () => {
  const [articles, setArticles] = useState<PartialBlockObjectResponse[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const res = await fetch('/api/articles');
      const data = await res.json();
      setArticles(data.results);
    };

    fetchArticles();
  }, []);

  if (!articles) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {articles && articles.length > 0 ? (
        articles.map((article) => (
          <div key={article.id}>
            <h2>{article.id}</h2>
            {/* 他の記事の詳細を表示する */}
          </div>
        ))
      ) : (
        <p>No articles found</p>
      )}
    </>
  );
};

export default ArticleList;
