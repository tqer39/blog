-- Add developer/tech community social link fields
INSERT INTO site_settings (key, value) VALUES ('social_devto', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('social_hackernews', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('social_qiita', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('social_reddit', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('social_zenn', '') ON CONFLICT (key) DO NOTHING;

-- Add display flags for new social links
INSERT INTO site_settings (key, value) VALUES ('show_devto_link', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('show_hackernews_link', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('show_qiita_link', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('show_reddit_link', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('show_zenn_link', 'true') ON CONFLICT (key) DO NOTHING;
