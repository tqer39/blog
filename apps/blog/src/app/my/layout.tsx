import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { AdminSidebar } from './components/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Login page uses minimal layout
  if (pathname === '/my/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full flex-1 bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
