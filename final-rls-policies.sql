-- Complete RLS Policies for Expert Astrologers Table
-- Run this in your Supabase SQL Editor

-- Enable RLS on expert_astrologers table
ALTER TABLE expert_astrologers ENABLE ROW LEVEL SECURITY;

-- Public can view astrologers (for listing page)
CREATE POLICY "Public can view astrologers"
ON expert_astrologers
FOR SELECT
USING (true);

-- Astrologers can update own profile
CREATE POLICY "Astrologer can update own profile"
ON expert_astrologers
FOR UPDATE
USING (auth.uid() = user_id);

-- Astrologers can insert own row
CREATE POLICY "Astrologer can insert own row"
ON expert_astrologers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Verify policies were created
SELECT * FROM pg_policies WHERE tablename = 'expert_astrologers';
