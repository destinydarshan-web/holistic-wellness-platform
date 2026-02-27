'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Database } from '@/lib/supabaseClient'
import { supabase as supabaseClient } from '@/lib/supabaseClient'
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
  ChevronRight,
  Sparkles,
  ArrowRight
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
  
  const services = ['all', 'astrology', 'counselling', 'yoga', 'meditation'] as const

  // Debug: Log current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data, error } = await supabaseClient.auth.getUser()

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

      const { data, error } = await supabase
        .from("user_wallet")
        .select("*")
        .eq("user_id", userId)

      console.log("🔍 Wallet raw response:", data)
      console.log("🔍 Wallet error:", error)

      if (data && data.length > 0) {
        console.log("✅ Wallet balance found:", data[0].balance)
        setWalletBalance(data[0].balance)
      } else {
        console.log("❌ No wallet data found")
        setWalletBalance(0)
      }
    }

    fetchWallet()
  }, [])

  useEffect(() => {
    if (loading) {
      return
    }

    if (!user) {
      router.push('/login')
      return
    }

    if (profile && profile.role !== 'user') {
      // Redirect to appropriate dashboard
      switch (profile.role) {
        case 'admin':
          router.push('/admin-dashboard')
          break
        case 'expert':
          router.push(profile.status === 'approved' ? '/expert-dashboard' : '/account-under-review')
          break
      }
      return
    }

    loadDashboardData()
  }, [loading, user, profile, router])

  const loadDashboardData = async () => {
    if (!user?.id) return
    
    try {
      setDashboardLoading(true)
      
      // Fetch all data in parallel
      const [bookingsResponse, transactionsResponse, expertsResponse] = await Promise.all([
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

      const bookings = bookingsResponse.data || []
      const transactions = transactionsResponse.data || []
      const experts = (expertsResponse.data || []).reduce((acc, expert) => {
        acc[expert.user_id] = expert
        return acc
      }, {} as Record<string, Expert>)

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

  if (!user || !profile) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.full_name || user.email?.split('@')[0]}!
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

        {/* Next Session Highlight Card */}
        {nextSession && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    {getServiceIcon(nextSession.service_category)}
                  </div>
                  <div>
                    <span className="inline-block px-2 py-1 bg-white/20 rounded-full text-xs font-medium capitalize">
                      {nextSession.service_category}
                    </span>
                    <p className="text-sm text-white/80 mt-1">
                      {data.experts[nextSession.expert_id]?.display_name || 'Expert'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(nextSession.scheduled_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(nextSession.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Join
                </button>
                <button className="px-4 py-2.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {services.map(service => (
            <button
              key={service}
              onClick={() => setSelectedService(service)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap border transition-all
                ${selectedService === service 
                  ? 'bg-yellow-500 text-black border-yellow-500 shadow-sm' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              {service}
            </button>
          ))}
        </div>

        {/* Active Engagements */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Active Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data && filterBookings(data.active).map(booking => (
              <EngagementCard key={booking.id} booking={booking} type="active" />
            ))}
          </div>
          {data && filterBookings(data.active).length === 0 && (
            <EmptyState type="active" hasData={false} />
          )}
        </div>

        {/* Upcoming Engagements */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Upcoming Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data && filterBookings(data.upcoming).map(booking => (
              <EngagementCard key={booking.id} booking={booking} type="upcoming" />
            ))}
          </div>
          {data && filterBookings(data.upcoming).length === 0 && (
            <EmptyState type="upcoming" hasData={false} />
          )}
        </div>

        {/* Past Engagements */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            Past Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data && filterBookings(data.past).slice(0, 6).map(booking => (
              <EngagementCard key={booking.id} booking={booking} type="past" />
            ))}
          </div>
          {data && filterBookings(data.past).length === 0 && (
            <EmptyState type="past" hasData={false} />
          )}
        </div>
      </div>
    </div>
  )
}
