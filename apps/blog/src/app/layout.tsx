import './globals.css';

import type { Metadata } from 'next';
import { BIZ_UDGothic } from 'next/font/google';

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
    default: "tB",
    template: "%s | tB",
  },
  description: "未来の自分に向けた技術ログ",
  openGraph: {
    title: "tB",
    description: "未来の自分に向けた技術ログ",
    url: BASE_URL,
    siteName: "tB",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "tB",
    description: "未来の自分に向けた技術ログ",
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
        className={`${bizUDGothic.variable} font-sans flex min-h-screen flex-col bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
