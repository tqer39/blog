-- Add API key management settings
INSERT INTO site_settings (key, value) VALUES
  ('cms_api_key_hash', ''),
  ('cms_api_key_created_at', ''),
  ('cms_api_key_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
