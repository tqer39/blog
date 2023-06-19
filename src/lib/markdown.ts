import { readFileSync } from "fs";
import matter from "gray-matter";

export const getMarkdown = (filePath: string) => {
  const fileContents = readFileSync(filePath, "utf8");

  return matter(fileContents);
};
