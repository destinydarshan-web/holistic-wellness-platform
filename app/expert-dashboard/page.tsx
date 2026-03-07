'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Calendar, Users, Star, Clock, DollarSign, LogOut, Settings, AlertCircle, Bell, CheckCircle, X, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import ExpertNotifications from '@/components/ExpertNotifications'

export default function ExpertDashboard() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    earnings: 0
  })
  const [bookings, setBookings] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [expertProfile, setExpertProfile] = useState<any>(null)
  const [pendingSessions, setPendingSessions] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (!profile || (profile.role !== 'expert' && profile.role !== 'astrologer' && profile.role !== 'counsellor') || profile.status !== 'approved') {
        router.push('/account-under-review')
        return
      }

      // Check if expert profile is complete
      const loadExpertProfile = async () => {
        try {
          let tableName = ""
          if (profile?.specialization === 'counsellor') {
            tableName = "expert_counsellors"
          } else {
            tableName = "expert_astrologers" // Default for astrologer
          }
          
          console.log('=== DEBUG: Loading profile from table ===', tableName)
          
          const { data, error } = await supabase
            .from(tableName)
            .select("*")
            .eq("id", user.id)
            .maybeSingle()
          
          if (error) {
            // Check if table doesn't exist
            if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
              console.log(`${tableName} table does not exist yet - showing completion notice`)
              setExpertProfile(null) // Will trigger completion notice
            } else {
              console.error('Error loading expert profile:', error)
              console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
              })
            }
          } else {
            console.log('Expert profile loaded:', data)
            setExpertProfile(data)
          }
        } catch (err) {
          console.error('Unexpected error loading expert profile:', err)
          // Set to null to show completion notice
          setExpertProfile(null)
        }
      }

      loadExpertProfile()
      loadExpertData()
      loadPendingSessions()
    }
  }, [user, profile, loading, router])

  const loadPendingSessions = async () => {
    try {
      console.log('=== DEBUG: Loading Pending Sessions ===')
      
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('expert_id', user?.id)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading pending sessions:', error)
      } else {
        console.log('Pending sessions found:', data)
        setPendingSessions(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading pending sessions:', err)
    }
  }

  const handleAcceptSession = async (sessionId: string) => {
    try {
      console.log('=== DEBUG: Accepting Session ===', sessionId)
      
      const { data, error } = await supabase
        .from('live_sessions')
        .update({ 
          status: 'accepted'
        })
        .eq('id', sessionId)
        .eq('expert_id', user?.id)
        .select()

      if (error) {
        console.error('Error accepting session:', error)
        alert('Failed to accept session. Please try again.')
      } else {
        console.log('Session accepted successfully:', data)
        // Remove from pending list
        setPendingSessions(prev => prev.filter(session => session.id !== sessionId))
        // Redirect expert to session chat
        router.push(`/session/chat/${sessionId}`)
      }
    } catch (err) {
      console.error('Unexpected error accepting session:', err)
      alert('Failed to accept session. Please try again.')
    }
  }

  const handleRejectSession = async (sessionId: string) => {
    try {
      console.log('=== DEBUG: Rejecting Session ===', sessionId)
      
      const { data, error } = await supabase
        .from('live_sessions')
        .update({ 
          status: 'rejected'
        })
        .eq('id', sessionId)
        .eq('expert_id', user?.id)
        .select()

      if (error) {
        console.error('Error rejecting session:', error)
        alert('Failed to reject session. Please try again.')
      } else {
        console.log('Session rejected successfully:', data)
        // Remove from pending list
        setPendingSessions(prev => prev.filter(session => session.id !== sessionId))
      }
    } catch (err) {
      console.error('Unexpected error rejecting session:', err)
      alert('Failed to reject session. Please try again.')
    }
  }

  const loadExpertData = async () => {
    try {
      console.log('=== DEBUG: Loading Expert Dashboard Data ===')
      
      // Load real stats from database
      const [bookingsResponse, sessionsResponse] = await Promise.allSettled([
        supabase
          .from('bookings')
          .select('*')
          .eq('expert_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('live_sessions')
          .select('*')
          .eq('expert_id', user?.id)
          .order('created_at', { ascending: false })
      ])

      let bookings = []
      let sessions = []
      
      if (bookingsResponse.status === 'fulfilled') {
        bookings = bookingsResponse.value.data || []
        console.log('Bookings loaded:', bookings.length)
      } else {
        console.log('Bookings table not found or error:', bookingsResponse.reason)
      }
      
      if (sessionsResponse.status === 'fulfilled') {
        sessions = sessionsResponse.value.data || []
        console.log('Sessions loaded:', sessions.length)
      } else {
        console.log('Sessions table not found or error:', sessionsResponse.reason)
      }

      // Calculate stats from real data
      const completedSessions = sessions.filter(s => s.status === 'completed').length
      const upcomingSessions = sessions.filter(s => s.status === 'accepted' || s.status === 'active').length
      const totalBookings = bookings.length
      
      // Calculate earnings from completed sessions (more accurate than bookings)
      const earnings = sessions
        .filter(s => s.status === 'completed')
        .reduce((total, session) => {
          // Calculate session duration and earnings
          const sessionDuration = session.started_at && session.ended_at 
            ? Math.ceil((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000)
            : 0;
          const sessionEarnings = sessionDuration * (session.price_per_minute || 0);
          return total + sessionEarnings;
        }, 0);

      console.log('=== DEBUG: Expert Stats Calculated ===');
      console.log('Completed sessions:', completedSessions);
      console.log('Upcoming sessions:', upcomingSessions);
      console.log('Total bookings:', totalBookings);
      console.log('Earnings from sessions:', earnings);
      console.log('Earnings from bookings:', bookings.filter(b => b.status === 'completed').reduce((total, b) => total + (b.amount || 0), 0));

      console.log('=== DEBUG: Expert Stats Calculated ===')
      console.log('Total bookings:', totalBookings)
      console.log('Completed sessions:', completedSessions)
      console.log('Upcoming sessions:', upcomingSessions)
      console.log('Earnings:', earnings)

      setStats({
        totalBookings,
        completedSessions,
        upcomingSessions,
        earnings
      })

      setBookings(bookings.slice(0, 5)) // Show recent 5 bookings
      setSessions(sessions.slice(0, 5)) // Show recent 5 sessions
      
    } catch (error) {
      console.error('Error loading expert data:', error)
      // Set empty stats on error
      setStats({
        totalBookings: 0,
        completedSessions: 0,
        upcomingSessions: 0,
        earnings: 0
      })
      setBookings([])
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  // Add loadExpertData to the loadExpertData function
  useEffect(() => {
    if (user && profile) {
      loadExpertData()
    }
  }, [user, profile])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F14]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect
  }

  return (
    <div className="pt-24 py-8 bg-[#0F0F14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Expert Dashboard
            </h1>
            <p className="text-white/60">
              Welcome back, {profile.full_name || user.email?.split('@')[0]}! • {profile.specialization?.replace('_', ' ').charAt(0).toUpperCase() + (profile.specialization?.slice(1).replace('_', '') || '')}
            </p>
          </div>
          <ExpertNotifications />
        </div>

        {/* Profile Completion Notice */}
        {(!expertProfile || !expertProfile.is_profile_complete) && (
          <div className="mb-8 p-6 bg-[#fdce20]/10 border border-[#fdce20]/20 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-[#fdce20]" />
              <div>
                <h3 className="text-lg font-semibold text-[#fdce20] mb-1">
                  Your account has been approved. Please complete your profile to get listed.
                </h3>
                <p className="text-[#fdce20]/80 text-sm">
                  Complete your profile information including display name, bio, experience, pricing, and specialties to appear in the {profile?.specialization === 'counsellor' ? 'counselling' : 'astrology'} listings.
                </p>
                <button
                  onClick={() => router.push('/expert/profile')}
                  className="mt-4 px-4 py-2 bg-[#fdce20] text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Completed Success Message */}
        {expertProfile && expertProfile.is_profile_complete && (
          <div className="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-1">
                  Profile Completed Successfully
                </h3>
                <p className="text-green-200 text-sm">
                  Your profile is now live and visible to users in the {profile?.specialization === 'counsellor' ? 'counselling' : 'astrology'} listings. You can start receiving booking requests.
                </p>
                <button
                  onClick={() => router.push(profile?.specialization === 'counsellor' ? '/counselling' : '/astrology')}
                  className="mt-4 px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-400 transition-colors"
                >
                  View Your Listing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pending Sessions Notifications */}
        {pendingSessions.length > 0 && (
          <div className="bg-[#1C1C24] rounded-xl border border-white/10 mb-8">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Bell className="text-[#fbcc1e] w-6 h-6 animate-pulse" />
                  <h2 className="text-xl font-semibold text-white">
                    Pending Session Requests ({pendingSessions.length})
                  </h2>
                </div>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {showNotifications ? 'Hide' : 'Show'} Details
                </button>
              </div>
              
              {showNotifications && (
                <div className="space-y-3">
                  {pendingSessions.map((session) => (
                    <div key={session.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-white mb-1">
                            {session.user_name} - {session.service_category}
                          </h4>
                          <p className="text-white/60 text-sm">
                            Session ID: {session.id}
                          </p>
                          <p className="text-white/60 text-sm">
                            Created: {new Date(session.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptSession(session.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectSession(session.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 cursor-pointer hover:bg-[#2C2C34] transition-colors group"
            onClick={() => router.push('/expert-bookings')}
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-[#fbcc1e] w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold text-white">{stats.totalBookings}</span>
            </div>
            <p className="text-white/60">Total Bookings</p>
            <div className="mt-2 text-xs text-[#fdce20] opacity-0 group-hover:opacity-100 transition-opacity">
              Click to view details →
            </div>
          </div>
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Star className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">{stats.completedSessions}</span>
            </div>
            <p className="text-white/60">Completed Sessions</p>
          </div>
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">{stats.upcomingSessions}</span>
            </div>
            <p className="text-white/60">Upcoming Sessions</p>
          </div>
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">₹{stats.earnings.toLocaleString()}</span>
            </div>
            <p className="text-white/60">Total Earnings</p>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10 mb-8">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Upcoming Sessions</h2>
          </div>
          <div className="p-6">
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#fbcc1e]/20 rounded-full flex items-center justify-center">
                        <Users className="text-[#fbcc1e] w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">
                          {booking.user_name || 'Client'} - {booking.service_category || 'Consultation'}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {new Date(booking.created_at).toLocaleDateString()} at {new Date(booking.created_at).toLocaleTimeString()}
                        </p>
                        <p className="text-white/60 text-sm">
                          Session ID: {booking.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                        booking.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : booking.status === 'active'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-[#fdce20]'
                      }`}>
                        {booking.status}
                      </span>
                      {booking.amount && (
                        <p className="text-white/60 text-sm">₹{booking.amount}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No bookings yet</p>
                <p className="text-white/40 text-sm mt-2">Your booking history will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/profile"
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <Settings className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Profile Settings</h3>
              <p className="text-white/60 text-sm">Update your expert profile</p>
            </Link>
            <Link
              href="/schedule"
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <Calendar className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Manage Schedule</h3>
              <p className="text-white/60 text-sm">Set your availability</p>
            </Link>
            <Link
              href="/earnings"
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <DollarSign className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">View Earnings</h3>
              <p className="text-white/60 text-sm">Track your income</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
