-- Add CORS configuration for your domains
-- Run this in Supabase SQL Editor

-- Remove any existing CORS settings
DELETE FROM auth.config WHERE key = 'cors_origins';

-- Add your domains to CORS
INSERT INTO auth.config (key, value) 
VALUES 
  ('cors_origins', '["https://destinydarshan.com", "https://www.destinydarshan.com", "https://*.vercel.app", "http://localhost:3000"]');

-- Verify the settings
SELECT * FROM auth.config WHERE key = 'cors_origins';
