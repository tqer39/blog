import type { SiteSettings, SiteSettingsResponse } from '@blog/cms-types';
import { DEFAULT_API_URL } from '@blog/config';

const API_URL = process.env.CMS_API_URL || DEFAULT_API_URL;

// Default values (fallback when API is unavailable)
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: "tqer39's blog",
  site_description: '未来の自分に向けた技術ログ',
  author_name: 'tqer39',
  footer_text: '',
  social_github: 'https://github.com/tqer39',
  social_twitter: 'https://twitter.com/tqer39',
  social_bento: 'https://bento.me/tqer39',
  show_rss_link: 'true',
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
