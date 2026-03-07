-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT platform_settings_id_check CHECK (id = 1)
);

-- Insert default settings if table is empty
INSERT INTO platform_settings (id, settings, created_at, updated_at)
VALUES (
  1,
  '{
    "site_name": "Destiny Darshan",
    "site_description": "Your trusted wellness platform for astrology, counselling, yoga, and meditation services",
    "contact_email": "support@destinydarshan.com",
    "support_email": "support@destinydarshan.com",
    "commission_rate": 10,
    "min_booking_amount": 100,
    "max_booking_amount": 10000,
    "auto_approve_experts": false,
    "email_notifications": true,
    "maintenance_mode": false,
    "platform_fee": 5
  }',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_at ON platform_settings(updated_at);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow only admins to manage settings
CREATE POLICY "Admins can manage platform settings" ON platform_settings
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      JOIN profiles ON auth.users.id = profiles.id 
      WHERE profiles.role = 'admin' 
      AND auth.users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      JOIN profiles ON auth.users.id = profiles.id 
      WHERE profiles.role = 'admin' 
      AND auth.users.id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT ALL ON platform_settings TO authenticated;
GRANT SELECT ON platform_settings TO anon;
