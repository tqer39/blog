import { useEffect, useState } from 'react';
// import { Database } from '@notionhq/client';
import { getFirstRowFromDatabase } from '../utils/notion';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

interface ArticleType {
  title: string;
  // 他のプロパティ...
}

const ArticleList = () => {
  const [article, setArticle] = useState<ArticleType | null>(null);
  const databaseId = process.env.NOTION_DATABASE_ID || ''; // replace with your Database ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFirstRowFromDatabase(databaseId); // あなたのデータベースIDに置き換えてください
        if ("properties" in data) {
          // setArticle({ title: data });
          // data is of type PageObjectResponse
          const pageData = data as PageObjectResponse;
          if (pageData.properties.Name.type === 'rich_text') {
            const richTextProperty = pageData.properties.Name;
            setArticle({ title: richTextProperty.rich_text[0].plain_text });
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  if (!article) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h2>{article.title}</h2>
      {/* 他の記事の詳細を表示する */}
    </>
  );
};

export default ArticleList;
