-- Fix for missing transactions and bookings tables
-- Run this in Supabase SQL Editor to add the missing tables

-- Step 14: Create bookings table first (no dependencies)
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

-- Step 13: Create transactions table (references bookings)
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
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
