-- Create expert_counsellors table for completed counsellor profiles
-- This table stores detailed profile information for approved counsellors

CREATE TABLE IF NOT EXISTS public.expert_counsellors (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL,
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  price_per_minute INTEGER DEFAULT 299,
  hourly_rate INTEGER DEFAULT 17940, -- Default hourly rate (299 * 60)
  specialties TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  is_profile_complete BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT false,
  modes TEXT[] DEFAULT '{chat,video}', -- Available communication modes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.expert_counsellors ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_expert_counsellors_id ON public.expert_counsellors(id);
CREATE INDEX IF NOT EXISTS idx_expert_counsellors_profile_complete ON public.expert_counsellors(is_profile_complete);
CREATE INDEX IF NOT EXISTS idx_expert_counsellors_created_at ON public.expert_counsellors(created_at);
CREATE INDEX IF NOT EXISTS idx_expert_counsellors_online ON public.expert_counsellors(is_online);

-- Create policies for expert_counsellors table
-- Public can view only completed profiles
CREATE POLICY "Public can view completed counsellors" ON public.expert_counsellors
FOR SELECT
USING (is_profile_complete = true);

-- Counsellors can update their own profile
CREATE POLICY "Counsellors can update own profile" ON public.expert_counsellors
FOR UPDATE
USING (auth.uid() = id);

-- Counsellors can insert their own profile
CREATE POLICY "Counsellors can insert own profile" ON public.expert_counsellors
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "Admins can manage counsellors" ON public.expert_counsellors
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Verify policies were created
SELECT * FROM pg_policies WHERE tablename = 'expert_counsellors';
