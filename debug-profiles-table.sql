-- Debug script to check profiles table and user data
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if profiles table exists and has data
SELECT COUNT(*) as total_profiles, 
       COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as profiles_with_name
FROM public.profiles;

-- 2. Show sample profiles data
SELECT id, full_name, role, specialization, status, created_at 
FROM public.profiles 
LIMIT 10;

-- 3. Check if the specific user_id from your appointment exists
-- Replace with the actual user_id from your appointment
SELECT id, full_name, role, specialization, status, created_at 
FROM public.profiles 
WHERE id = 'be0db673-b923-4889-aecf-595e2b754292';

-- 4. Check if there are any users without profiles
SELECT 
  u.id as auth_user_id,
  u.email as auth_email,
  u.created_at as auth_created,
  p.id as profile_id,
  p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
LIMIT 10;

-- 5. Check appointments and their user_ids
SELECT 
  a.id as appointment_id,
  a.user_id,
  a.expert_id,
  a.status,
  p.full_name
FROM public.appointments a
LEFT JOIN public.profiles p ON a.user_id = p.id
WHERE a.status = 'pending'
ORDER BY a.created_at DESC;

-- 6. Check RLS status on profiles table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 7. Check existing policies on profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'profiles';

-- 8. Check auth.users table structure for the specific user
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users 
WHERE id = 'be0db673-b923-4889-aecf-595e2b754292';
