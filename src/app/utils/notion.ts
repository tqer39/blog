import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const getFirstRowFromDatabase = async (databaseId: string) => {
  const response = await notion.databases.query({
    database_id: databaseId as string,
  });

  const firstRow = response.results[0];
  console.log(firstRow);

  return firstRow;
};
