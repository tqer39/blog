import Link from "next/link";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { LogoutButton } from "./components/LogoutButton";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Login page uses minimal layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="relative w-64 border-r bg-background">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/admin" className="text-xl font-bold">
            Admin
          </Link>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin"
                className="block rounded-lg px-4 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/articles"
                className="block rounded-lg px-4 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Articles
              </Link>
            </li>
            <li>
              <Link
                href="/admin/articles/new"
                className="block rounded-lg px-4 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                New Article
              </Link>
            </li>
            <li>
              <Link
                href="/admin/tags"
                className="block rounded-lg px-4 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Tags
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <LogoutButton />
          <Link
            href="/"
            className="block text-sm text-muted-foreground hover:text-foreground"
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
