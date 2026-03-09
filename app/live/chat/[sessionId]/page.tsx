"use client";

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Database } from '@/lib/supabaseClient'
import { supabase as supabaseClient } from '@/lib/supabaseClient'
import { 
  MessageCircle, 
  Clock, 
  User, 
  Shield, 
  Lock, 
  Heart, 
  Sparkles, 
  X, 
  HelpCircle,
  ChevronRight,
  RefreshCw,
  Phone,
  Video,
  Star,
  AlertCircle,
  Calendar,
  DollarSign,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

type LiveSession = Database['public']['Tables']['live_sessions']['Row']

export default function ChatSessionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [session, setSession] = useState<LiveSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expertName, setExpertName] = useState<string>('Expert')
  const sessionId = params.sessionId as string

  // 3️⃣ Add Initial Status Check (Important)
  useEffect(() => {
    if (!sessionId) return;

    const checkStatus = async () => {
      console.log('=== DEBUG: User Checking Session Status ===')
      const { data, error } = await supabaseClient
        .from("live_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      console.log('Session status check result:', { data, error })

      if (error) {
        console.error('Error checking session status:', error)
        // Don't return here, let the component handle the error gracefully
        setSession(null)
        setLoading(false)
      }

      if (data?.status === "accepted") {
        console.log('Session is accepted, redirecting to chat')
        router.push(`/session/chat/${sessionId}`);
      } else if (data?.status === "rejected") {
        console.log('Session was rejected')
        alert("Session rejected by expert.");
        router.push("/astrology");
      }
    };

    // Check immediately
    checkStatus();
    
    // Set up periodic check every 3 seconds
    const interval = setInterval(checkStatus, 3000);
    
    return () => clearInterval(interval);
  }, [sessionId]);

  // 2️⃣ Add Realtime UPDATE Listener
  useEffect(() => {
    if (!sessionId) return;

    console.log('=== DEBUG: Setting up User Realtime Listener ===')
    const channel = supabaseClient
      .channel(`user-session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_sessions",
          filter: `id=eq.${sessionId}` 
        },
        (payload) => {
          console.log("=== DEBUG: User Session UPDATE received ===", payload);

          const updated = payload.new;

          if (updated.status === "accepted") {
            console.log("=== DEBUG: Session accepted — redirecting to chat ===");
            router.push(`/session/chat/${sessionId}`);
          }

          if (updated.status === "rejected") {
            console.log("=== DEBUG: Session rejected ===");
            alert("Session rejected by expert.");
            router.push("/astrology");
          }
        }
      )
      .subscribe((status) => {
        console.log("=== DEBUG: User realtime subscription status ===", status);
      });

    return () => {
      console.log("=== DEBUG: Cleaning up user realtime subscription ===")
      supabaseClient.removeChannel(channel);
    };
  }, [sessionId]);

  useEffect(() => {
    if (!user?.id || !params.sessionId) return

    const fetchSession = async () => {
      try {
        console.log('Fetching chat session:', params.sessionId)
        
        const { data: sessionData, error } = await supabaseClient
          .from('live_sessions')
          .select('*')
          .eq('id', params.sessionId)
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Error fetching session:', error)
          setLoading(false)
          return
        }

        if (sessionData) {
          console.log('Session found:', sessionData)
          setSession(sessionData)
        } else {
          console.log('Session not found or access denied')
        }
      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [user?.id, params.sessionId])

  // Fetch expert name when session is loaded
  useEffect(() => {
    if (session?.expert_id) {
      fetchExpertName(session.expert_id)
    }
  }, [session?.expert_id])

  const fetchExpertName = async (expertId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('expert_astrologers')
        .select('display_name')
        .eq('id', expertId)
        .single()

      if (data && !error) {
        setExpertName(data.display_name || 'Expert')
      }
    } catch (error) {
      console.error('Error fetching expert name:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const { data, error } = await supabaseClient
        .from("live_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (data?.status === "accepted") {
        router.push(`/session/chat/${sessionId}`);
      } else if (data?.status === "rejected") {
        alert("Session rejected by expert.");
        router.push("/astrology");
      } else if (data) {
        setSession(data)
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      case 'active': return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'completed': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-400 border border-red-500/30'
      default: return 'bg-white/10 text-white border border-white/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 animate-pulse" />
      case 'active': return <MessageCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <X className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0e1117] to-[#05070d] pt-20 flex items-center justify-center">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,200,0,0.03),_transparent_60%)]"></div>
        </div>
        <div className="relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
            <div className="absolute top-0 left-0 animate-ping">
              <div className="h-16 w-16 rounded-full bg-yellow-400 opacity-20"></div>
            </div>
          </div>
          <p className="text-white/60 mt-4">Loading chat session...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0e1117] to-[#05070d] pt-20 flex items-center justify-center">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,200,0,0.03),_transparent_60%)]"></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-12 h-12 text-white/60" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Session Not Found</h2>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            This chat session could not be found or may have expired.
          </p>
          <Link 
            href="/astrology"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/15 transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            Back to Experts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#0b0f19] via-[#0e1117] to-[#05070d] pt-20 flex flex-col overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,200,0,0.03),_transparent_60%)]"></div>
      </div>

      {/* Header */}
      <div className="relative bg-white/5 backdrop-blur-xl border-b border-white/10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-lg opacity-50"></div>
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 p-2 rounded-full">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Live Chat Session</h1>
                <p className="text-gray-400 text-xs">Session ID: {session.id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`hidden sm:flex px-3 py-1 rounded-full text-xs font-medium items-center gap-1 ${getStatusColor(session.status)}`}>
                {getStatusIcon(session.status)}
                <span className="capitalize">{session.status}</span>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="group relative px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/15 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-4 sm:p-6 h-full flex flex-col overflow-hidden">
          {/* Waiting State */}
          <div className="text-center py-4 sm:py-6 flex-1 flex flex-col justify-center items-center overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Waiting for {expertName} to accept...
            </h2>
            
            <p className="text-gray-300 mb-4 max-w-xl mx-auto text-sm">
              Your chat session has been created. {expertName} will be notified and will join shortly.
            </p>

            {/* Session Details Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 max-w-sm mx-auto mb-4">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Session Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-white/10">
                  <span className="text-gray-400 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    Type
                  </span>
                  <span className="text-white font-medium">Chat</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/10">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Service
                  </span>
                  <span className="text-white font-medium capitalize">{session.service_category}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Status
                  </span>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(session.status)}`}>
                    {getStatusIcon(session.status)}
                    <span className="capitalize">{session.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-3 max-w-sm mx-auto mb-4">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-gray-300 text-xs">
                    Your conversation is encrypted and private.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link 
                href="/astrology"
                className="group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/15 transition-all duration-300 text-sm"
              >
                <ChevronRight className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                Leave Session
              </Link>
            </div>

            {/* Help Section */}
            <div className="mt-4 text-center">
              <button className="group inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors duration-300 text-xs">
                <HelpCircle className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" />
                <span>Need help? Contact support</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
