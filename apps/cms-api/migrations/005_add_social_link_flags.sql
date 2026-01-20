-- Add display flags for social links
INSERT INTO site_settings (key, value) VALUES ('show_github_link', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('show_twitter_link', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('show_bento_link', 'true') ON CONFLICT (key) DO NOTHING;
