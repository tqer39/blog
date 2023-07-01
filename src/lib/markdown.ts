import { readFileSync } from 'fs';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';

export const getMarkdown = async (id: string) => {
  const filePath = path.join(process.cwd(), 'src/contents', `${id}.md`);
  const fileContents = readFileSync(filePath, 'utf8');
  return fileContents;
};

export const markdownToHtml = async (markdownContent: string) => {
  const result = await remark().use(html).process(markdownContent);
  return result.toString();
};
