import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
          response_time?: string
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