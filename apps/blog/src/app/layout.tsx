import './globals.css';

import type { Metadata } from 'next';
import { BIZ_UDGothic } from 'next/font/google';

import { FloatingThemeSwitcher } from '@/components/FloatingThemeSwitcher';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

import { Providers } from './Providers';

const bizUDGothic = BIZ_UDGothic({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-biz-ud-gothic',
  display: 'swap',
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "うわむき",
    template: "%s | うわむき",
  },
  description: "上を向いて進んでいく技術ブログ",
  openGraph: {
    title: "うわむき",
    description: "上を向いて進んでいく技術ブログ",
    url: BASE_URL,
    siteName: "うわむき",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "うわむき",
    description: "上を向いて進んでいく技術ブログ",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: BASE_URL,
    types: {
      "application/rss+xml": `${BASE_URL}/feed.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${bizUDGothic.variable} font-sans flex min-h-screen flex-col bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-100`}
        suppressHydrationWarning
      >
        <Providers>
          <FloatingThemeSwitcher />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
