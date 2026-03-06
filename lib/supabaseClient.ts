import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      debug: false
    }
  }
)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'user' | 'expert' | 'admin'
          specialization: 'astrologer' | 'counsellor' | 'yoga_trainer' | 'meditation_expert' | null
          status: 'approved' | 'pending'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role: 'user' | 'expert' | 'admin'
          specialization?: 'astrologer' | 'counsellor' | 'yoga_trainer' | 'meditation_expert' | null
          status?: 'approved' | 'pending'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'user' | 'expert' | 'admin'
          specialization?: 'astrologer' | 'counsellor' | 'yoga_trainer' | 'meditation_expert' | null
          status?: 'approved' | 'pending'
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          expert_id: string
          service_category: 'astrology' | 'counselling' | 'yoga' | 'meditation'
          engagement_type: 'one_to_one' | 'group'
          session_mode: 'chat' | 'call' | 'video'
          status: 'active' | 'upcoming' | 'completed' | 'cancelled'
          scheduled_at: string
          started_at: string | null
          ended_at: string | null
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          expert_id: string
          service_category: 'astrology' | 'counselling' | 'yoga' | 'meditation'
          engagement_type: 'one_to_one' | 'group'
          session_mode: 'chat' | 'call' | 'video'
          status?: 'active' | 'upcoming' | 'completed' | 'cancelled'
          scheduled_at: string
          started_at?: string | null
          ended_at?: string | null
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          expert_id?: string
          service_category?: 'astrology' | 'counselling' | 'yoga' | 'meditation'
          engagement_type?: 'one_to_one' | 'group'
          session_mode?: 'chat' | 'call' | 'video'
          status?: 'active' | 'upcoming' | 'completed' | 'cancelled'
          scheduled_at?: string
          started_at?: string | null
          ended_at?: string | null
          amount?: number
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'credit' | 'debit'
          amount: number
          description: string
          booking_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'credit' | 'debit'
          amount: number
          description: string
          booking_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'credit' | 'debit'
          amount?: number
          description?: string
          booking_id?: string | null
          created_at?: string
        }
      }
      expert_astrologers: {
        Row: {
          user_id: string
          display_name: string
          profile_photo_url: string
          tagline: string
          bio: string
          years_of_experience: number
          primary_specialization: string
          additional_specializations: string[]
          languages_spoken: string[]
          chat_enabled: boolean
          call_enabled: boolean
          video_enabled: boolean
          is_online: boolean
          cost_per_minute: number
          hourly_rate: number
          response_time: string
        }
        Insert: {
          user_id: string
          display_name: string
          profile_photo_url?: string
          tagline?: string
          bio?: string
          years_of_experience?: number
          primary_specialization?: string
          additional_specializations?: string[]
          languages_spoken?: string[]
          chat_enabled?: boolean
          call_enabled?: boolean
          video_enabled?: boolean
          is_online?: boolean
          cost_per_minute?: number
          hourly_rate?: number
          response_time?: string
        }
        Update: {
          user_id?: string
          display_name?: string
          profile_photo_url?: string
          tagline?: string
          bio?: string
          years_of_experience?: number
          primary_specialization?: string
          additional_specializations?: string[]
          languages_spoken?: string[]
          chat_enabled?: boolean
          call_enabled?: boolean
          video_enabled?: boolean
          is_online?: boolean
          cost_per_minute?: number
          hourly_rate?: number
          response_time?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          expert_id: string
          service_category: 'astrology' | 'counselling' | 'yoga' | 'meditation'
          appointment_date: string
          appointment_time: string
          duration_minutes: number
          status: 'upcoming' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
          amount_paid: number
          hourly_rate: number
          payment_status: 'pending' | 'paid' | 'refunded'
          notes?: string
          meeting_link?: string
          meeting_mode: 'video' | 'audio' | 'in_person'
          created_at: string
          updated_at: string
          cancelled_at?: string
          cancellation_reason?: string
          rescheduled_from?: string
        }
        Insert: {
          user_id: string
          expert_id: string
          service_category?: 'astrology' | 'counselling' | 'yoga' | 'meditation'
          appointment_date: string
          appointment_time: string
          duration_minutes?: number
          status?: 'upcoming' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
          amount_paid: number
          hourly_rate: number
          payment_status?: 'pending' | 'paid' | 'refunded'
          notes?: string
          meeting_link?: string
          meeting_mode?: 'video' | 'audio' | 'in_person'
          created_at?: string
          updated_at?: string
          cancelled_at?: string
          cancellation_reason?: string
          rescheduled_from?: string
        }
        Update: {
          user_id?: string
          expert_id?: string
          service_category?: 'astrology' | 'counselling' | 'yoga' | 'meditation'
          appointment_date?: string
          appointment_time?: string
          duration_minutes?: number
          status?: 'upcoming' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
          amount_paid?: number
          hourly_rate?: number
          payment_status?: 'pending' | 'paid' | 'refunded'
          notes?: string
          meeting_link?: string
          meeting_mode?: 'video' | 'audio' | 'in_person'
          updated_at?: string
          cancelled_at?: string
          cancellation_reason?: string
          rescheduled_from?: string
        }
      }
      messages: {
        Row: {
          id: string
          session_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
      }
      user_wallet: {
        Row: {
          id: string
          user_id: string
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      live_sessions: {
        Row: {
          id: string
          user_id: string
          expert_id: string
          service_category: 'astrology' | 'counselling' | 'yoga' | 'meditation'
          session_type: 'chat' | 'voice' | 'video'
          status: 'pending' | 'active' | 'completed' | 'cancelled'
          created_at: string
          started_at: string | null
          ended_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          expert_id: string
          service_category: 'astrology' | 'counselling' | 'yoga' | 'meditation'
          session_type: 'chat' | 'voice' | 'video'
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          created_at?: string
          started_at?: string | null
          ended_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          expert_id?: string
          service_category?: 'astrology' | 'counselling' | 'yoga' | 'meditation'
          session_type?: 'chat' | 'voice' | 'video'
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          created_at?: string
          started_at?: string | null
          ended_at?: string | null
        }
      }
    }
  }
}