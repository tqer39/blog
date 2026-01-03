import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

import { Providers } from './Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "tqer39's blog",
    template: "%s | tqer39's blog",
  },
  description: "Personal blog by tqer39",
  openGraph: {
    title: "tqer39's blog",
    description: "Personal blog by tqer39",
    url: BASE_URL,
    siteName: "tqer39's blog",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "tqer39's blog",
    description: "Personal blog by tqer39",
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
        className={`${inter.variable} font-sans flex min-h-screen flex-col bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-100`}
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
