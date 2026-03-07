-- Add 'pending' status to appointments table check constraint
-- This allows the new booking flow with expert approval

-- First, drop the existing constraint
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Then add the new constraint with 'pending' included
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending', 'upcoming', 'confirmed', 'completed', 'cancelled', 'rescheduled'));

-- Verify the constraint was updated
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'public.appointments'::regclass 
AND conname = 'appointments_status_check';
