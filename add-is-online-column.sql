-- Add is_online column to expert_astrologers table
-- Run this in Supabase SQL Editor to add the missing column

-- Add is_online column to existing expert_astrologers table
ALTER TABLE public.expert_astrologers 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- Create index for better performance on online status queries
CREATE INDEX IF NOT EXISTS idx_expert_astrologers_is_online ON public.expert_astrologers(is_online);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'expert_astrologers' 
AND table_schema = 'public'
AND column_name = 'is_online'
ORDER BY ordinal_position;