"use client";

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase as supabaseClient } from '@/lib/supabaseClient'
import { Database } from '@/lib/supabaseClient'
import { 
  X, 
  MessageCircle, 
  Phone, 
  Video, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle 
} from 'lucide-react'

type LiveSession = Database['public']['Tables']['live_sessions']['Row']

interface ExpertIncomingSessionProps {
  onSessionAccepted?: (session: LiveSession) => void
  onSessionRejected?: (session: LiveSession) => void
}

export default function ExpertIncomingSession({ 
  onSessionAccepted, 
  onSessionRejected 
}: ExpertIncomingSessionProps) {
  const { user } = useAuth()
  const router = useRouter()
  
  // 2️⃣ Add These States
  const [expertId, setExpertId] = useState<string | null>(null)
  const [incomingSession, setIncomingSession] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  // 5️⃣ Add Temporary Test Log On Mount
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      console.log("Expert auth session on mount:", data)
    })
  }, [])

  // 3️⃣ Fetch Expert Record on Mount
  useEffect(() => {
    const fetchExpert = async () => {
      const { data: userData } = await supabaseClient.auth.getUser()
      const authId = userData.user?.id

      if (!authId) {
        console.error("No authenticated user found")
        return
      }

      const { data, error } = await supabaseClient
        .from("expert_astrologers")
        .select("id")
        .eq("user_id", authId)
        .single()

      if (error) {
        console.error("Error fetching expert record:", error)
        return
      }

      console.log("Resolved Expert ID:", data.id)
      setExpertId(data.id)
    }

    fetchExpert()
  }, [])

  // 4️⃣ Fetch Existing Pending Sessions
  useEffect(() => {
    if (!expertId) return

    const fetchPendingSessions = async () => {
      const { data, error } = await supabaseClient
        .from("live_sessions")
        .select("*")
        .eq("expert_id", expertId)
        .eq("status", "pending")

      if (error) {
        console.error("Error fetching pending sessions:", error)
        return
      }

      if (data && data.length > 0) {
        console.log("Existing pending session found:", data[0])
        setIncomingSession(data[0])
        setShowModal(true)
      }
    }

    fetchPendingSessions()
  }, [expertId])

  // 5️⃣ Subscribe to Realtime INSERT Events
  useEffect(() => {
    if (!expertId) return

    console.log("Subscribing to live_sessions for expert:", expertId)

    const channel = supabaseClient
      .channel(`expert-${expertId}-incoming`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_sessions",
          filter: `expert_id=eq.${expertId}` 
        },
        (payload: any) => {
          console.log("Realtime event received:", payload)

          if (payload.new.status === "pending") {
            setIncomingSession(payload.new)
            setShowModal(true)
          }
        }
      )
      .subscribe((status: any) => {
        console.log("Realtime subscription status:", status)
      })

    return () => {
      console.log("Cleaning up realtime subscription")
      supabaseClient.removeChannel(channel)
    }
  }, [expertId])

  // 6️⃣ Accept / Reject Functions
  const handleAccept = async () => {
    try {
      console.log("=== ACCEPT CLICK TRIGGERED ===")

      if (!incomingSession?.id) {
        console.error("No session ID found")
        return
      }

      // Ensure auth session exists
      const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession()

      if (sessionError) {
        console.error("Error getting auth session:", sessionError)
        return
      }

      if (!sessionData?.session) {
        console.error("No active auth session for expert")
        return
      }

      console.log("Expert authenticated:", sessionData.session.user.id)

      const sessionId = incomingSession.id.trim()

      console.log("Updating session:", sessionId)

      const response = await supabaseClient
        .from("live_sessions")
        .update({ status: "accepted" })
        .eq("id", sessionId)
        .select()

      console.log("Update response:", response)

      if (response.error) {
        console.error("Update error:", response.error)
        return
      }

      if (!response.data || response.data.length === 0) {
        console.error("No rows updated")
        return
      }

      console.log("Session updated successfully")

      setShowModal(false)
      setIncomingSession(null)
      
      // 3️⃣ Update Expert Accept Logic - Redirect to chat session
      router.push(`/session/chat/${sessionId}`);

    } catch (err) {
      console.error("Unexpected error:", err)
    }
  }

  const handleReject = async () => {
    try {
      console.log("=== REJECT CLICK TRIGGERED ===")

      if (!incomingSession || !incomingSession.id) {
        console.error("Incoming session missing or invalid for reject")
        return
      }

      const sessionId = String(incomingSession.id)

      console.log("Attempting to reject session ID:", sessionId)

      const { data, error } = await supabaseClient
        .from("live_sessions")
        .update({ status: "rejected" })
        .eq("id", sessionId)
        .select()

      console.log("Reject update response:", { data, error })

      if (error) {
        console.error("Supabase reject update error:", error)
        return
      }

      if (!data || data.length === 0) {
        console.error("Reject update executed but no rows affected. ID mismatch likely.")
        return
      }

      console.log("Session successfully rejected.")

      // Add verification after reject
      const verify = await supabase
        .from("live_sessions")
        .select("status")
        .eq("id", sessionId)
        .single()

      console.log("Post-reject verification:", verify)

      setShowModal(false)
      setIncomingSession(null)
      onSessionRejected?.(incomingSession)
    } catch (err) {
      console.error("Unexpected error in handleReject:", err)
    }
  }

  const getSessionIcon = (sessionType: string) => {
    switch (sessionType) {
      case 'chat': return <MessageCircle className="w-6 h-6" />
      case 'voice': return <Phone className="w-6 h-6" />
      case 'video': return <Video className="w-6 h-6" />
      default: return <MessageCircle className="w-6 h-6" />
    }
  }

  const getSessionColor = (sessionType: string) => {
    switch (sessionType) {
      case 'chat': return 'bg-blue-500'
      case 'voice': return 'bg-green-500'
      case 'video': return 'bg-purple-500'
      default: return 'bg-blue-500'
    }
  }

  // 7️⃣ UI Behavior Requirement
  if (!showModal || !incomingSession) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            setShowModal(false)
            setIncomingSession(null)
          }}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 ${getSessionColor(incomingSession.session_type)} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}>
            {getSessionIcon(incomingSession.session_type)}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Incoming Session Request
          </h2>
          
          <p className="text-gray-600">
            A user is requesting a {incomingSession.session_type} session
          </p>
        </div>

        {/* Session Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Service Category:</span>
            <span className="font-medium capitalize">{incomingSession.service_category}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Session Type:</span>
            <span className="font-medium capitalize">{incomingSession.session_type}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">User ID:</span>
            <span className="font-medium text-sm">{incomingSession.user_id}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Session ID:</span>
            <span className="font-medium text-sm">{incomingSession.id}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Requested:</span>
            <span className="font-medium text-sm">
              {new Date(incomingSession.created_at).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="flex-1 flex items-center justify-center gap-2 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <XCircle className="w-5 h-5" />
            Reject
          </button>
          
          <button
            onClick={handleAccept}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
