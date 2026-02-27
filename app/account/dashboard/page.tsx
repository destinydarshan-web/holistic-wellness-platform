'use client'

import { useState, useEffect } from 'react'
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

export default function UserDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<EngagementData | null>(null)
  const [selectedService, setSelectedService] = useState<string>('all')
  
  const services = ['all', 'astrology', 'counselling', 'yoga', 'meditation'] as const

  // Parallel data fetching
  useEffect(() => {
    if (!user?.id) return

    const fetchData = async () => {
      try {
        setLoading(true)
        
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
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  // Filter bookings by service
  const filterBookings = (bookings: Booking[]) => {
    if (selectedService === 'all') return bookings
    return bookings.filter(b => b.service_category === selectedService)
  }

  // Engagement-based rendering components
  const EngagementCard = ({ booking, type }: { booking: Booking; type: 'active' | 'upcoming' | 'past' }) => {
    const expert = data?.experts[booking.expert_id]
    const isJoinEnabled = type === 'upcoming' && 
      new Date(booking.scheduled_at).getTime() - new Date().getTime() <= 10 * 60 * 1000 // 10 minutes before

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        {/* Service Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
            ${booking.service_category === 'astrology' ? 'bg-purple-100 text-purple-700' : ''}
            ${booking.service_category === 'counselling' ? 'bg-blue-100 text-blue-700' : ''}
            ${booking.service_category === 'yoga' ? 'bg-green-100 text-green-700' : ''}
            ${booking.service_category === 'meditation' ? 'bg-indigo-100 text-indigo-700' : ''}
          `}>
            {booking.service_category}
          </span>
          <span className="text-xs text-gray-500 capitalize">
            {booking.engagement_type.replace('_', ' ')}
          </span>
        </div>

        {/* Expert/Event Info */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-1">
            {expert?.display_name || 'Expert'}
          </h3>
          {expert?.primary_specialization && (
            <p className="text-sm text-gray-600">{expert.primary_specialization}</p>
          )}
        </div>

        {/* Time Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Calendar className="w-4 h-4" />
          <span>{new Date(booking.scheduled_at).toLocaleDateString()}</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>{new Date(booking.scheduled_at).toLocaleTimeString()}</span>
        </div>

        {/* Action Buttons - Engagement-based */}
        <div className="flex gap-2">
          {type === 'active' && (
            <>
              {booking.engagement_type === 'one_to_one' && (
                <>
                  {booking.session_mode === 'chat' && (
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      <MessageCircle className="w-4 h-4" />
                      Resume Chat
                    </button>
                  )}
                  {booking.session_mode === 'call' && (
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                      <Phone className="w-4 h-4" />
                      Join Call
                    </button>
                  )}
                  {booking.session_mode === 'video' && (
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                      <Video className="w-4 h-4" />
                      Join Video
                    </button>
                  )}
                </>
              )}
              {booking.engagement_type === 'group' && (
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
                  <Users className="w-4 h-4" />
                  Join Live Class
                </button>
              )}
            </>
          )}

          {type === 'upcoming' && (
            <>
              {isJoinEnabled && (
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  <ChevronRight className="w-4 h-4" />
                  Join Now
                </button>
              )}
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
            </>
          )}

          {type === 'past' && (
            <>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600">
                <Calendar className="w-4 h-4" />
                Rebook
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Star className="w-4 h-4" />
                Rate
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Wallet Section */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Wallet Balance</p>
              <p className="text-3xl font-bold">${data.balance.toFixed(2)}</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">
                <Plus className="w-4 h-4" />
                Add Funds
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">
                <History className="w-4 h-4" />
                View Transactions
              </button>
            </div>
          </div>
        </div>

        {/* Service Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {services.map(service => (
            <button
              key={service}
              onClick={() => setSelectedService(service)}
              className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap
                ${selectedService === service 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {service}
            </button>
          ))}
        </div>

        {/* Active Engagements */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Active Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterBookings(data.active).map(booking => (
              <EngagementCard key={booking.id} booking={booking} type="active" />
            ))}
          </div>
          {filterBookings(data.active).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No active sessions</p>
            </div>
          )}
        </div>

        {/* Upcoming Engagements */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Upcoming Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterBookings(data.upcoming).map(booking => (
              <EngagementCard key={booking.id} booking={booking} type="upcoming" />
            ))}
          </div>
          {filterBookings(data.upcoming).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No upcoming sessions</p>
            </div>
          )}
        </div>

        {/* Past Engagements */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            Past Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterBookings(data.past).slice(0, 6).map(booking => (
              <EngagementCard key={booking.id} booking={booking} type="past" />
            ))}
          </div>
          {filterBookings(data.past).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No past sessions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
