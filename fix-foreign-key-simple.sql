-- Fix foreign key constraint in appointments table
-- Remove the restrictive foreign key constraint that only allows astrologers
-- This will allow appointments to be created for all expert types

-- Drop the foreign key constraint
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_expert_id_fkey;

-- Verify the constraint was removed
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name = 'appointments' 
AND tc.constraint_name = 'appointments_expert_id_fkey';

-- Check current appointments table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND column_name = 'expert_id';
