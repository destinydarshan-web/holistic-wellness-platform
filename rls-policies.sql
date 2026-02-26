-- RLS Policy for Expert Profile Updates
-- Run this in your Supabase SQL Editor

-- Allow experts to update their own profile
CREATE POLICY "Experts update own profile" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'profiles';
