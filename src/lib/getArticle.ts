import { readFileSync } from 'fs';
import path from 'path';

export function getPostData(id: string) {
  // [DEBUG]
  // console.log(`id: ${JSON.stringify(id)}`);

  const postDirectory = path.join(process.cwd(), 'src/contents', `${id}.md`);
  try {
    return {
      content: readFileSync(postDirectory, 'utf8'),
    };
  } catch (error) {
    console.log(`error: ${JSON.stringify(error)}`);
    return {
      content: '',
    };
  }
}
