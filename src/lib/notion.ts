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
  article_id: string;
  title: string;
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

      const createDate = (
        post.properties.create_date as { date: { start: string } }
      ).date.start;
      const tags = (
        post.properties.tags as { multi_select: { name: string }[] }
      ).multi_select.map((tag) => tag.name);
      const status = (post.properties.status as { status: { name: string } })
        .status.name;
      const update_date = (
        post.properties.update_date as { last_edited_time: string }
      ).last_edited_time;
      const article_id = (
        post.properties.article_id as { title: { plain_text: string }[] }
      ).title[0].plain_text;
      const title = (
        post.properties.title as { rich_text: { plain_text: string }[] }
      ).rich_text[0].plain_text;

      const postInfo = {
        id: post.id || '',
        lastEditedTime: post.last_edited_time || '',
        create_date: createDate || '',
        tags: tags || [],
        status: status || '',
        update_date: update_date || '',
        article_id: article_id || '',
        title: title || '',
      };

      return postInfo;
    }),
  );

  return responseWithProperties.filter((post) => post !== null) as BlogPost;
};
