import type { SiteSettings, SiteSettingsResponse } from '@blog/cms-types';
import { DEFAULT_API_URL } from '@blog/config';
import { createFetchClient } from '@blog/utils';

const API_URL = process.env.CMS_API_URL || DEFAULT_API_URL;

const fetchApi = createFetchClient({
  baseUrl: API_URL,
});

// Default values (fallback when API is unavailable)
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: 'tB',
  site_description: '未来の自分に向けた技術ログ',
  author_name: 'tqer39',
  footer_text: '',
  social_github: 'https://github.com/tqer39',
  social_twitter: 'https://twitter.com/tqer39',
  social_bento: 'https://bento.me/tqer39',
};

/**
 * Fetches site settings from CMS API
 * Falls back to defaults if API is unavailable
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const data = await fetchApi<SiteSettingsResponse>('/settings', {
      next: { revalidate: 60 }, // 60 seconds cache
    });
    return data.settings;
  } catch (error) {
    console.error('Failed to fetch site settings:', error);
    return DEFAULT_SITE_SETTINGS;
  }
}
