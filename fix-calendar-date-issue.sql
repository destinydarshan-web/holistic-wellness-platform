-- Fix for calendar date display issue
-- The problem is that toISOString().split('T')[0] creates timezone issues
-- This causes appointments to show on wrong dates in calendar

-- Current problematic code:
-- const dateStr = date.toISOString().split('T')[0]
-- const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0]

-- Fixed approach using local date string:
-- const dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')

-- Test the fix:
SELECT 
  '2026-04-04' as expected_date,
  '2026-04-04T00:00:00.000Z' as iso_string,
  '2026-04-04' as fixed_local_date;

-- Check current appointment dates in database:
SELECT 
  id,
  appointment_date,
  appointment_time,
  created_at,
  status,
  -- Test date formatting
  appointment_date::text as appointment_date_text,
  created_at::text as created_at_text
FROM public.appointments 
WHERE status IN ('pending', 'confirmed')
ORDER BY created_at DESC
LIMIT 10;
