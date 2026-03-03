-- Fix for missing updated_at column in live_sessions table
-- Run this in Supabase SQL Editor to add the missing column

-- Add missing updated_at column to existing live_sessions table
ALTER TABLE public.live_sessions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add index for the new column for better performance
CREATE INDEX IF NOT EXISTS idx_live_sessions_updated_at ON public.live_sessions(updated_at);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'live_sessions' 
AND table_schema = 'public'
AND column_name = 'updated_at'
ORDER BY ordinal_position;
