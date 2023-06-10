import { useEffect, useState } from 'react';
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { Spinner } from '@chakra-ui/react';

const ArticleList = () => {
  const [articles, setArticles] = useState<DatabaseObjectResponse[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const res = await fetch('/api/articles');
      const data = await res.json();
      setArticles(data.results);
    };

    fetchArticles();
  }, []);

  if (!articles) {
    return <Spinner />;
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
        <Spinner/>
      )}
    </>
  );
};

export default ArticleList;
