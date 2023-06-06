import './globals.css';
import { Inter } from 'next/font/google';
import Page from './page';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'engineering logs',
  description: 'Created by tqer39',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Page>{children}</Page>
      </body>
    </html>
  );
}
