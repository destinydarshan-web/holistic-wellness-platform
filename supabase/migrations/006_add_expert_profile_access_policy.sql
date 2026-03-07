-- Add policy to allow experts to view user profiles for their appointments
-- This fixes the "Unknown User" issue in expert dashboard

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
