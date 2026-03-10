'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Calendar, Clock, User, Star, MessageCircle, Users, Sparkles, TrendingUp, DollarSign, Search, Filter, Download, ChevronRight, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import HistoryDetailModal from './components/HistoryDetailModal'

interface HistoryItem {
  id: string
  type: 'session' | 'booking' | 'transaction'
  title: string
  description: string
  date: string
  amount?: number
  status: 'completed' | 'upcoming' | 'cancelled' | 'pending'
  expert?: {
    name: string
    specialization: string
    avatar?: string
  }
  service?: {
    category: string
    mode: string
    duration?: number
  }
  metadata?: {
    rating?: number
    review?: string
    price?: number
    transaction_id?: string
    payment_type?: string
  }
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'session' | 'booking'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'upcoming' | 'cancelled'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'rating'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id

      if (!userId) {
        router.push('/login')
        return
      }

      // Fetch all user data
      const [bookingsRes, sessionsRes, transactionsRes, expertsRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('live_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('expert_astrologers')
          .select('*')
      ])

      const experts = expertsRes.data?.reduce((acc: Record<string, any>, expert: any) => {
        acc[expert.id] = expert
        return acc
      }, {} as Record<string, any>) || {}

      // Transform data into history items
      const historyItems: HistoryItem[] = []

      // Process sessions and combine with transactions
      sessionsRes.data?.forEach((session: any) => {
        const expert = experts[session.expert_id]
        
        // Find corresponding transaction for this session
        const sessionTransaction = transactionsRes.data?.find(t => 
          t.description && t.description.includes(session.id)
        )
        
        historyItems.push({
          id: session.id,
          type: 'session',
          title: `Session with ${expert?.display_name || 'Expert'}`,
          description: `${session.session_type} consultation - ${session.status}`,
          date: session.created_at,
          amount: sessionTransaction?.amount, // Include payment amount
          status: session.status as any,
          expert: {
            name: expert?.display_name || 'Expert',
            specialization: expert?.primary_specialization || 'Astrology',
            avatar: expert?.avatar_url
          },
          service: {
            category: session.service_category,
            mode: session.session_type
          },
          metadata: {
            price: sessionTransaction?.amount,
            transaction_id: sessionTransaction?.id,
            payment_type: sessionTransaction?.type
          }
        })
      })

      // Process bookings (only if they don't have corresponding sessions)
      bookingsRes.data?.forEach((booking: any) => {
        // Skip if this booking already has a session
        const hasSession = sessionsRes.data?.some(s => s.id === booking.id)
        if (hasSession) return
        
        const expert = experts[booking.expert_id]
        
        // Find corresponding transaction for this booking
        const bookingTransaction = transactionsRes.data?.find(t => 
          t.description && t.description.includes(booking.id)
        )
        
        historyItems.push({
          id: booking.id,
          type: 'booking',
          title: `Booking with ${expert?.display_name || 'Expert'}`,
          description: `${booking.service_category} consultation - ${booking.session_mode}`,
          date: booking.created_at,
          amount: bookingTransaction?.amount, // Include payment amount
          status: booking.status as any,
          expert: {
            name: expert?.display_name || 'Expert',
            specialization: expert?.primary_specialization || 'Astrology',
            avatar: expert?.avatar_url
          },
          service: {
            category: booking.service_category,
            mode: booking.session_mode,
            duration: booking.duration
          },
          metadata: {
            price: booking.price_per_minute,
            transaction_id: bookingTransaction?.id,
            payment_type: bookingTransaction?.type
          }
        })
      })

      // Process standalone transactions (those not linked to sessions/bookings)
      const linkedTransactionIds = new Set([
        ...historyItems.map(item => item.metadata?.transaction_id).filter(Boolean)
      ])
      
      transactionsRes.data?.forEach((transaction: any) => {
        if (!linkedTransactionIds.has(transaction.id)) {
          historyItems.push({
            id: transaction.id,
            type: 'transaction',
            title: transaction.type === 'debit' ? 'Payment' : 'Credit',
            description: transaction.description,
            date: transaction.created_at,
            amount: transaction.amount,
            status: 'completed',
            metadata: {
              price: transaction.amount
            }
          })
        }
      })

