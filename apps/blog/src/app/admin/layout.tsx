import Link from "next/link";
import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
        <div className="flex h-16 items-center border-b border-stone-200 px-6 dark:border-stone-700">
          <Link href="/admin" className="text-xl font-bold">
            Admin
          </Link>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin"
                className="block rounded-lg px-4 py-2 text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/articles"
                className="block rounded-lg px-4 py-2 text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700"
              >
                Articles
              </Link>
            </li>
            <li>
              <Link
                href="/admin/articles/new"
                className="block rounded-lg px-4 py-2 text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700"
              >
                New Article
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-4 left-4">
          <Link
            href="/"
            className="text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
          >
            ← Back to Blog
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
