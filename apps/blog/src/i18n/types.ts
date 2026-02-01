export type Locale = 'ja' | 'en';
export type SiteDefaultLocale = 'auto' | 'ja' | 'en';

export interface Messages {
  common: {
    save: string;
    cancel: string;
    loading: string;
    saving: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    noResults: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    actions: string;
    clearSearch: string;
    sortBy: string;
  };
  settings: {
    title: string;
    saveSettings: string;
    saveSuccess: string;
    saveError: string;
    loadError: string;
    basic: {
      title: string;
      siteName: string;
      siteNamePlaceholder: string;
      siteDescription: string;
      siteDescriptionPlaceholder: string;
      authorName: string;
      authorNamePlaceholder: string;
      footerText: string;
      footerTextPlaceholder: string;
    };
    social: {
      title: string;
      hide: string;
      show: string;
    };
    display: {
      title: string;
      showRssLink: string;
      showRssLinkDescription: string;
    };
    appearance: {
      title: string;
      defaultTheme: string;
      defaultThemeDescription: string;
      defaultLocale: string;
      defaultLocaleDescription: string;
      locales: {
        auto: string;
        ja: string;
        en: string;
      };
      themes: {
        system: string;
        light: string;
        dark: string;
        tokyonight: string;
        nordLight: string;
        autumn: string;
      };
    };
    aiTools: {
      title: string;
      description: string;
      openai: {
        label: string;
        description: string;
      };
      anthropic: {
        label: string;
        description: string;
      };
      gemini: {
        label: string;
        description: string;
      };
      apiKeySet: string;
      showApiKey: string;
      hideApiKey: string;
    };
  };
  admin: {
    sidebar: {
      admin: string;
      dashboard: string;
      articles: string;
      newArticle: string;
      categories: string;
      tags: string;
      settings: string;
      expandSidebar: string;
      collapseSidebar: string;
    };
  };
  dashboard: {
    title: string;
    totalArticles: string;
    published: string;
    drafts: string;
    newArticle: string;
    viewAllArticles: string;
    loadError: string;
  };
  articles: {
    title: string;
    newArticle: string;
    searchPlaceholder: string;
    noArticles: string;
    noMatchingArticles: string;
    loadError: string;
    updateError: string;
    deleteError: string;
    deleteConfirm: string;
    filters: {
      all: string;
      published: string;
      draft: string;
    };
    table: {
      image: string;
      title: string;
      status: string;
      date: string;
      tags: string;
      actions: string;
      sortByTitle: string;
      sortByStatus: string;
      sortByDate: string;
    };
    status: {
      published: string;
      draft: string;
    };
    actions: {
      publish: string;
      unpublish: string;
      edit: string;
      delete: string;
    };
  };
  tags: {
    title: string;
    newTag: string;
    searchPlaceholder: string;
    noTags: string;
    noMatchingTags: string;
    loadError: string;
    deleteError: string;
    deleteConfirm: string;
    deleteConfirmWithArticles: string;
    table: {
      name: string;
      articles: string;
      created: string;
      actions: string;
      sortByName: string;
      sortByArticleCount: string;
      sortByCreatedAt: string;
    };
    actions: {
      edit: string;
      delete: string;
    };
  };
  categories: {
    title: string;
    newCategory: string;
    searchPlaceholder: string;
    noCategories: string;
    noMatchingCategories: string;
    loadError: string;
    deleteError: string;
    orderSaveError: string;
    deleteConfirm: string;
    deleteConfirmWithArticles: string;
    dragToReorder: string;
    table: {
      color: string;
      name: string;
      slug: string;
      articles: string;
      created: string;
      actions: string;
      dragHandle: string;
      sortByName: string;
      sortByArticleCount: string;
      sortByCreatedAt: string;
    };
    actions: {
      edit: string;
      delete: string;
    };
  };
  header: {
    search: string;
    searchPlaceholder: string;
    closeSearch: string;
    openSearch: string;
    articles: string;
    admin: string;
    login: string;
    logout: string;
  };
  footer: {
    copyright: string;
    rss: string;
  };
  language: {
    toggle: string;
    ja: string;
    en: string;
  };
  article: {
    tableOfContents: string;
    readingTime: string;
    backToTop: string;
    prevArticle: string;
    nextArticle: string;
  };
  breadcrumb: {
    home: string;
    articles: string;
  };
  preview: {
    title: string;
    articleMode: string;
    slideMode: string;
    headerImage: string;
    noTitle: string;
    noContent: string;
  };
}

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  messages: Messages;
}
