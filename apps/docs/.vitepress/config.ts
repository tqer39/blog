import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Blog Docs",
  description: "Documentation for the blog service",

  locales: {
    root: {
      label: "English",
      lang: "en",
      themeConfig: {
        nav: [{ text: "Guide", link: "/guide/code-blocks" }],
        sidebar: [
          {
            text: "Guide",
            items: [{ text: "Code Blocks", link: "/guide/code-blocks" }],
          },
        ],
      },
    },
    ja: {
      label: "Japanese",
      lang: "ja",
      themeConfig: {
        nav: [{ text: "Guide", link: "/ja/guide/code-blocks" }],
        sidebar: [
          {
            text: "Guide",
            items: [{ text: "Code Blocks", link: "/ja/guide/code-blocks" }],
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
