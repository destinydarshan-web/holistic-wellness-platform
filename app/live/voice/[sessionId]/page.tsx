"use client";

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Database } from '@/lib/supabaseClient'
import { supabase as supabaseClient } from '@/lib/supabaseClient'
import { Phone, Clock, User } from 'lucide-react'

type LiveSession = Database['public']['Tables']['live_sessions']['Row']

export default function VoiceSessionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [session, setSession] = useState<LiveSession | null>(null)
  const [loading, setLoading] = useState(true)
  const sessionId = params.sessionId as string

  // 3️⃣ Add Initial Status Check (Important)
  useEffect(() => {
    if (!sessionId) return;

    const checkStatus = async () => {
      const { data } = await supabaseClient
        .from("live_sessions")
        .select("status")
        .eq("id", sessionId)
        .single();

      if (data?.status === "accepted") {
        router.push(`/session/voice/${sessionId}`);
      }
    };

    checkStatus();
  }, [sessionId]);

  // 2️⃣ Add Realtime UPDATE Listener
  useEffect(() => {
    if (!sessionId) return;

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
          console.log("Session UPDATE received:", payload);

          const updated = payload.new;

          if (updated.status === "accepted") {
            console.log("Session accepted — redirecting to voice");
            router.push(`/session/voice/${sessionId}`);
          }

          if (updated.status === "rejected") {
            alert("Session rejected by expert.");
            router.push("/dashboard");
          }
        }
      )
      .subscribe((status) => {
        console.log("User realtime subscription status:", status);
      });

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [sessionId]);

  useEffect(() => {
    if (!user?.id || !params.sessionId) return

    const fetchSession = async () => {
      try {
        console.log('Fetching voice session:', params.sessionId)
        
        const { data: sessionData, error } = await supabaseClient
          .from('live_sessions')
          .select('*')
          .eq('id', params.sessionId)
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Session fetch error:', error)
          setLoading(false)
          return
        }

        console.log('Voice session data:', sessionData)
        setSession(sessionData)
      } catch (error) {
        console.error('Unexpected error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [user?.id, params.sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading voice session...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-4">This voice session could not be found or may have expired.</p>
          <button
            onClick={() => router.push('/astrology')}
            className="px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Back to Experts
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Voice Call Session</h1>
                <p className="text-sm text-gray-600">Session ID: {session.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium
                ${session.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                ${session.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                ${session.status === 'completed' ? 'bg-gray-100 text-gray-700' : ''}
              `}>
                {session.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Waiting State */}
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-green-600 animate-pulse" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Waiting for expert to accept...
            </h2>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your voice call session has been created. The expert will be notified and will join shortly. 
              Please wait while we connect you with your astrologer.
            </p>

            {/* Session Details */}
            <div className="bg-gray-50 rounded-lg p-6 max-w-sm mx-auto">
              <h3 className="font-medium text-gray-900 mb-4">Session Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Type:</span>
                  <span className="font-medium capitalize">Voice Call</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium capitalize">{session.service_category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{session.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {new Date(session.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center mt-8">
              <button
                onClick={() => router.push('/astrology')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Leave Session
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
