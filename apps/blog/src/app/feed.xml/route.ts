import { getAllArticles } from '@/lib/articles';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
const SITE_TITLE = "tqer39's blog";
const SITE_DESCRIPTION = 'Personal blog by tqer39';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const result = await getAllArticles();
  const articles = result.ok ? result.data : [];

  const rssItems = articles
    .slice(0, 20) // Limit to 20 most recent articles
    .map((article) => {
      const pubDate = new Date(
        article.publishedAt || article.createdAt
      ).toUTCString();
      const description = article.description || article.title;

      return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${BASE_URL}/article/${article.hash}</link>
      <guid isPermaLink="true">${BASE_URL}/article/${article.hash}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      ${article.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
    </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
