'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Database } from '@/lib/supabaseClient'
import { 
  MessageCircle, 
  Phone, 
  Video, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Plus,
  CreditCard,
  History,
  Star,
  ArrowRight,
  Bell,
  Lightbulb,
  Heart,
  Zap,
  Sparkles,
  ChevronRight
} from 'lucide-react'

type Booking = Database['public']['Tables']['bookings']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']
type Expert = Database['public']['Tables']['expert_astrologers']['Row']

interface EngagementData {
  active: (Booking | Appointment)[]
  upcoming: (Booking | Appointment)[]
  past: (Booking | Appointment)[]
  experts: Record<string, Expert>
  balance: number
  transactions: Transaction[]
}

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [data, setData] = useState<EngagementData | null>(null)
  const [selectedService, setSelectedService] = useState<string>('all')
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'past'>('active')
  
  const services = ['all', 'astrology', 'counselling', 'yoga', 'meditation'] as const

  // Filter engagements based on active tab
  const filteredEngagements = data ? 
    (activeTab === 'active' ? data.active :
     activeTab === 'upcoming' ? data.upcoming :
     data.past) : []

  // Debug: Log current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        console.error("Error fetching user:", error)
        return
      }

      console.log("🔍 Logged in user id:", data.user?.id)
    }

    getCurrentUser()
  }, [])

  // Debug: Fetch wallet directly from user_wallet table
  useEffect(() => {
    const fetchWallet = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id

      console.log("🔍 Auth user id:", userId)

      try {
        const { data, error } = await supabase
          .from("user_wallet")
          .select("*")
          .eq("user_id", userId)

        console.log("🔍 Wallet raw response:", data)
        console.log("🔍 Wallet error:", error)

        if (error) {
          console.log("❌ Wallet table not found or error:", error)
          setWalletBalance(0)
          return
        }

        if (data && data.length > 0) {
          console.log("✅ Wallet balance found:", data[0].balance)
          setWalletBalance(data[0].balance)
        } else {
          console.log("❌ No wallet data found")
          setWalletBalance(0)
        }
      } catch (err) {
        console.log("❌ Wallet fetch exception:", err)
        setWalletBalance(0)
      }
    }

    fetchWallet()
    
    // Set up real-time wallet updates
    const setupRealtimeUpdates = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      
      if (userId) {
        const channel = supabase
          .channel('wallet_changes')
          .on('postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'user_wallet', filter: `user_id=eq.${userId}` },
            (payload) => {
              console.log('🔄 Real-time wallet update:', payload.new)
              setWalletBalance(payload.new.balance)
            }
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      }
    }
    
    setupRealtimeUpdates()
  }, [])

  useEffect(() => {
    console.log('=== DEBUG: Dashboard useEffect triggered ===')
    console.log('Loading:', loading)
    console.log('User:', user ? user.id : 'null')
    console.log('Profile:', profile)
    console.log('Data loaded:', data ? 'yes' : 'no')
    
    if (loading) {
      console.log('=== DEBUG: Auth still loading, waiting...')
      return
    }

    if (!user) {
      console.log('=== DEBUG: No user, redirecting to login')
      router.push('/login')
      return
    }

    // Handle role-based redirects if profile exists
    if (profile && profile.role !== 'user') {
      console.log('=== DEBUG: Non-user role, redirecting:', profile.role)
      switch (profile.role) {
        case 'admin':
          router.push('/admin-dashboard')
          break
        case 'expert':
        case 'astrologer':
          router.push(profile.status === 'approved' ? '/expert-dashboard' : '/account-under-review')
          break
      }
      return
    }

    // Load data for users (or when profile is null but user exists)
    if (!data) {
      console.log('=== DEBUG: User authenticated, loading dashboard data')
      loadDashboardData()
    }
  }, [loading, user, profile, data, router])

  const loadDashboardData = async () => {
    if (!user?.id) return
    
    try {
      setDashboardLoading(true)
      
      console.log('=== DEBUG: Loading Dashboard Data ===')
      console.log('User ID:', user.id)
      
      // Fetch all data in parallel with error handling
      const [bookingsResponse, appointmentsResponse, transactionsResponse, expertsResponse] = await Promise.allSettled([
        supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('scheduled_at', { ascending: false }),
        supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.id)
          .order('appointment_date', { ascending: false })
          .order('appointment_time', { ascending: false }),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('expert_astrologers')
          .select('*')
      ])

      console.log('=== DEBUG: Dashboard API Responses ===')
      
      // Handle bookings response
      let bookings = []
      if (bookingsResponse.status === 'fulfilled') {
        bookings = bookingsResponse.value.data || []
        console.log('Bookings loaded:', bookings.length)
      } else {
        console.log('Bookings table not found or error:', bookingsResponse.reason)
      }
      
      // Handle appointments response
      let appointments = []
      if (appointmentsResponse.status === 'fulfilled') {
        appointments = appointmentsResponse.value.data || []
        console.log('Appointments loaded:', appointments.length)
      } else {
        console.log('Appointments table not found or error:', appointmentsResponse.reason)
      }
      
      // Handle transactions response
      let transactions = []
      if (transactionsResponse.status === 'fulfilled') {
        transactions = transactionsResponse.value.data || []
        console.log('Transactions loaded:', transactions.length)
      } else {
        console.log('Transactions table not found or error:', transactionsResponse.reason)
      }
      
      // Handle experts response
      let experts = {}
      if (expertsResponse.status === 'fulfilled') {
        const expertsData = expertsResponse.value.data || []
        console.log('Experts loaded:', expertsData.length)
        // Fix: Use expert.id instead of expert.user_id
        experts = expertsData.reduce((acc, expert) => {
          acc[expert.id] = expert
          return acc
        }, {} as Record<string, Expert>)
      } else {
        console.log('Experts table error:', expertsResponse.reason)
      }

      // Combine bookings and appointments for unified activity feed
      const allEngagements = [...bookings, ...appointments]
      
      // Categorize engagements
      const now = new Date()
      console.log('=== DEBUG: Current Time ===')
      console.log('Current time:', now.toISOString())
      
      const active = allEngagements.filter(engagement => {
        // Active bookings
        if ('status' in engagement) {
          return engagement.status === 'active'
        }
        // Active appointments (appointments that are currently happening)
        if ('appointment_date' in engagement) {
          const appointmentDateTime = new Date(`${engagement.appointment_date}T${engagement.appointment_time}`)
          console.log('=== DEBUG: Appointment Date Check ===')
          console.log('Appointment:', engagement)
          console.log('Appointment date/time:', `${engagement.appointment_date}T${engagement.appointment_time}`)
          console.log('Parsed appointment datetime:', appointmentDateTime.toISOString())
          console.log('Is appointment upcoming <= now:', appointmentDateTime <= now)
          console.log('Appointment status:', engagement.status)
          return engagement.status === 'upcoming' && appointmentDateTime <= now
        }
        return false
      })
      
      const upcoming = allEngagements.filter(engagement => {
        // Upcoming bookings
        if ('status' in engagement) {
          return engagement.status === 'upcoming' && 
                 new Date(engagement.scheduled_at) > now
        }
        // Upcoming appointments
        if ('appointment_date' in engagement) {
          const appointmentDateTime = new Date(`${engagement.appointment_date}T${engagement.appointment_time}`)
          console.log('=== DEBUG: Upcoming Appointment Check ===')
          console.log('Appointment:', engagement)
          console.log('Appointment date/time:', `${engagement.appointment_date}T${engagement.appointment_time}`)
          console.log('Parsed appointment datetime:', appointmentDateTime.toISOString())
          console.log('Is appointment upcoming > now:', appointmentDateTime > now)
          console.log('Appointment status:', engagement.status)
          return engagement.status === 'upcoming' && appointmentDateTime > now
        }
        return false
      })
      
      const past = allEngagements.filter(engagement => {
        // Past bookings
        if ('status' in engagement) {
          return engagement.status === 'completed'
        }
        // Past appointments
        if ('appointment_date' in engagement) {
          const appointmentDateTime = new Date(`${engagement.appointment_date}T${engagement.appointment_time}`)
          console.log('=== DEBUG: Past Appointment Check ===')
          console.log('Appointment:', engagement)
          console.log('Appointment date/time:', `${engagement.appointment_date}T${engagement.appointment_time}`)
          console.log('Parsed appointment datetime:', appointmentDateTime.toISOString())
          console.log('Is appointment completed?:', engagement.status === 'completed')
          return engagement.status === 'completed'
        }
        return false
      })

      console.log('=== DEBUG: Engagement Filtering ===')
      console.log('All engagements:', allEngagements.length)
      console.log('Active engagements:', active.length)
      console.log('Upcoming engagements:', upcoming.length)
      console.log('Past engagements:', past.length)
      console.log('Active tab:', activeTab)
      console.log('Filtered engagements:', filteredEngagements.length)

      // Use the actual wallet balance from user_wallet table
      // The transaction calculation is not reliable for the total balance
      const balance = walletBalance

      console.log('=== DEBUG: Dashboard Data Summary ===')
      console.log('Active bookings:', active.length)
      console.log('Upcoming bookings:', upcoming.length)
      console.log('Past bookings:', past.length)
      console.log('Wallet balance:', balance)

      setData({
        active,
        upcoming,
        past,
        experts,
        balance,
        transactions
      })
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      // Set empty data to prevent infinite loading
      setData({
        active: [],
        upcoming: [],
        past: [],
        experts: {},
        balance: 0,
        transactions: []
      })
    } finally {
      setDashboardLoading(false)
    }
  }

  // Filter bookings by service
  const filterBookings = (bookings: Booking[]) => {
    if (selectedService === 'all') return bookings
    return bookings.filter(b => b.service_category === selectedService)
  }

  // Get next session (first upcoming)
  const nextSession = data?.upcoming[0]

  // Service icons
  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'astrology': return <Star className="w-4 h-4" />
      case 'counselling': return <MessageCircle className="w-4 h-4" />
      case 'yoga': return <Users className="w-4 h-4" />
      case 'meditation': return <Sparkles className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  // Engagement-based rendering components
  const EngagementCard = ({ booking, type }: { booking: Booking | Appointment; type: 'active' | 'upcoming' | 'past' }) => {
    const expert = data?.experts[booking.expert_id]
    
    // Determine if this is a booking or appointment
    const isAppointment = 'appointment_date' in booking
    
    // Check if join is enabled for appointments
    const isAppointmentJoinEnabled = type === 'upcoming' && isAppointment && 
      new Date(`${booking.appointment_date}T${booking.appointment_time}`).getTime() - new Date().getTime() <= 10 * 60 * 1000
    
    // Check if join is enabled for bookings
    const isBookingJoinEnabled = type === 'upcoming' && !isAppointment && 
      'scheduled_at' in booking &&
      new Date(booking.scheduled_at).getTime() - new Date().getTime() <= 10 * 60 * 1000
    
    const canJoinSession = isAppointmentJoinEnabled || isBookingJoinEnabled
    
    // Get service category with fallback
    const serviceCategory = isAppointment ? booking.service_category : 
                         ('service_category' in booking ? booking.service_category : 'astrology')
    
    // Get amount with fallback
    const amount = isAppointment ? booking.amount_paid : 
                   ('amount' in booking ? booking.amount : 0)
    
    // Get status text with fallback
    const statusText = booking.status
    
    // Get date/time with fallback
    const dateTime = isAppointment ? 
      `${booking.appointment_date} at ${booking.appointment_time}` :
      ('scheduled_at' in booking ? new Date(booking.scheduled_at).toLocaleString() : 'Unknown')

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
        {/* Header with icons and badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center
              ${serviceCategory === 'astrology' ? 'bg-purple-100 text-purple-600' : ''}
              ${serviceCategory === 'counselling' ? 'bg-blue-100 text-blue-600' : ''}
              ${serviceCategory === 'yoga' ? 'bg-green-100 text-green-600' : ''}
              ${serviceCategory === 'meditation' ? 'bg-indigo-100 text-indigo-600' : ''}
            `}>
              {serviceCategory === 'astrology' && <Star className="w-4 h-4" />}
              {serviceCategory === 'counselling' && <MessageCircle className="w-4 h-4" />}
              {serviceCategory === 'yoga' && <Users className="w-4 h-4" />}
              {serviceCategory === 'meditation' && <Sparkles className="w-4 h-4" />}
              {!['astrology', 'counselling', 'yoga', 'meditation'].includes(serviceCategory) && <Calendar className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {expert?.display_name || 'Expert'}
              </p>
              <p className="text-sm text-gray-500">
                {expert?.primary_specialization || 'General'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium
              ${statusText === 'active' ? 'bg-green-100 text-green-800' : ''}
              ${statusText === 'upcoming' ? 'bg-blue-100 text-blue-800' : ''}
              ${statusText === 'completed' ? 'bg-gray-100 text-gray-800' : ''}
              ${statusText === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
            `}>
              {statusText}
            </span>
            <span className="text-sm text-gray-500">
              {isAppointment ? `Appointment` : `Session`}
            </span>
            {amount > 0 && (
              <span className="text-sm font-medium text-gray-900">
                ₹{amount.toLocaleString()}
              </span>
            )}
          </div>  
        </div>

        {/* Expert Info */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-1">
            {expert?.display_name || 'Expert'}
          </h3>
          {expert?.primary_specialization && (
            <p className="text-sm text-gray-600">{expert.primary_specialization}</p>
          )}
        </div>

        {/* Date/Time */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {dateTime}
          </p>
        </div>

        {/* Amount */}
        {amount > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              ₹{amount.toLocaleString()}
            </p>
          </div>
        )}

        {/* Join Button */}
        {isJoinEnabled && (
          <button className="w-full py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            Join Session
          </button>
        )}

        {/* Action Buttons - Engagement-based */}
        <div className="flex gap-3">
          {type === 'active' && (
            <>
              {isAppointment && 'meeting_mode' in booking && (
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Video className="w-4 h-4" />
                  Join Video Call
                </button>
              )}
              {isAppointment && 'meeting_mode' in booking && booking.meeting_mode === 'audio' && (
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  <Phone className="w-4 h-4" />
                  Join Audio Call
                </button>
              )}
              {!isAppointment && 'session_mode' in booking && (
                <>
                  {booking.session_mode === 'chat' && (
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Resume Chat
                    </button>
                  )}
                  {booking.session_mode === 'call' && (
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      <Phone className="w-4 h-4" />
                      Resume Call
                    </button>
                  )}
                  {booking.session_mode === 'video' && (
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                      <Video className="w-4 h-4" />
                      Resume Video
                    </button>
                  )}
                </>
              )}
            </>
          )}
          {type === 'upcoming' && (
            <button 
              onClick={() => router.push(`/dashboard/history`)}
              className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Details
            </button>
          )}
          {type === 'past' && (
            <>
              <button 
                onClick={() => router.push('/astrology')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Book Again
              </button>
              <button 
                onClick={() => router.push(`/dashboard/history`)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <History className="w-4 h-4" />
                View History
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Empty state component
  const EmptyState = ({ type, hasData }: { type: 'active' | 'upcoming' | 'past', hasData: boolean }) => {
    const emptyStateConfig = {
      active: {
        icon: <MessageCircle className="w-12 h-12 text-gray-300" />,
        title: "✨ No active sessions yet",
        description: "Start a consultation with an expert",
        cta: "Browse Experts",
        ctaAction: () => router.push('/astrology')
      },
      upcoming: {
        icon: <Calendar className="w-12 h-12 text-gray-300" />,
        title: "📅 No upcoming sessions",
        description: "Book your next wellness session",
        cta: "Book Session",
        ctaAction: () => router.push('/astrology')
      },
      past: {
        icon: <History className="w-12 h-12 text-gray-300" />,
        title: "📚 No past sessions",
        description: "Your session history will appear here",
        cta: "Book First Session",
        ctaAction: () => router.push('/astrology')
      }
    }

    const config = emptyStateConfig[type]

    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-4">
          {config.icon}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{config.title}</h3>
        <p className="text-gray-600 mb-6">{config.description}</p>
        <button
          onClick={config.ctaAction}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium"
        >
          {config.cta}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  // Handle case where profile is null but user exists
  if (!profile) {
    console.log('=== DEBUG: Profile is null, showing fallback dashboard ===')
    return (
      <div className="min-h-screen bg-gray-50 pt-20 lg:pt-24">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.email?.split('@')[0]}!
            </h1>
            <p className="text-gray-600">
              Manage your wellness journey and bookings
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          {/* Premium Wallet Card */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-6 shadow-lg text-white h-[120px]">
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-yellow-100 text-sm mb-1">Wallet Balance</p>
                <p className="text-3xl font-bold">${walletBalance.toFixed(2)}</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Funds
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                  <History className="w-4 h-4" />
                  View Transactions
                </button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <MessageCircle className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">✨ Welcome to Your Wellness Journey!</h3>
            <p className="text-gray-600 mb-6">Start by browsing our expert astrologers and booking your first consultation</p>
            <button
              onClick={() => router.push('/astrology')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              Browse Experts
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] pt-20 lg:pt-24">
      {/* Premium Header with Glassmorphism */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {profile?.full_name || user.email?.split('@')[0]}!
              </h1>
              <p className="text-white/70">
                Manage your wellness journey and bookings
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <span className="text-2xl">✨</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-8">
        {/* Premium Wallet Card */}
        <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-3xl p-8 shadow-2xl shadow-yellow-500/30 text-white relative overflow-hidden">
          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_60%)]"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium mb-2 uppercase tracking-wider">Wallet Balance</p>
                <p className="text-4xl font-bold mb-1">${walletBalance.toFixed(2)}</p>
                <p className="text-yellow-100 text-sm">Available for consultations</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 font-medium">
                  <Plus className="w-5 h-5" />
                  Add Funds
                </button>
                <button 
                  onClick={() => router.push('/dashboard/history')}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-200 font-medium"
                >
                  <History className="w-5 h-5" />
                  History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/astrology" className="group">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl shadow-black/40 p-6 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                  <Star className="w-6 h-6 text-black" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-yellow-400 transition-colors" />
              </div>
              <h3 className="text-white font-semibold mb-2">Book Session</h3>
              <p className="text-white/60 text-sm">Connect with expert astrologers</p>
            </div>
          </Link>

          <Link href="/astrology/daily-horoscope" className="group">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl shadow-black/40 p-6 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-yellow-400 transition-colors" />
              </div>
              <h3 className="text-white font-semibold mb-2">Daily Horoscope</h3>
              <p className="text-white/60 text-sm">Your cosmic guidance today</p>
            </div>
          </Link>

          <Link href="/astrology/kundli" className="group">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl shadow-black/40 p-6 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-yellow-400 transition-colors" />
              </div>
              <h3 className="text-white font-semibold mb-2">Create Kundli</h3>
              <p className="text-white/60 text-sm">Generate your birth chart</p>
            </div>
          </Link>

          <Link href="/meditation" className="group">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl shadow-black/40 p-6 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-yellow-400 transition-colors" />
              </div>
              <h3 className="text-white font-semibold mb-2">Meditation</h3>
              <p className="text-white/60 text-sm">Find inner peace</p>
            </div>
          </Link>
        </div>

        {/* Additional Premium Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Reminders */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Upcoming Reminders</h2>
              <Bell className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Daily Horoscope</p>
                  <p className="text-white/60 text-sm">Available at 6:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-10 h-10 rounded-full bg-purple-400/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Weekly Astrology Update</p>
                  <p className="text-white/60 text-sm">Every Sunday morning</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Wellness Tips</h2>
              <Lightbulb className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 rounded-xl border-l-4 border-yellow-400">
                <p className="text-white/90 text-sm leading-relaxed">
                  Start your day with positive affirmations to set the right tone for cosmic alignment.
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-xl border-l-4 border-purple-400">
                <p className="text-white/90 text-sm leading-relaxed">
                  Meditation during Mercury retrograde can help maintain mental clarity.
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-xl border-l-4 border-green-400">
                <p className="text-white/90 text-sm leading-relaxed">
                  Regular yoga practice enhances the positive effects of planetary alignments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
