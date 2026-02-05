-- Add blog platform social link fields
INSERT INTO site_settings (key, value) VALUES ('social_hatena', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('social_medium', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('social_note', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('social_techfeed', '') ON CONFLICT (key) DO NOTHING;

-- Add display flags for new social links
INSERT INTO site_settings (key, value) VALUES ('show_hatena_link', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('show_medium_link', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('show_note_link', 'true') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('show_techfeed_link', 'true') ON CONFLICT (key) DO NOTHING;
