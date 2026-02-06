import type { AIProvider } from '@blog/cms-types';

// Social link prefixes for each service
export const SOCIAL_PREFIXES = {
  github: 'https://github.com/',
  twitter: 'https://x.com/',
  bento: 'https://bento.me/',
  bluesky: 'https://bsky.app/profile/',
  threads: 'https://www.threads.net/@',
  linkedin: 'https://www.linkedin.com/in/',
  wantedly: 'https://www.wantedly.com/id/',
  lapras: 'https://lapras.com/public/',
  devto: 'https://dev.to/',
  hackernews: 'https://news.ycombinator.com/user?id=',
  hatena: 'https://', // Special: {id}.hatenablog.com format
  medium: 'https://medium.com/@',
  note: 'https://note.com/',
  qiita: 'https://qiita.com/',
  reddit: 'https://www.reddit.com/user/',
  techfeed: 'https://techfeed.io/people/@',
  zenn: 'https://zenn.dev/',
} as const;

// API key field configuration
export const API_KEY_FIELDS = [
  {
    key: 'ai_openai_api_key' as const,
    provider: 'openai' as AIProvider,
    labelKey: 'settings.aiTools.openai.label',
    descriptionKey: 'settings.aiTools.openai.description',
    placeholder: 'sk-...',
  },
  {
    key: 'ai_anthropic_api_key' as const,
    provider: 'anthropic' as AIProvider,
    labelKey: 'settings.aiTools.anthropic.label',
    descriptionKey: 'settings.aiTools.anthropic.description',
    placeholder: 'sk-ant-...',
  },
  {
    key: 'ai_gemini_api_key' as const,
    provider: 'gemini' as AIProvider,
    labelKey: 'settings.aiTools.gemini.label',
    descriptionKey: 'settings.aiTools.gemini.description',
    placeholder: 'AIza...',
  },
] as const;

// Extract ID from full URL
export function extractSocialId(
  url: string,
  service: keyof typeof SOCIAL_PREFIXES
): string {
  if (!url) return '';

  // Special handling for Hatena Blog (https://{id}.hatenablog.com/)
  if (service === 'hatena') {
    const hatenaMatch = url.match(
      /^https?:\/\/([^.]+)\.hatenablog\.(com|jp|ne\.jp)\/?$/
    );
    if (hatenaMatch) {
      return hatenaMatch[1];
    }
    // If it's not a full URL, treat it as an ID
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return url;
    }
    return '';
  }

  const prefix = SOCIAL_PREFIXES[service];
  if (url.startsWith(prefix)) {
    return url.slice(prefix.length).replace(/\/$/, '');
  }
  // Handle legacy twitter.com URLs
  if (service === 'twitter' && url.startsWith('https://twitter.com/')) {
    return url.slice('https://twitter.com/'.length).replace(/\/$/, '');
  }
  // If it's not a full URL, treat it as an ID
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url;
  }
  return '';
}

// Build full URL from ID
export function buildSocialUrl(
  id: string,
  service: keyof typeof SOCIAL_PREFIXES
): string {
  if (!id) return '';

  // Special handling for Hatena Blog (https://{id}.hatenablog.com/)
  if (service === 'hatena') {
    return `https://${id}.hatenablog.com/`;
  }

  return `${SOCIAL_PREFIXES[service]}${id}`;
}
