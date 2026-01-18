'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  compact?: boolean;
}

export function LogoutButton({ compact = false }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`flex w-full cursor-pointer items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground ${
        compact ? 'justify-center p-3' : 'gap-3 px-4 py-2'
      }`}
      title={compact ? 'Logout' : undefined}
    >
      <LogOut className="h-5 w-5" />
      {!compact && <span>Logout</span>}
    </button>
  );
}
