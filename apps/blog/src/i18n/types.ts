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
      testButton: string;
      testConfirm: string;
      testSuccess: string;
      testError: string;
      clearButton: string;
      clearConfirm: string;
    };
    apiKey: {
      title: string;
      description: string;
      noKey: string;
      hasKey: string;
      createdAt: string;
      enabled: string;
      disabled: string;
      generate: string;
      regenerate: string;
      disable: string;
      enable: string;
      copyKey: string;
      copied: string;
      warning: string;
      generatedKey: string;
      confirmRegenerate: string;
      generateError: string;
      statusError: string;
      enableError: string;
      disableError: string;
    };
    unsavedChanges: string;
  };
  admin: {
    sidebar: {
      admin: string;
      dashboard: string;
      articles: string;
      newArticle: string;
      tags: string;
      images: string;
      categories: string;
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
    bulkActions: {
      selectAll: string;
      selected: string;
      delete: string;
      publish: string;
      unpublish: string;
      confirmDelete: string;
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
    editor: {
      editTitle: string;
      createTitle: string;
      name: string;
      namePlaceholder: string;
      usedInArticles: string;
      saveError: string;
      nameRequired: string;
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
    editor: {
      editTitle: string;
      createTitle: string;
      name: string;
      namePlaceholder: string;
      slug: string;
      slugPlaceholder: string;
      slugDescription: string;
      color: string;
      usedInArticles: string;
      saveError: string;
      nameRequired: string;
      slugRequired: string;
      slugInvalid: string;
    };
  };
  images: {
    title: string;
    searchPlaceholder: string;
    noImages: string;
    noMatchingImages: string;
    loadError: string;
    deleteError: string;
    deleteConfirm: string;
    viewMode: {
      grid: string;
      list: string;
    };
    table: {
      thumbnail: string;
      filename: string;
      originalFilename: string;
      size: string;
      mimeType: string;
      createdAt: string;
      actions: string;
      sortByFilename: string;
      sortBySize: string;
      sortByCreatedAt: string;
    };
    actions: {
      copyUrl: string;
      openNewTab: string;
      delete: string;
      copied: string;
    };
    detail: {
      title: string;
      filename: string;
      originalFilename: string;
      size: string;
      mimeType: string;
      createdAt: string;
      url: string;
    };
    bulkActions: {
      selectAll: string;
      selected: string;
      delete: string;
      confirmDelete: string;
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
  publicArticles: {
    allArticles: string;
    latestArticles: string;
    viewAll: string;
    noArticles: string;
    noMatchingTags: string;
    noArticlesOnPage: string;
    noSearchResults: string;
    searchResults: string;
    resultCount: string;
    clear: string;
  };
  filter: {
    category: string;
    tags: string;
    clearFilters: string;
    showLess: string;
    showAll: string;
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
    updated: string;
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
  editor: {
    newArticle: string;
    editArticle: string;
    status: string;
    draft: string;
    published: string;
    aiReview: string;
    reviewing: string;
    preview: string;
    cancel: string;
    save: string;
    saving: string;
    saved: string;
    title: string;
    titlePlaceholder: string;
    descriptionAndTags: string;
    description: string;
    descriptionPlaceholder: string;
    characterCount: string;
    tags: string;
    tagsPlaceholder: string;
    loadingTags: string;
    category: string;
    selectCategory: string;
    loadingCategories: string;
    articleCount: string;
    slideMode: string;
    enableSlideMode: string;
    slideModeHelp: string;
    duration: string;
    durationHelp: string;
    headerImage: string;
    noImage: string;
    upload: string;
    uploading: string;
    aiGenerate: string;
    generating: string;
    content: string;
    aiOutline: string;
    contentPlaceholder: string;
    uploadingImage: string;
    characters: string;
    contentEditorTitle: string;
    draftRecovery: {
      title: string;
      savedAt: string;
      discard: string;
      restore: string;
    };
    selectFromLibrary: string;
    imagePicker: {
      title: string;
      searchPlaceholder: string;
      loading: string;
      noImages: string;
      imageCount: string;
      cancel: string;
    };
    imageGeneration: {
      useArticleContent: string;
      customPrompt: string;
      optional: string;
      required: string;
      additionalInstructions: string;
      describeImage: string;
      mode: string;
      append: string;
      override: string;
      generate: string;
    };
    toolbar: {
      bold: string;
      italic: string;
      heading: string;
      list: string;
      codeBlock: string;
      link: string;
      emoji: string;
      fullscreen: string;
      aiContinuation: string;
      continuationTitle: string;
      continuationHelp: string;
      short: string;
      medium: string;
      long: string;
      confidence: string;
      generateSuggestion: string;
    };
    emojiPicker: {
      searchPlaceholder: string;
      noResults: string;
      smileys: string;
      gestures: string;
      symbols: string;
      food: string;
      activities: string;
      tech: string;
      nature: string;
    };
    previousResult: string;
  };
  aiModelSettings: {
    title: string;
    reset: string;
    metadata: string;
    image: string;
    claudeAnthropic: string;
    review: string;
    outline: string;
    transform: string;
    continuation: string;
  };
}

export type TranslationParams = Record<string, string | number>;

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslationParams) => string;
  messages: Messages;
}
