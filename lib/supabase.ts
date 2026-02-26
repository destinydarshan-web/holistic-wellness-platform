import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    }
  }
}
