'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n';

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';
const MOBILE_BREAKPOINT = 1024; // lg breakpoint

export function AdminSidebar() {
  const { t } = useI18n();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAutoCollapsed, setIsAutoCollapsed] = useState(false);
  const [userPreference, setUserPreference] = useState<boolean | null>(null);

  // Initialize on mount
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    const preference = stored === 'true';
    setUserPreference(preference);

    const shouldAutoCollapse = window.innerWidth < MOBILE_BREAKPOINT;
    setIsAutoCollapsed(shouldAutoCollapse);
    setIsCollapsed(shouldAutoCollapse || preference);
  }, []);

  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      const shouldAutoCollapse = window.innerWidth < MOBILE_BREAKPOINT;
      const wasAutoCollapsed = isAutoCollapsed;
      setIsAutoCollapsed(shouldAutoCollapse);

      if (shouldAutoCollapse) {
        setIsCollapsed(true);
      } else if (wasAutoCollapsed && userPreference !== null) {
        // Restore user preference when expanding from auto-collapsed state
        setIsCollapsed(userPreference);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAutoCollapsed, userPreference]);

  const toggleSidebar = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    // Only save preference if not auto-collapsed
    if (!isAutoCollapsed) {
      setUserPreference(newValue);
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
    }
  };

  return (
    <aside
      className={`sticky top-0 flex h-screen flex-col border-r bg-background transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <Link href="/my" className="text-xl font-bold">
            {t('admin.sidebar.admin')}
          </Link>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className={`rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={
            isCollapsed
              ? t('admin.sidebar.expandSidebar')
              : t('admin.sidebar.collapseSidebar')
          }
          aria-label={
            isCollapsed
              ? t('admin.sidebar.expandSidebar')
              : t('admin.sidebar.collapseSidebar')
          }
        >
          {isCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          <NavItem
            href="/my/dashboard"
            icon={<DashboardIcon />}
            label={t('admin.sidebar.dashboard')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/my/articles"
            icon={<ArticlesIcon />}
            label={t('admin.sidebar.articles')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/my/articles/new"
            icon={<NewArticleIcon />}
            label={t('admin.sidebar.newArticle')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/my/tags"
            icon={<TagsIcon />}
            label={t('admin.sidebar.tags')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/my/images"
            icon={<ImagesIcon />}
            label={t('admin.sidebar.images')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/my/categories"
            icon={<CategoriesIcon />}
            label={t('admin.sidebar.categories')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/my/settings"
            icon={<SettingsIcon />}
            label={t('admin.sidebar.settings')}
            isCollapsed={isCollapsed}
          />
        </ul>
      </nav>
    </aside>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

function NavItem({ href, icon, label, isCollapsed }: NavItemProps) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground ${
          isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2'
        }`}
        title={isCollapsed ? label : undefined}
      >
        {icon}
        {!isCollapsed && <span>{label}</span>}
      </Link>
    </li>
  );
}

function DashboardIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function ArticlesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M2 15h10" />
      <path d="m9 18 3-3-3-3" />
    </svg>
  );
}

function NewArticleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
    </svg>
  );
}

function TagsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function CategoriesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
      <path d="M18 3h-4a2 2 0 0 0-2 2v4c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
      <path d="M18 13h-4a2 2 0 0 0-2 2v4c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Z" />
    </svg>
  );
}

function ImagesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
