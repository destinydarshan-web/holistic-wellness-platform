'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Calendar, Users, Star, Clock, DollarSign, LogOut, Settings, AlertCircle, Bell, CheckCircle, X, MessageCircle, History } from 'lucide-react'
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
          } else if (profile?.specialization === 'yoga_trainer') {
            tableName = "expert_yoga"
          } else if (profile?.specialization === 'meditation_expert') {
            tableName = "expert_meditation"
          } else if (profile?.specialization === 'astrologer') {
            tableName = "expert_astrologers"
          } else if (profile?.role === 'expert') {
            // Default for expert role to meditation
            tableName = "expert_meditation"
          } else if (profile?.role === 'astrologer') {
            tableName = "expert_astrologers"
          } else {
            tableName = "expert_astrologers" // Default fallback
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
      console.log('=== DEBUG: Loading Pending Appointments ===')
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('expert_id', user?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading pending appointments:', error)
      } else {
        console.log('Pending appointments found:', data)
        // Enrich with user data
        const enrichedAppointments = await Promise.all(
          (data || []).map(async (appointment) => {
            if (appointment.user_id) {
              console.log('=== DEBUG: Fetching user data for user_id ===', appointment.user_id)
              console.log('=== DEBUG: Appointment data ===', appointment)
              
              try {
                // First, let's check if user exists at all in auth.users
                const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(appointment.user_id)
                console.log('Auth user check:', { authUser, authError })
                
                // Then check profiles table (note: profiles table doesn't have email column)
                const { data: userData, error: userError } = await supabase
                  .from('profiles')
                  .select('full_name, role, specialization, status, created_at')
                  .eq('id', appointment.user_id)
                  .maybeSingle()
                
                console.log('Profile data result:', { userData, userError })
                
                if (userError) {
                  console.error('Error fetching user data:', userError)
                  console.log('Error details:', JSON.stringify(userError, null, 2))
                  
                  // Try a broader query to see what's available
                  const { data: allProfiles, error: allError } = await supabase
                    .from('profiles')
                    .select('id, full_name, role')
                    .limit(5)
                  
                  console.log('Sample profiles in database:', { allProfiles, allError })
                  
                  return {
                    ...appointment,
                    user_name: `User (${userError.code || 'Error'})`,
                    user_email: 'error@debug.com'
                  }
                }
                
                if (!userData) {
                  console.log('No profile found for user_id:', appointment.user_id)
                  // Try to get email from auth.users as fallback
                  const userEmail = (authUser as any)?.email || 'unknown@auth.com'
                  return {
                    ...appointment,
                    user_name: 'User (No Profile)',
                    user_email: userEmail
                  }
                }
                
                return {
                  ...appointment,
                  user_name: userData.full_name || (authUser as any)?.email?.split('@')[0] || 'Unknown User',
                  user_email: (authUser as any)?.email || 'noemail@debug.com'
                }
              } catch (fetchError) {
                console.error('Unexpected error fetching user data:', fetchError)
                return {
                  ...appointment,
                  user_name: 'User (Exception)',
                  user_email: 'exception@debug.com'
                }
              }
            }
            return appointment
          })
        )
        
        setPendingSessions(enrichedAppointments)
      }
    } catch (err) {
      console.error('Unexpected error loading pending appointments:', err)
    }
  }

  const handleAcceptSession = async (appointmentId: string) => {
    try {
      console.log('=== DEBUG: Accepting Appointment ===', appointmentId)
      
      // Update appointment status to confirmed
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .update({ 
          status: 'confirmed',
          payment_status: 'paid'
        })
        .eq('id', appointmentId)
        .eq('expert_id', user?.id)
        .select()
        .single()

      if (appointmentError) {
        console.error('Error accepting appointment:', appointmentError)
        alert('Failed to accept appointment. Please try again.')
        return
      }

      console.log('Appointment accepted successfully:', appointmentData)

      // Create notification for user
      try {
        const userNotificationResponse = await fetch('/api/user-notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: appointmentData.user_id,
            expert_id: user?.id,
            type: 'appointment_confirmed',
            message: `Your appointment request has been confirmed by ${profile?.full_name || 'Expert'}`,
            appointment_id: appointmentId
          })
        })

        if (userNotificationResponse.ok) {
          console.log('✅ User notification sent successfully')
        } else {
          console.log('⚠️ Failed to send user notification')
        }
      } catch (notificationError) {
        console.error('Error sending user notification:', notificationError)
      }

      // Remove from pending list
      setPendingSessions(prev => prev.filter(appointment => appointment.id !== appointmentId))
      
      // Show success message
      alert('Appointment accepted! User has been notified.')
      
    } catch (err) {
      console.error('Unexpected error accepting appointment:', err)
      alert('Failed to accept appointment. Please try again.')
    }
  }

  const handleRejectSession = async (appointmentId: string) => {
    try {
      console.log('=== DEBUG: Rejecting Appointment ===', appointmentId)
      
      // Update appointment status to cancelled
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled'
        })
        .eq('id', appointmentId)
        .eq('expert_id', user?.id)
        .select()
        .single()

      if (appointmentError) {
        console.error('Error rejecting appointment:', appointmentError)
        alert('Failed to reject appointment. Please try again.')
        return
      }

      console.log('Appointment rejected successfully:', appointmentData)

      // Create notification for user
      try {
        const userNotificationResponse = await fetch('/api/user-notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: appointmentData.user_id,
            expert_id: user?.id,
            type: 'appointment_cancelled',
            message: `Your appointment request has been declined by ${profile?.full_name || 'Expert'}`,
            appointment_id: appointmentId
          })
        })

        if (userNotificationResponse.ok) {
          console.log('✅ User notification sent successfully')
        } else {
          console.log('⚠️ Failed to send user notification')
        }
      } catch (notificationError) {
        console.error('Error sending user notification:', notificationError)
      }

      // Remove from pending list
      setPendingSessions(prev => prev.filter(appointment => appointment.id !== appointmentId))
      
      // Show success message
      alert('Appointment rejected. User has been notified.')
      
    } catch (err) {
      console.error('Unexpected error rejecting appointment:', err)
      alert('Failed to reject appointment. Please try again.')
    }
  }

  const loadExpertData = async () => {
    try {
      console.log('=== DEBUG: Loading Expert Dashboard Data ===')
      
      // Load real stats from database
      const [bookingsResponse, sessionsResponse, transactionsResponse] = await Promise.allSettled([
        supabase
          .from('bookings')
          .select('*')
          .eq('expert_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('live_sessions')
          .select('*')
          .eq('expert_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user?.id)
          .eq('type', 'credit')
          .order('created_at', { ascending: false })
      ])

      let bookings = []
      let sessions = []
      let transactions = []
      
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

      if (transactionsResponse.status === 'fulfilled') {
        transactions = transactionsResponse.value.data || []
        console.log('Transactions loaded:', transactions.length)
      } else {
        console.log('Transactions table not found or error:', transactionsResponse.reason)
      }

      // Calculate stats from real data
      const completedSessions = sessions.filter(s => s.status === 'completed').length
      const upcomingSessions = sessions.filter(s => s.status === 'accepted' || s.status === 'active').length
      const totalBookings = bookings.length
      
      // Calculate earnings using the same logic as earnings page
      const earnings = await calculateTotalEarnings(sessions, transactions);

      console.log('=== DEBUG: Expert Stats Calculated ===');
      console.log('Completed sessions:', completedSessions);
      console.log('Upcoming sessions:', upcomingSessions);
      console.log('Total bookings:', totalBookings);
      console.log('Earnings from sessions:', earnings);

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

  const calculateTotalEarnings = async (sessions: any[], transactions: any[]) => {
    try {
      console.log('=== DEBUG: Calculating Total Earnings ===');
      
      // Process sessions and match with transactions (same logic as earnings page)
      const earningsRecords = sessions?.map((session: any) => {
        try {
          // Only process completed sessions
          if (session.status !== 'completed') {
            return null
          }

          // Match transaction to this specific session using multiple strategies
          let transactionAmount = 0
          if (transactions && transactions.length > 0) {
            let sessionTransaction = null
            
            // Strategy 1: Try to find transaction with session ID in description
            sessionTransaction = transactions.find(t => 
              t.description && t.description.includes(session.id)
            )
            
            if (!sessionTransaction) {
              // Strategy 2: Try timestamp matching around session end time
              const sessionEndDate = session.ended_at ? new Date(session.ended_at) : new Date(session.created_at)
              sessionTransaction = transactions.find(t => {
                if (t.type !== 'credit') return false
                const transactionDate = new Date(t.created_at)
                const timeDiff = Math.abs(transactionDate.getTime() - sessionEndDate.getTime())
                // Look for transactions within 10 minutes of session end
                return timeDiff < 10 * 60 * 1000
              })
            }
            
            if (sessionTransaction) {
              transactionAmount = sessionTransaction.amount
            }
          }
          
          // Only process sessions that have matching transactions
          if (transactionAmount === 0) {
            return null
          }

          return {
            amount: transactionAmount
          }
        } catch (error) {
          console.error('=== DEBUG: Error processing session ===', session.id, error)
          return null
        }
      }).filter(Boolean) || []

      console.log('=== DEBUG: Processed earnings records ===', earningsRecords.length);

      // Calculate total earnings from all matched transactions
      const totalEarnings = earningsRecords.reduce((sum, record) => sum + (record?.amount || 0), 0);
      
      console.log('=== DEBUG: Total earnings calculated ===', totalEarnings);
      
      return totalEarnings;
    } catch (error) {
      console.error('=== DEBUG: Error calculating total earnings ===', error);
      return 0;
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
                  Complete your profile information including display name, bio, experience, pricing, and specialties to appear in the listings.
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
                  Your profile is now live and visible to users in the listings. You can start receiving booking requests.
                </p>
                <button
                  onClick={() => {
                    // Navigate to the appropriate service page based on specialization
                    if (profile?.specialization === 'counsellor') {
                      router.push('/counselling')
                    } else if (profile?.specialization === 'yoga_trainer') {
                      router.push('/yoga')
                    } else if (profile?.specialization === 'meditation_expert') {
                      router.push('/meditation')
                    } else {
                      router.push('/astrology')
                    }
                  }}
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
                  {pendingSessions.map((appointment) => (
                    <div key={appointment.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-white mb-1">
                            {appointment.user_name} - {appointment.service_category}
                          </h4>
                          <p className="text-white/60 text-sm">
                            Appointment ID: {appointment.id}
                          </p>
                          <p className="text-white/60 text-sm">
                            Date: {appointment.appointment_date}
                          </p>
                          <p className="text-white/60 text-sm">
                            Time: {appointment.appointment_time}
                          </p>
                          <p className="text-white/60 text-sm">
                            Created: {new Date(appointment.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptSession(appointment.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectSession(appointment.id)}
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
              <AlertCircle className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">{pendingSessions.length}</span>
            </div>
            <p className="text-white/60">Pending Requests</p>
          </div>
          <Link
            href="/expert/earnings"
            className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#fbcc1e] w-8 h-8 flex items-center justify-center font-bold text-lg">₹</span>
              <span className="text-xs text-white/60">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">₹{stats.earnings.toLocaleString()}</p>
            <p className="text-sm text-white/60">Total earnings</p>
            <div className="mt-2 text-xs text-[#fdce20] opacity-0 group-hover:opacity-100 transition-opacity">
              View details →
            </div>
          </Link>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/expert/profile"
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <Settings className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Profile Settings</h3>
              <p className="text-white/60 text-sm">Update your expert profile</p>
            </Link>
            <Link
              href="/expert/calendar"
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <Calendar className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Calendar</h3>
              <p className="text-white/60 text-sm">View booked appointments</p>
            </Link>
            <Link
              href="/expert/reviews"
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <Star className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Client Reviews</h3>
              <p className="text-white/60 text-sm">View client feedback</p>
            </Link>
            <Link
              href="/expert-dashboard/history"
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <History className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Session History</h3>
              <p className="text-white/60 text-sm">View past sessions</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
