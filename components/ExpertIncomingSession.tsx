"use client";

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
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
  const [expertId, setExpertId] = useState<string | null>(null)
  const [incomingSession, setIncomingSession] = useState<LiveSession | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      
    })
  }, [])

  useEffect(() => {
    const fetchExpert = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const authId = userData.user?.id
      
      if (!authId) {
        
        return
      }
      
      
      
      
      const { data, error } = await supabase
        .from("expert_astrologers")
        .select("id")
        .eq("id", authId)  
        .single()
      
      if (error) {
        
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return
      }
      
      if (!data) {
        
        
        return
      }
      
      
      setExpertId(data.id)
    }

    fetchExpert()
  }, [user])

  useEffect(() => {
    if (!expertId) return
    
    const fetchPendingSessions = async () => {
      const { data, error } = await supabase
        .from("live_sessions")
        .select("*")
        .eq("expert_id", expertId)
        .in("status", ["pending", "active"])
        .order('created_at', { ascending: false })
      
      if (error) {
        
        return
      }
      
      if (data && data.length > 0) {
        
        setIncomingSession(data[0])
        setShowModal(true)
      }
    }

    fetchPendingSessions()
  }, [expertId])

  useEffect(() => {
    if (!expertId) return
    
    
    const channel = supabase
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
          
          
          if (payload.new?.status === "pending") {
            setIncomingSession(payload.new)
            setShowModal(true)
          }
        }
      )
      .subscribe((status: any) => {
        
      })
    
    return () => {
      
      supabase.removeChannel(channel)
    }
  }, [expertId])

  const handleAccept = async () => {
    try {
      
      
      
      
      
      
      if (!incomingSession?.id) {
        
        return
      }
      
      // Ensure auth session exists
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        
        return
      }
      
      if (!sessionData?.session) {
        
        return
      }
      
      
      
      
      
      
      const sessionId = String(incomingSession.id).trim()
      
      
      // Update session status to accepted
      const { data, error } = await supabase
        .from("live_sessions")
        .update({ 
          status: "accepted",
          updated_at: new Date().toISOString()
        })
        .eq("id", sessionId)
        .eq("expert_id", sessionData?.session?.user?.id)
        .select()
      
      
      
      
      
      if (error) {
        
        console.error("Update error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return
      }
      
      if (!data || data.length === 0) {
        
        
        
        return
      }
      
      
      
      setShowModal(false)
      setIncomingSession(null)
      
      // 3️⃣ Update Expert Accept Logic - Redirect to chat session
      router.push(`/session/chat/${sessionId}`)
    } catch (err) {
      
      
      alert("Failed to accept session. Please try again.")
    }
  }

  const handleReject = async () => {
    try {
      
      
      if (!incomingSession || !incomingSession.id) {
        
        return
      }
      
      // Ensure auth session exists
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        
        return
      }
      
      if (!sessionData?.session) {
        
        return
      }
      
      
      const sessionId = String(incomingSession.id).trim()
      
      
      // Update session status to rejected
      const { data, error } = await supabase
        .from("live_sessions")
        .update({ 
          status: "rejected",
          updated_at: new Date().toISOString()
        })
        .eq("id", sessionId)
        .eq("expert_id", sessionData?.session?.user?.id)
        .select()
      
      if (error) {
        
        return
      }
      
      if (!data || data.length === 0) {
        
        return
      }
      
      
      setShowModal(false)
      setIncomingSession(null)
      
      // Call reject callback if provided
      onSessionRejected?.(incomingSession)
      
      // Show user feedback
      alert("Session rejected successfully. User has been notified.")
    } catch (err) {
      
      alert("Failed to reject session. Please try again.")
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
