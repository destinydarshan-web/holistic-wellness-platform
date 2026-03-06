-- Create expert_notifications table
CREATE TABLE IF NOT EXISTS public.expert_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expert_id UUID NOT NULL REFERENCES public.expert_astrologers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'appointment_booked', 'appointment_cancelled', 'appointment_rescheduled', 'chat_request'
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expert_notifications_expert_id ON public.expert_notifications(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_notifications_read ON public.expert_notifications(read);
CREATE INDEX IF NOT EXISTS idx_expert_notifications_created_at ON public.expert_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expert_notifications_type ON public.expert_notifications(type);

-- Enable RLS
ALTER TABLE public.expert_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Experts can read their own notifications
CREATE POLICY "Experts can view their own notifications" ON public.expert_notifications
    FOR SELECT USING (auth.uid()::text = expert_id::text);

-- System can insert notifications
CREATE POLICY "System can insert notifications" ON public.expert_notifications
    FOR INSERT WITH CHECK (true);

-- Experts can update their own notifications (mark as read)
CREATE POLICY "Experts can update their own notifications" ON public.expert_notifications
    FOR UPDATE USING (auth.uid()::text = expert_id::text);

-- Experts can delete their own notifications
CREATE POLICY "Experts can delete their own notifications" ON public.expert_notifications
    FOR DELETE USING (auth.uid()::text = expert_id::text);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_expert_notifications_updated_at
    BEFORE UPDATE ON public.expert_notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expert_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expert_notifications TO service_role;
