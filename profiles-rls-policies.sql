-- RLS Policies for Profiles Table
-- Run this in your Supabase SQL Editor

-- Allow users to view their own profile
CREATE POLICY "Users view own profile" 
ON profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users update own profile" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users insert own profile" 
ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Public can view approved expert profiles
CREATE POLICY "Expert profiles are publicly viewable" 
ON profiles 
FOR SELECT 
USING (role = 'expert' AND status = 'approved');

-- Verify policies were created
SELECT * FROM pg_policies WHERE tablename = 'profiles';
