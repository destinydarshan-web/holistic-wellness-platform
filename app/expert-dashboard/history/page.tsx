'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Calendar, Clock, DollarSign, Users, MessageCircle, Video, Phone, Star, Filter, Search, X, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface Session {
  id: string
  user_id: string
  expert_id: string
  service_category: string
  session_type: string
  status: string
  created_at: string
  started_at?: string
  ended_at?: string
  price_per_minute?: number
  user_name?: string
  user_email?: string
  duration_minutes?: number
  total_cost?: number
}

interface Booking {
  id: string
  user_id: string
  expert_id: string
  service_category: string
  appointment_date: string
  appointment_time: string
  status: string
  amount_paid: number
  hourly_rate: number
  created_at: string
  user_name?: string
  user_email?: string
}

export default function ExpertHistory() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [activeTab, setActiveTab] = useState<'sessions' | 'bookings'>('sessions')

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (!profile || (profile.role !== 'expert' && profile.role !== 'astrologer' && profile.role !== 'counsellor')) {
        router.push('/dashboard')
        return
      }

      loadHistoryData()
    }
  }, [user, profile, loading, router])

  const loadHistoryData = async () => {
    setLoadingData(true)
    try {
      
      
      // Load sessions and bookings in parallel
      const [sessionsResponse, bookingsResponse] = await Promise.allSettled([
        supabase
          .from('live_sessions')
          .select('*')
          .eq('expert_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('appointments')
          .select('*')
          .eq('expert_id', user?.id)
          .order('created_at', { ascending: false })
      ])

      let sessionsData: Session[] = []
      let bookingsData: Booking[] = []

      // Process sessions
      if (sessionsResponse.status === 'fulfilled') {
        sessionsData = sessionsResponse.value.data || []
        
        
        // Enrich sessions with user data
        sessionsData = await Promise.all(sessionsData.map(async (session) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', session.user_id)
            .maybeSingle()
          
          return {
            ...session,
            user_name: userData?.full_name || 'Unknown User',
            user_email: userData?.email || 'unknown@example.com',
            duration_minutes: session.started_at && session.ended_at 
              ? Math.ceil((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000)
              : 0,
            total_cost: session.started_at && session.ended_at && session.price_per_minute
              ? Math.ceil((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000) * session.price_per_minute
              : 0
          }
        }))
      } else {
        
      }

      // Process bookings
      if (bookingsResponse.status === 'fulfilled') {
        bookingsData = bookingsResponse.value.data || []
        
        
        // Enrich bookings with user data
        bookingsData = await Promise.all(bookingsData.map(async (booking) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', booking.user_id)
            .maybeSingle()
          
          return {
            ...booking,
            user_name: userData?.full_name || 'Unknown User',
            user_email: userData?.email || 'unknown@example.com'
          }
        }))
      } else {
        
      }

      setSessions(sessionsData)
      setBookings(bookingsData)
      
    } catch (error) {
      
    } finally {
      setLoadingData(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'active':
        return <AlertCircle className="w-4 h-4 text-blue-400" />
      case 'cancelled':
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'active':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'cancelled':
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'accepted':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageCircle className="w-4 h-4" />
      case 'video':
        return <Video className="w-4 h-4" />
      case 'voice':
        return <Phone className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = searchTerm === '' || 
      session.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.service_category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter
    const matchesType = typeFilter === 'all' || session.session_type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === '' || 
      booking.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service_category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F14]">
        <div className="text-white">Loading history...</div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect
  }

  return (
    <div className="pt-24 py-8 bg-[#0F0F14] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/expert-dashboard"
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Session History</h1>
              <p className="text-white/60">View your past sessions and appointments</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by client name, email, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fdce20] focus:ring-2 focus:ring-[#fdce20]/20"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#fdce20] focus:ring-2 focus:ring-[#fdce20]/20"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>

            {/* Type Filter (for sessions) */}
            {activeTab === 'sessions' && (
              <div className="lg:w-48">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#fdce20] focus:ring-2 focus:ring-[#fdce20]/20"
                >
                  <option value="all">All Types</option>
                  <option value="chat">Chat</option>
                  <option value="video">Video</option>
                  <option value="voice">Voice</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10 mb-8">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'sessions'
                  ? 'text-[#fdce20] border-b-2 border-[#fdce20]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Live Sessions ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'bookings'
                  ? 'text-[#fdce20] border-b-2 border-[#fdce20]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Appointments ({bookings.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10">
          {activeTab === 'sessions' ? (
            <div className="p-6">
              {filteredSessions.length > 0 ? (
                <div className="space-y-4">
                  {filteredSessions.map((session) => (
                    <div key={session.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getSessionTypeIcon(session.session_type)}
                            <h3 className="font-semibold text-white">
                              {session.user_name} - {session.service_category}
                            </h3>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(session.status)}`}>
                              {getStatusIcon(session.status)}
                              <span className="capitalize">{session.status}</span>
                            </div>
                          </div>
                          <p className="text-white/60 text-sm mb-3">{session.user_email}</p>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-white/40 mb-1">Session ID</p>
                              <p className="text-white font-mono text-xs">{session.id}</p>
                            </div>
                            <div>
                              <p className="text-white/40 mb-1">Created</p>
                              <p className="text-white">{new Date(session.created_at).toLocaleDateString()}</p>
                            </div>
                            {session.started_at && (
                              <div>
                                <p className="text-white/40 mb-1">Started</p>
                                <p className="text-white">{new Date(session.started_at).toLocaleString()}</p>
                              </div>
                            )}
                            {session.ended_at && (
                              <div>
                                <p className="text-white/40 mb-1">Ended</p>
                                <p className="text-white">{new Date(session.ended_at).toLocaleString()}</p>
                              </div>
                            )}
                          </div>

                          {session.duration_minutes && session.duration_minutes > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#fdce20]" />
                                    <span className="text-white">{session.duration_minutes} minutes</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400">₹{session.total_cost}</span>
                                  </div>
                                </div>
                                {session.status === 'completed' && (
                                  <Link
                                    href={`/session/chat/${session.id}`}
                                    className="px-4 py-2 bg-[#fdce20] text-black rounded-lg hover:bg-amber-400 transition-colors text-sm font-medium"
                                  >
                                    View Chat
                                  </Link>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 text-lg mb-2">No sessions found</p>
                  <p className="text-white/40">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                      ? 'Try adjusting your filters' 
                      : 'Your session history will appear here'
                    }
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              {filteredBookings.length > 0 ? (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <div key={booking.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-4 h-4 text-[#fdce20]" />
                            <h3 className="font-semibold text-white">
                              {booking.user_name} - {booking.service_category}
                            </h3>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              <span className="capitalize">{booking.status}</span>
                            </div>
                          </div>
                          <p className="text-white/60 text-sm mb-3">{booking.user_email}</p>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-white/40 mb-1">Appointment ID</p>
                              <p className="text-white font-mono text-xs">{booking.id}</p>
                            </div>
                            <div>
                              <p className="text-white/40 mb-1">Date</p>
                              <p className="text-white">{new Date(booking.appointment_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-white/40 mb-1">Time</p>
                              <p className="text-white">{booking.appointment_time}</p>
                            </div>
                            <div>
                              <p className="text-white/40 mb-1">Booked</p>
                              <p className="text-white">{new Date(booking.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400">₹{booking.amount_paid}</span>
                                </div>
                                <div className="text-white/60 text-sm">
                                  ₹{booking.hourly_rate}/hour
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60 text-lg mb-2">No appointments found</p>
                  <p className="text-white/40">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your filters' 
                      : 'Your appointment history will appear here'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
