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
type Transaction = Database['public']['Tables']['transactions']['Row']
type Expert = Database['public']['Tables']['expert_astrologers']['Row']

interface EngagementData {
  active: Booking[]
  upcoming: Booking[]
  past: Booking[]
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

    // Handle role-based redirects
    if (profile && profile.role !== 'user') {
      console.log('=== DEBUG: Non-user role, redirecting:', profile.role)
      // Redirect to appropriate dashboard
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
    if (!profile || profile.role === 'user') {
      console.log('=== DEBUG: User authenticated, loading dashboard data')
      console.log('User ID:', user.id)
      console.log('Profile:', profile)
      
      loadDashboardData()
    }
  }, [loading, user, profile, router])

  // Fallback: Load data when component mounts if auth is ready
  useEffect(() => {
    if (!loading && user && (!profile || profile.role === 'user') && !data) {
      console.log('=== DEBUG: Fallback - Auth ready but no data, loading dashboard data')
      loadDashboardData()
    }
  }, [loading, user, profile, data])

  const loadDashboardData = async () => {
    if (!user?.id) return
    
    try {
      setDashboardLoading(true)
      
      console.log('=== DEBUG: Loading Dashboard Data ===')
      console.log('User ID:', user.id)
      
      // Fetch all data in parallel with error handling
      const [bookingsResponse, transactionsResponse, expertsResponse] = await Promise.allSettled([
        supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('scheduled_at', { ascending: false }),
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

      // Categorize engagements
      const now = new Date()
      const active = bookings.filter(b => b.status === 'active')
      const upcoming = bookings.filter(
        b => b.status === 'upcoming' && new Date(b.scheduled_at) > now
      )
      const past = bookings.filter(b => b.status === 'completed')

      // Calculate wallet balance
      const balance = transactions.reduce((sum, t) => {
        return t.type === 'credit' ? sum + t.amount : sum - t.amount
      }, 0)

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
  const EngagementCard = ({ booking, type }: { booking: Booking; type: 'active' | 'upcoming' | 'past' }) => {
    const expert = data?.experts[booking.expert_id]
    const isJoinEnabled = type === 'upcoming' && 
      new Date(booking.scheduled_at).getTime() - new Date().getTime() <= 10 * 60 * 1000

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
        {/* Header with icons and badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center
              ${booking.service_category === 'astrology' ? 'bg-purple-100 text-purple-600' : ''}
              ${booking.service_category === 'counselling' ? 'bg-blue-100 text-blue-600' : ''}
              ${booking.service_category === 'yoga' ? 'bg-green-100 text-green-600' : ''}
              ${booking.service_category === 'meditation' ? 'bg-indigo-100 text-indigo-600' : ''}
            `}>
              {getServiceIcon(booking.service_category)}
            </div>
            <div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize mb-1
                ${booking.service_category === 'astrology' ? 'bg-purple-50 text-purple-700' : ''}
                ${booking.service_category === 'counselling' ? 'bg-blue-50 text-blue-700' : ''}
                ${booking.service_category === 'yoga' ? 'bg-green-50 text-green-700' : ''}
                ${booking.service_category === 'meditation' ? 'bg-indigo-50 text-indigo-700' : ''}
              `}>
                {booking.service_category}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 capitalize">
                  {booking.engagement_type.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 capitalize">
                  {booking.session_mode}
                </span>
              </div>
            </div>
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

        {/* Time Info */}
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(booking.scheduled_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Action Buttons - Engagement-based */}
        <div className="flex gap-3">
          {type === 'active' && (
            <>
              {booking.engagement_type === 'one_to_one' && (
                <>
                  {booking.session_mode === 'chat' && (
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Resume Chat
                    </button>
                  )}
                  {booking.session_mode === 'call' && (
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      <Phone className="w-4 h-4" />
                      Join Call
                    </button>
                  )}
                  {booking.session_mode === 'video' && (
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                      <Video className="w-4 h-4" />
                      Join Video
                    </button>
                  )}
                </>
              )}
              {booking.engagement_type === 'group' && (
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                  <Users className="w-4 h-4" />
                  Join Live Class
                </button>
              )}
            </>
          )}

          {type === 'upcoming' && (
            <>
              {isJoinEnabled && (
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                  Join Now
                </button>
              )}
              <button className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </>
          )}

          {type === 'past' && (
            <>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors">
                <Calendar className="w-4 h-4" />
                Rebook
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Star className="w-4 h-4" />
                Rate
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
                <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-200 font-medium">
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

        {/* Recent Activity Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            <button className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium">
              View All
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-white/10">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-3 font-medium transition-all duration-200 border-b-2 ${
                activeTab === 'active'
                  ? 'text-yellow-400 border-yellow-400'
                  : 'text-white/60 border-transparent hover:text-white hover:border-white/20'
              }`}
            >
              Active Sessions
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-3 font-medium transition-all duration-200 border-b-2 ${
                activeTab === 'upcoming'
                  ? 'text-yellow-400 border-yellow-400'
                  : 'text-white/60 border-transparent hover:text-white hover:border-white/20'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-3 font-medium transition-all duration-200 border-b-2 ${
                activeTab === 'past'
                  ? 'text-yellow-400 border-yellow-400'
                  : 'text-white/60 border-transparent hover:text-white hover:border-white/20'
              }`}
            >
              Past Sessions
            </button>
          </div>

          {/* Content Area */}
          <div className="min-h-[400px]">
            {dashboardLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              </div>
            ) : filteredEngagements.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-white/40" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">✨ No {activeTab} Sessions</h3>
                <p className="text-white/60 mb-8 max-w-md mx-auto">
                  {activeTab === 'active' 
                    ? "You don't have any active sessions right now. Start by browsing our expert astrologers."
                    : activeTab === 'upcoming'
                    ? "No upcoming sessions scheduled. Book a consultation to get started."
                    : "No past sessions yet. Your consultation history will appear here."
                  }
                </p>
                <button
                  onClick={() => router.push('/astrology')}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-full font-semibold shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  Browse Experts
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              /* Engagement Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEngagements.map((booking: any) => (
                  <EngagementCard key={booking.id} booking={booking} type={activeTab} />
                ))}
              </div>
            )}
          </div>
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
