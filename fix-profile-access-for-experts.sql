-- Fix user profile access for experts
-- Option 1: Disable RLS for profiles table (if you want to allow all access)
-- Option 2: Add policy to allow experts to view user profiles

-- OPTION 1: Disable RLS completely (less secure but simpler)
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- OPTION 2: Add policy to allow experts to view user profiles (recommended)
-- This allows experts to see user names for their appointments

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Experts can view user profiles for their appointments" ON public.profiles;
DROP POLICY IF EXISTS "Experts can view user profiles for their sessions" ON public.profiles;

-- Create policy that allows experts to view user profiles for appointments they're involved in
CREATE POLICY "Experts can view user profiles for their appointments" ON public.profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT expert_id 
      FROM public.appointments 
      WHERE appointments.user_id = profiles.id
    )
  );

-- Also allow experts to view user profiles for live sessions they're involved in
CREATE POLICY "Experts can view user profiles for their sessions" ON public.profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT expert_id 
      FROM public.live_sessions 
      WHERE live_sessions.user_id = profiles.id
    )
  );

-- Alternative: Allow experts to view all user profiles (less restrictive)
-- CREATE POLICY "Experts can view all user profiles" ON public.profiles
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM public.profiles 
--       WHERE id = auth.uid() AND role IN ('expert', 'astrologer', 'counsellor')
--     )
--   );

-- Test the policy by checking if it exists
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';
