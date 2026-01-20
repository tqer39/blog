-- Add show_rss_link setting (default: true)
INSERT INTO site_settings (key, value) VALUES ('show_rss_link', 'true')
ON CONFLICT (key) DO NOTHING;
