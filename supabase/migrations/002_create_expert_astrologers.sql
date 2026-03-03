-- Create expert_astrologers table for completed astrologer profiles
-- This table stores detailed profile information for approved astrologers

CREATE TABLE IF NOT EXISTS public.expert_astrologers (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  display_name TEXT NOT NULL,
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  price_per_minute INTEGER DEFAULT 299,
  specialties TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  is_profile_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.expert_astrologers ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_expert_astrologers_id ON public.expert_astrologers(id);
CREATE INDEX IF NOT EXISTS idx_expert_astrologers_profile_complete ON public.expert_astrologers(is_profile_complete);
CREATE INDEX IF NOT EXISTS idx_expert_astrologers_created_at ON public.expert_astrologers(created_at);

-- Create policies for expert_astrologers table
-- Public can view only completed profiles
CREATE POLICY "Public can view completed astrologers" ON public.expert_astrologers
FOR SELECT
USING (is_profile_complete = true);

-- Astrologers can update their own profile
CREATE POLICY "Astrologers can update own profile" ON public.expert_astrologers
FOR UPDATE
USING (auth.uid() = id);

-- Astrologers can insert their own profile
CREATE POLICY "Astrologers can insert own profile" ON public.expert_astrologers
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "Admins can manage astrologers" ON public.expert_astrologers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Verify policies were created
SELECT * FROM pg_policies WHERE tablename = 'expert_astrologers';
