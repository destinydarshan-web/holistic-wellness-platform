-- Update profiles table to support astrologer role
-- This migration adds astrologer to the role check constraint

-- First, drop the existing policies that reference the role constraint
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Drop the trigger that might conflict
DROP TRIGGER IF EXISTS on_auth_user_created;

-- Update the role check constraint to include 'astrologer'
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'expert', 'admin', 'astrologer'));

-- Update the handle_new_user function to handle astrologer role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, status)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role',
    CASE 
      WHEN new.raw_user_meta_data->>'role' IN ('expert', 'astrologer') THEN 'pending'
      ELSE 'approved'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recreate policies with updated role handling
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except role and status)
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = role AND status = status);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Verify policies were recreated
SELECT * FROM pg_policies WHERE tablename = 'profiles';
