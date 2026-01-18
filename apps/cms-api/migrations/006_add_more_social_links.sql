-- Add more social link fields
INSERT INTO site_settings (key, value) VALUES ('social_bluesky', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('social_threads', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('social_linkedin', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('social_wantedly', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('social_lapras', '') ON CONFLICT (key) DO NOTHING;

-- Add display flags for new social links
INSERT INTO site_settings (key, value) VALUES ('show_bluesky_link', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('show_threads_link', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('show_linkedin_link', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('show_wantedly_link', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('show_lapras_link', 'true') ON CONFLICT (key) DO NOTHING;
