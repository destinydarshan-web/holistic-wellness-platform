-- Database Setup Script for Expert Astrologers
-- Run this in your Supabase SQL Editor to create the required tables

-- Step 1: Drop existing policies and table if they exist
DROP POLICY IF EXISTS "Public can view completed astrologers" ON public.expert_astrologers;
DROP POLICY IF EXISTS "Astrologers can update own profile" ON public.expert_astrologers;
DROP POLICY IF EXISTS "Astrologers can insert own profile" ON public.expert_astrologers;
DROP POLICY IF EXISTS "Admins can manage astrologers" ON public.expert_astrologers;
DROP TABLE IF EXISTS public.expert_astrologers CASCADE;

-- Step 2: Create expert_astrologers table
CREATE TABLE public.expert_astrologers (
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

-- Step 3: Enable RLS (Row Level Security)
ALTER TABLE public.expert_astrologers ENABLE ROW LEVEL SECURITY;

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expert_astrologers_id ON public.expert_astrologers(id);
CREATE INDEX IF NOT EXISTS idx_expert_astrologers_profile_complete ON public.expert_astrologers(is_profile_complete);
CREATE INDEX IF NOT EXISTS idx_expert_astrologers_created_at ON public.expert_astrologers(created_at);

-- Step 5: Create proper RLS policies for expert_astrologers table
-- Policy 1: Authenticated users can insert their own profile
CREATE POLICY "Allow astrologer insert own profile" ON public.expert_astrologers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 2: Authenticated users can update their own profile
CREATE POLICY "Allow astrologer update own profile" ON public.expert_astrologers
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Policy 3: Authenticated users can view their own profile
CREATE POLICY "Allow astrologer view own profile" ON public.expert_astrologers
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 4: Admins can do everything
CREATE POLICY "Admins can manage astrologers" ON public.expert_astrologers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Step 6: Public policy to view only completed profiles
CREATE POLICY "Public can view completed astrologers" ON public.expert_astrologers
FOR SELECT
TO anon
USING (is_profile_complete = true);

-- Step 7: Verify table was created
SELECT 'expert_astrologers table created successfully' as status;

-- Step 8: Create live_sessions table for session management
CREATE TABLE public.live_sessions (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  expert_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  service_category TEXT NOT NULL CHECK (service_category IN ('astrology', 'counselling', 'yoga', 'meditation')),
  session_type TEXT NOT NULL CHECK (session_type IN ('chat', 'voice', 'video')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Step 8.5: Add missing updated_at column if table exists (for existing tables)
ALTER TABLE public.live_sessions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 9: Enable RLS for live_sessions table
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Step 10: Create indexes for live_sessions
CREATE INDEX IF NOT EXISTS idx_live_sessions_id ON public.live_sessions(id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_user_id ON public.live_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_expert_id ON public.live_sessions(expert_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON public.live_sessions(status);
CREATE INDEX IF NOT EXISTS idx_live_sessions_updated_at ON public.live_sessions(updated_at);

-- Step 11: Create RLS policies for live_sessions table
-- Policy 1: Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON public.live_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = expert_id);

-- Policy 2: Users can create sessions (as user)
CREATE POLICY "Users can create sessions" ON public.live_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Experts can update their own sessions
CREATE POLICY "Experts can update own sessions" ON public.live_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = expert_id)
WITH CHECK (auth.uid() = expert_id);

-- Policy 4: Users can update their own sessions (as user)
CREATE POLICY "Users can update own sessions as user" ON public.live_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 12: Verify live_sessions table was created
SELECT 'live_sessions table created successfully' as status;

-- Step 13: Create transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 14: Create bookings table
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  expert_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  service_category TEXT NOT NULL CHECK (service_category IN ('astrology', 'counselling', 'yoga', 'meditation')),
  engagement_type TEXT NOT NULL CHECK (engagement_type IN ('one_to_one', 'group')),
  session_mode TEXT NOT NULL CHECK (session_mode IN ('chat', 'call', 'video')),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 15: Enable RLS for transactions and bookings
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Step 16: Create indexes for transactions and bookings
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_expert_id ON public.bookings(expert_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON public.bookings(scheduled_at);

-- Step 17: Create RLS policies for transactions table
CREATE POLICY "Users can view own transactions" ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Step 18: Create RLS policies for bookings table
CREATE POLICY "Users can view own bookings" ON public.bookings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Experts can view their bookings" ON public.bookings
FOR SELECT
TO authenticated
USING (auth.uid() = expert_id);

CREATE POLICY "Users can create bookings" ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Step 19: Verify tables were created
SELECT 'transactions table created successfully' as status;
SELECT 'bookings table created successfully' as status;

-- Step 20: Check if profiles table exists and has the right structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
