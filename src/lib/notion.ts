import { Client } from '@notionhq/client';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

type BlogPost = {
  id: string;
  lastEditedTime: string;
  create_date: string;
  tags: string[];
  status: string;
  update_date: string;
}[];

export const getArticleMetadata = async (): Promise<BlogPost> => {
  const response: QueryDatabaseResponse = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID as string,
  });

  // [DEBUG]
  // console.log(`response: ${JSON.stringify(response)}`)

  const responseWithProperties = await Promise.all(
    response.results.map(async (post) => {
      if (!('properties' in post)) return null;

      const pageId = post.id;
      const createDate = (
        post.properties.create_date as { date: { start: string } }
      ).date.start;
      const tags = (
        post.properties.tags as { multi_select: { name: string }[] }
      ).multi_select.map((tag) => tag.name);
      const status = (
        post.properties.status as { select: { name: string } }
      ).select.name;
      const update_date = (
        post.properties.update_date as { date: { start: string } }
      ).date.start;

      // 必要となるPropertiesの取得
      const postInfo = {
        id: pageId || '',
        lastEditedTime: post.last_edited_time || '',
        create_date: createDate || '',
        tags: tags || [],
        status: status || '',
        update_date: update_date || '',
      };

      return postInfo;
    }),
  );

  return responseWithProperties.filter((post) => post !== null) as BlogPost;
};