      setHistory(historyItems)
    } catch (error) {
      
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = history
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.expert?.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = filterType === 'all' || item.type === filterType
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'amount':
          comparison = (a.amount || 0) - (b.amount || 0)
          break
        case 'rating':
          comparison = (a.metadata?.rating || 0) - (b.metadata?.rating || 0)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'astrology': return <Star className="w-4 h-4" />
      case 'counselling': return <MessageCircle className="w-4 h-4" />
      case 'yoga': return <Users className="w-4 h-4" />
      case 'meditation': return <Sparkles className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'session': return <MessageCircle className="w-4 h-4" />
      case 'booking': return <Calendar className="w-4 h-4" />
      case 'transaction': return <DollarSign className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const handleViewDetails = (item: HistoryItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Type', 'Title', 'Description', 'Amount', 'Status'],
      ...filteredHistory.map(item => [
        new Date(item.date).toLocaleDateString(),
        item.type,
        item.title,
        item.description,
        item.amount || 'N/A',
        item.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg">Loading your wellness journey...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header with proper spacing */}
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Your History</h1>
                <p className="text-gray-400">Complete overview of your consultations and transactions</p>
              </div>
            </div>
            <button
              onClick={exportHistory}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all duration-200 shadow-lg"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Premium Filter Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white backdrop-blur-sm"
            >
              <option value="all" className="bg-[#0f172a]">All Types</option>
              <option value="session" className="bg-[#0f172a]">Sessions</option>
              <option value="booking" className="bg-[#0f172a]">Bookings</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white backdrop-blur-sm"
            >
              <option value="all" className="bg-[#0f172a]">All Status</option>
              <option value="completed" className="bg-[#0f172a]">Completed</option>
              <option value="upcoming" className="bg-[#0f172a]">Upcoming</option>
              <option value="cancelled" className="bg-[#0f172a]">Cancelled</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-')
                setSortBy(sort as any)
                setSortOrder(order as any)
              }}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white backdrop-blur-sm"
            >
              <option value="date-desc" className="bg-[#0f172a]">Newest First</option>
              <option value="date-asc" className="bg-[#0f172a]">Oldest First</option>
              <option value="amount-desc" className="bg-[#0f172a]">Highest Amount</option>
              <option value="amount-asc" className="bg-[#0f172a]">Lowest Amount</option>
              <option value="rating-desc" className="bg-[#0f172a]">Highest Rating</option>
            </select>
          </div>
        </div>

        {/* History Items */}
        <div className="space-y-6">
          {filteredHistory.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-16 text-center border border-white/10">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No history found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
                  : 'You haven\'t had any sessions, bookings, or transactions yet. Start your wellness journey today!'}
              </p>
              {(!searchTerm && filterType === 'all' && filterStatus === 'all') && (
                <button
                  onClick={() => router.push('/')}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all duration-200 shadow-lg"
                >
                  Browse Services
                </button>
              )}
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl hover:bg-white/10 transition-all duration-300 p-6 border border-white/10 shadow-xl hover:shadow-yellow-400/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      item.type === 'session' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' :
                      item.type === 'booking' ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' :
                      'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
                    } shadow-lg`}>
                      {getTypeIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-white text-lg">{item.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          item.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          item.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 mb-3">{item.description}</p>
                      
                      {/* Expert Info */}
                      {item.expert && (
                        <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                          <User className="w-4 h-4" />
                          <span>{item.expert.name} • {item.expert.specialization}</span>
                        </div>
                      )}

                      {/* Service Info */}
                      {item.service && (
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              item.service.category === 'astrology' ? 'bg-purple-500/20 text-purple-400' :
                              item.service.category === 'counselling' ? 'bg-blue-500/20 text-blue-400' :
                              item.service.category === 'yoga' ? 'bg-green-500/20 text-green-400' :
                              'bg-indigo-500/20 text-indigo-400'
                            }`}>
                              {getServiceIcon(item.service.category)}
                            </div>
                            <span className="capitalize">{item.service.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            <span className="capitalize">{item.service.mode}</span>
                          </div>
                          {item.service.duration && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{item.service.duration} min</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Rating */}
                      {item.metadata?.rating && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{item.metadata.rating}/5</span>
                        </div>
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount & Payment Info */}
                  {item.amount !== undefined && (
                    <div className="flex flex-col items-end">
                      <div className={`font-bold text-lg ${
                        item.metadata?.payment_type === 'debit' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {item.metadata?.payment_type === 'debit' ? '-' : '+'}₹{item.amount}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.metadata?.payment_type === 'debit' ? 'Paid' : 'Received'}
                      </div>
                      {item.metadata?.price && (
                        <div className="text-xs text-gray-500">
                          ₹{item.metadata.price}/min
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => handleViewDetails(item)}
                    className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Premium Summary Stats */}
        <div className="mt-12 bg-gradient-to-r from-yellow-400/10 to-amber-500/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl">
          <h3 className="text-xl font-semibold text-white mb-6">Your Wellness Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {filteredHistory.filter(item => item.type === 'session').length}
              </div>
              <div className="text-sm text-gray-300">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {filteredHistory.filter(item => item.metadata?.payment_type === 'credit').reduce((sum, item) => sum + (item.amount || 0), 0)}
              </div>
              <div className="text-sm text-gray-300">Total Credits</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {filteredHistory.filter(item => item.metadata?.payment_type === 'debit').reduce((sum, item) => sum + (item.amount || 0), 0)}
              </div>
              <div className="text-sm text-gray-300">Total Payments</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {filteredHistory.filter(item => item.metadata?.rating).reduce((sum, item) => sum + (item.metadata?.rating || 0), 0) / filteredHistory.filter(item => item.metadata?.rating).length || 0}
              </div>
              <div className="text-sm text-gray-300">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* History Detail Modal */}
      <HistoryDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        historyItem={selectedItem}
      />
    </div>
  )
}
