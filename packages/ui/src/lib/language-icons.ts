import type { ComponentType } from 'react';
import {
  SiCss3,
  SiDocker,
  SiGnubash,
  SiGo,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiMarkdown,
  SiPython,
  SiRust,
  SiTerraform,
  SiTypescript,
  SiYaml,
} from 'react-icons/si';

/**
 * 言語名からアイコンコンポーネントへのマッピング。
 *
 * CodeBlock, CodeDiff 等で共通利用。
 */
export const LANGUAGE_ICONS: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  typescript: SiTypescript,
  tsx: SiTypescript,
  javascript: SiJavascript,
  jsx: SiJavascript,
  python: SiPython,
  go: SiGo,
  rust: SiRust,
  html: SiHtml5,
  css: SiCss3,
  json: SiJson,
  yaml: SiYaml,
  markdown: SiMarkdown,
  bash: SiGnubash,
  shellscript: SiGnubash,
  terraform: SiTerraform,
  hcl: SiTerraform,
  dockerfile: SiDocker,
  docker: SiDocker,
};

/**
 * 言語名からアイコンコンポーネントを取得。
 *
 * @param lang 言語名
 * @returns アイコンコンポーネント (未登録の場合は undefined)
 */
export function getLanguageIcon(
  lang: string
): ComponentType<{ className?: string }> | undefined {
  return LANGUAGE_ICONS[lang];
}
