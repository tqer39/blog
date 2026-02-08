import type { SiteSettings, SiteSettingsResponse } from '@blog/cms-types';
import { DEFAULT_API_URL } from '@blog/config';

const API_URL = process.env.CMS_API_URL || DEFAULT_API_URL;

// Default values (fallback when API is unavailable)
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: "tqer39's blog",
  site_description: '未来の自分に向けた技術ログ',
  author_name: 'tqer39',
  author_avatar_id: '',
  footer_text: '',
  social_github: 'https://github.com/tqer39',
  social_twitter: 'https://x.com/tqer39',
  social_bento: 'https://bento.me/tqer39',
  social_bluesky: '',
  social_threads: '',
  social_linkedin: '',
  social_wantedly: '',
  social_lapras: '',
  social_devto: '',
  social_hackernews: '',
  social_hatena: '',
  social_medium: '',
  social_note: '',
  social_qiita: '',
  social_reddit: '',
  social_techfeed: '',
  social_zenn: '',
  show_rss_link: 'true',
  show_github_link: 'true',
  show_twitter_link: 'true',
  show_bento_link: 'true',
  show_bluesky_link: 'true',
  show_threads_link: 'true',
  show_linkedin_link: 'true',
  show_wantedly_link: 'true',
  show_lapras_link: 'true',
  show_devto_link: 'true',
  show_hackernews_link: 'true',
  show_hatena_link: 'true',
  show_medium_link: 'true',
  show_note_link: 'true',
  show_qiita_link: 'true',
  show_reddit_link: 'true',
  show_techfeed_link: 'true',
  show_zenn_link: 'true',
  default_theme: 'system',
  default_locale: 'auto', // "auto" | "ja" | "en"
  // AI API keys (empty by default, set via admin settings or environment variables)
  ai_openai_api_key: '',
  ai_anthropic_api_key: '',
  ai_gemini_api_key: '',
};

/**
 * Fetches site settings from CMS API
 * Falls back to defaults if API is unavailable
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const response = await fetch(`${API_URL}/settings`, {
      next: { revalidate: 60 }, // 60 seconds cache
    });

    if (!response.ok) {
      console.error(`Failed to fetch site settings: HTTP ${response.status}`);
      return DEFAULT_SITE_SETTINGS;
    }

    const data: SiteSettingsResponse = await response.json();
    return data.settings;
  } catch (error) {
    // Network errors, parse errors, etc.
    console.error('Failed to fetch site settings:', error);
    return DEFAULT_SITE_SETTINGS;
  }
}
