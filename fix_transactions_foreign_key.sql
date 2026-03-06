-- Fix the transactions table foreign key to reference appointments instead of bookings
-- This will allow transaction records to reference appointment bookings

-- First, drop the existing foreign key constraint
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_booking_id_fkey;

-- Then add the correct foreign key constraint to appointments table
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_appointment_id_fkey 
FOREIGN KEY (booking_id) REFERENCES public.appointments(id) ON DELETE SET NULL;

-- Verify the constraint was added correctly
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'transactions';
