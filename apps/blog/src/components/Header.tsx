import { isAuthenticated } from '@/lib/auth';
import { getSiteSettings } from '@/lib/siteSettings';
import { HeaderClient } from './HeaderClient';

export async function Header() {
  const settings = await getSiteSettings();
  const loggedIn = await isAuthenticated();

  return (
    <HeaderClient
      siteName={settings.site_name}
      isLoggedIn={loggedIn}
      authorAvatarId={settings.author_avatar_id}
    />
  );
}
