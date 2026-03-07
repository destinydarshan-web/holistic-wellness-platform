-- Create yoga_events table
CREATE TABLE IF NOT EXISTS yoga_events (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  duration TEXT,
  location TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  max_participants INTEGER DEFAULT 0,
  current_participants INTEGER DEFAULT 0,
  instructor TEXT,
  instructor_description TEXT,
  level TEXT DEFAULT 'all',
  images TEXT[],
  requirements TEXT[],
  benefits TEXT[],
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meditation_events table
CREATE TABLE IF NOT EXISTS meditation_events (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  duration TEXT,
  location TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  max_participants INTEGER DEFAULT 0,
  current_participants INTEGER DEFAULT 0,
  instructor TEXT,
  instructor_description TEXT,
  level TEXT DEFAULT 'all',
  images TEXT[],
  requirements TEXT[],
  benefits TEXT[],
  meditation_type TEXT DEFAULT 'mindfulness',
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_yoga_events_date ON yoga_events(date);
CREATE INDEX IF NOT EXISTS idx_yoga_events_status ON yoga_events(status);
CREATE INDEX IF NOT EXISTS idx_yoga_events_created_at ON yoga_events(created_at);

CREATE INDEX IF NOT EXISTS idx_meditation_events_date ON meditation_events(date);
CREATE INDEX IF NOT EXISTS idx_meditation_events_status ON meditation_events(status);
CREATE INDEX IF NOT EXISTS idx_meditation_events_created_at ON meditation_events(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE yoga_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Everyone can read published events
CREATE POLICY "Anyone can read published yoga events" ON yoga_events
  FOR SELECT USING (status = 'published');

CREATE POLICY "Anyone can read published meditation events" ON meditation_events
  FOR SELECT USING (status = 'published');

-- Admins can manage all events
CREATE POLICY "Admins can manage yoga events" ON yoga_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage meditation events" ON meditation_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT ALL ON yoga_events TO authenticated;
GRANT SELECT ON yoga_events TO anon;

GRANT ALL ON meditation_events TO authenticated;
GRANT SELECT ON meditation_events TO anon;

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_events_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_yoga_events_updated_at 
    BEFORE UPDATE ON yoga_events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_events_updated_at_column();

CREATE TRIGGER update_meditation_events_updated_at 
    BEFORE UPDATE ON meditation_events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_events_updated_at_column();
