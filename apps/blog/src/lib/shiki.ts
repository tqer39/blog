import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
} from "shiki";

let highlighter: Highlighter | null = null;

const SUPPORTED_LANGUAGES: BundledLanguage[] = [
  "typescript",
  "javascript",
  "tsx",
  "jsx",
  "python",
  "bash",
  "shellscript",
  "json",
  "yaml",
  "markdown",
  "html",
  "css",
  "sql",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
];

export async function getShikiHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: SUPPORTED_LANGUAGES,
    });
  }
  return highlighter;
}

export interface HighlightOptions {
  code: string;
  lang: string;
  theme?: "light" | "dark";
}

export async function highlightCode({
  code,
  lang,
  theme = "dark",
}: HighlightOptions): Promise<string> {
  const hl = await getShikiHighlighter();

  const themeName = theme === "light" ? "github-light" : "github-dark";
  const language = SUPPORTED_LANGUAGES.includes(lang as BundledLanguage)
    ? (lang as BundledLanguage)
    : "typescript";

  return hl.codeToHtml(code, {
    lang: language,
    theme: themeName,
  });
}
