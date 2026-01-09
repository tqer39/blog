import { getSiteSettings } from '@/lib/siteSettings';
import { HeaderClient } from './HeaderClient';

export async function Header() {
  const settings = await getSiteSettings();

  return <HeaderClient siteName={settings.site_name} />;
}
