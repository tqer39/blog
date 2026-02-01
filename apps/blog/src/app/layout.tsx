import './globals.css';

import type { Metadata } from 'next';
import { BIZ_UDGothic } from 'next/font/google';
import Script from 'next/script';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { getSiteSettings } from '@/lib/siteSettings';

import { Providers } from './Providers';

const bizUDGothic = BIZ_UDGothic({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-biz-ud-gothic',
  display: 'swap',
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: settings.site_name,
      template: `%s | ${settings.site_name}`,
    },
    description: settings.site_description,
    openGraph: {
      title: settings.site_name,
      description: settings.site_description,
      url: BASE_URL,
      siteName: settings.site_name,
      locale: 'ja_JP',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.site_name,
      description: settings.site_description,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: BASE_URL,
      types: {
        'application/rss+xml': `${BASE_URL}/feed.xml`,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html lang="ja" suppressHydrationWarning>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}
      <body
        className={`${bizUDGothic.variable} font-sans flex min-h-screen flex-col bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Providers defaultTheme={settings.default_theme} defaultLocale={settings.default_locale as 'auto' | 'ja' | 'en'}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
