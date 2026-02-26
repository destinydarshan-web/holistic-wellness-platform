'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface Profile {
  id: string
  full_name: string | null
  role: 'user' | 'expert' | 'admin'
  specialization: 'astrologer' | 'counsellor' | 'yoga_trainer' | 'meditation_expert' | null
  status: 'approved' | 'pending' | 'rejected' | null
  created_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    if (!userId) return

    console.log('=== DEBUG: Fetching Profile ===')
    console.log('User ID:', userId)

    // First try with service role (bypass RLS) to see if profile exists
    const { data: serviceData, error: serviceError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    console.log('Service role check:', { data: serviceData, error: serviceError })

    // Then try with user context (subject to RLS)
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    console.log('User context fetch:', { data, error })

    if (error) {
      console.error("Profile fetch error:", error.message)
      console.error("Error details:", error)
      console.log("This suggests RLS policy issue - user cannot access their own profile")
      return
    }

    if (!data) {
      console.warn("No profile found for user:", userId)
      console.log("This might be due to RLS policies or missing profile creation")
      if (serviceData) {
        console.log("Profile exists in database but RLS blocks access")
        console.log("Profile data (service role):", serviceData)
      }
      return
    }

    console.log("Profile fetched successfully:", data)
    setProfile(data)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const logout = async () => {
  await supabase.auth.signOut()
  setUser(null)
  setProfile(null)
}

  const signOut = async () => {
    await logout()
  }

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      }

      setLoading(false)
    }

    getInitialSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    profile,
    session,
    loading,
    signOut,
    logout,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
