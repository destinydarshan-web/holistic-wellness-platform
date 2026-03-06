-- Create appointments table for scheduled appointments
-- This table will handle appointment bookings with wallet payment integration

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  expert_id UUID REFERENCES public.expert_astrologers(id) ON DELETE CASCADE NOT NULL,
  service_category VARCHAR(50) NOT NULL DEFAULT 'astrology',
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  amount_paid INTEGER NOT NULL,
  hourly_rate INTEGER NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  notes TEXT,
  meeting_link TEXT,
  meeting_mode VARCHAR(20) DEFAULT 'video' CHECK (meeting_mode IN ('video', 'audio', 'in_person')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  rescheduled_from UUID REFERENCES public.appointments(id) ON DELETE SET NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_expert_id ON public.appointments(expert_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON public.appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON public.appointments(created_at);

-- Create policies for appointments table
-- Users can view their own appointments
CREATE POLICY "Users can view own appointments" ON public.appointments
FOR SELECT
USING (auth.uid() = user_id);

-- Experts can view their appointments
CREATE POLICY "Experts can view their appointments" ON public.appointments
FOR SELECT
USING (auth.uid() = expert_id);

-- Users can create appointments
CREATE POLICY "Users can create appointments" ON public.appointments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own appointments (cancellation)
CREATE POLICY "Users can update own appointments" ON public.appointments
FOR UPDATE
USING (auth.uid() = user_id AND status IN ('upcoming', 'confirmed'));

-- Experts can update their appointments (confirmation, completion)
CREATE POLICY "Experts can update their appointments" ON public.appointments
FOR UPDATE
USING (auth.uid() = expert_id);

-- Admins can do everything
CREATE POLICY "Admins can manage appointments" ON public.appointments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

-- Verify table was created
SELECT table_name, column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;
