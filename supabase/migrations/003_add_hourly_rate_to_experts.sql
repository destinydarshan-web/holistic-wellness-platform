-- Add hourly_rate column to expert_astrologers table
-- This column will store the hourly rate for appointment bookings

ALTER TABLE public.expert_astrologers 
ADD COLUMN hourly_rate INTEGER DEFAULT 17940;

-- Add comment for documentation
COMMENT ON COLUMN public.expert_astrologers.hourly_rate IS 'Hourly rate for appointment bookings in rupees (default: 17940 = 299 * 60)';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_expert_astrologers_hourly_rate ON public.expert_astrologers(hourly_rate);

-- Update existing records to calculate hourly rate from per-minute rate
UPDATE public.expert_astrologers 
SET hourly_rate = price_per_minute * 60 
WHERE hourly_rate IS NULL AND price_per_minute IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'expert_astrologers' AND column_name = 'hourly_rate';
