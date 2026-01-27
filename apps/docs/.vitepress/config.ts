import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Blog Docs",
  description: "Documentation for the blog service",

  locales: {
    root: {
      label: "English",
      lang: "en",
      themeConfig: {
        nav: [{ text: "Guide", link: "/guide/markdown" }],
        sidebar: [
          {
            text: "Guide",
            items: [
              { text: "Markdown Basics", link: "/guide/markdown" },
              { text: "Images", link: "/guide/images" },
              { text: "Frontmatter", link: "/guide/frontmatter" },
              { text: "Code Blocks", link: "/guide/code-blocks" },
              { text: "Special Components", link: "/guide/components" },
            ],
          },
        ],
      },
    },
    ja: {
      label: "Japanese",
      lang: "ja",
      themeConfig: {
        nav: [{ text: "ガイド", link: "/ja/guide/markdown" }],
        sidebar: [
          {
            text: "ガイド",
            items: [
              { text: "Markdown 基本記法", link: "/ja/guide/markdown" },
              { text: "画像", link: "/ja/guide/images" },
              { text: "Frontmatter", link: "/ja/guide/frontmatter" },
              { text: "コードブロック", link: "/ja/guide/code-blocks" },
              { text: "特殊コンポーネント", link: "/ja/guide/components" },
            ],
          },
        ],
      },
    },
  },

  themeConfig: {
    search: {
      provider: "local",
    },
    socialLinks: [{ icon: "github", link: "https://github.com/tqer39/blog" }],
    footer: {
      message: "Blog Documentation",
    },
  },
});
