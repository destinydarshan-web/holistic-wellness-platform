'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { DollarSign, ArrowLeft, TrendingUp, TrendingDown, Calendar, Filter, Download, RefreshCw, CreditCard, Users, Activity, Search } from 'lucide-react'

interface Transaction {
  id: string
  user_id: string
  expert_id: string
  amount: number
  type: 'deposit' | 'booking_payment' | 'refund' | 'withdrawal' | 'commission'
  status: 'completed' | 'pending' | 'failed'
  created_at: string
  description?: string
  user_email?: string
  expert_name?: string
}

interface RevenueStats {
  totalRevenue: number
  totalBookings: number
  totalDeposits: number
  totalRefunds: number
  totalCommission: number
  monthlyRevenue: number
  weeklyRevenue: number
  dailyRevenue: number
}

export default function AdminRevenuePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    totalBookings: 0,
    totalDeposits: 0,
    totalRefunds: 0,
    totalCommission: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    dailyRevenue: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!user || !profile || profile.role !== 'admin') {
        router.push('/dashboard')
        return
      }
      loadRevenueData()
    }
  }, [user, profile, loading, router])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, typeFilter, statusFilter, dateFilter])

  const loadRevenueData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })

      if (transactionsError) {
        throw transactionsError
      }

      if (!transactionsData || transactionsData.length === 0) {
        setTransactions([])
        calculateStats([])
        return
      }

      // Get user and expert details for each transaction
      const transactionsWithDetails = await Promise.all(
        (transactionsData || []).map(async (transaction) => {
          // Get user email
          const { data: userData } = await supabase.auth.admin.getUserById(transaction.user_id)
          
          // Get expert name
          let expertName = 'Unknown Expert'
          if (transaction.expert_id) {
            const { data: expertData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', transaction.expert_id)
              .single()
            expertName = expertData?.full_name || 'Unknown Expert'
          }

          return {
            ...transaction,
            user_email: userData?.user?.email,
            expert_name: expertName
          }
        })
      )

      setTransactions(transactionsWithDetails)
      calculateStats(transactionsWithDetails)
    } catch (error) {
      console.error('Error loading revenue data:', error)
      setError('Failed to load revenue data')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (transactionsData: Transaction[]) => {
    const now = new Date()
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Filter completed transactions for revenue calculation
    const completedTransactions = transactionsData.filter(t => t.status === 'completed')
    const revenueTransactions = completedTransactions.filter(t => t.type === 'booking_payment' || t.type === 'deposit')

    const stats = {
      totalRevenue: revenueTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
      totalBookings: transactionsData.filter(t => t.type === 'booking_payment').length,
      totalDeposits: transactionsData.filter(t => t.type === 'deposit').length,
      totalRefunds: transactionsData.filter(t => t.type === 'refund').length,
      totalCommission: transactionsData.filter(t => t.type === 'commission').length,
      monthlyRevenue: completedTransactions
        .filter(t => new Date(t.created_at) >= oneMonthAgo && (t.type === 'booking_payment' || t.type === 'deposit'))
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      weeklyRevenue: completedTransactions
        .filter(t => new Date(t.created_at) >= oneWeekAgo && (t.type === 'booking_payment' || t.type === 'deposit'))
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      dailyRevenue: completedTransactions
        .filter(t => new Date(t.created_at) >= oneDayAgo && (t.type === 'booking_payment' || t.type === 'deposit'))
        .reduce((sum, t) => sum + (t.amount || 0), 0)
    }

    setStats(stats)
  }

  const filterTransactions = () => {
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.expert_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      let filterDate = new Date()

      switch (dateFilter) {
        case 'today':
          filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          filterDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          break
        case 'year':
          filterDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          break
      }

      filtered = filtered.filter(t => new Date(t.created_at) >= filterDate)
    }

    setFilteredTransactions(filtered)
  }

  const getTypeColor = (type: string) => {
    const colors = {
      'deposit': 'text-green-400 bg-green-500/20',
      'booking_payment': 'text-blue-400 bg-blue-500/20',
      'refund': 'text-red-400 bg-red-500/20',
      'withdrawal': 'text-orange-400 bg-orange-500/20',
      'commission': 'text-purple-400 bg-purple-500/20'
    }
    return colors[type as keyof typeof colors] || 'text-gray-400 bg-gray-500/20'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'completed': 'text-green-400 bg-green-500/20',
      'pending': 'text-yellow-400 bg-yellow-500/20',
      'failed': 'text-red-400 bg-red-500/20'
    }
    return colors[status as keyof typeof colors] || 'text-gray-400 bg-gray-500/20'
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      'deposit': 'Deposit',
      'booking_payment': 'Booking Payment',
      'refund': 'Refund',
      'withdrawal': 'Withdrawal',
      'commission': 'Commission'
    }
    return labels[type as keyof typeof labels] || type
  }

  const exportData = () => {
    const csvContent = [
      ['Date', 'Type', 'Status', 'Amount', 'User Email', 'Expert Name', 'Description'],
      ...filteredTransactions.map(t => [
        new Date(t.created_at).toLocaleDateString(),
        getTypeLabel(t.type),
        t.status,
        `₹${t.amount}`,
        t.user_email || 'N/A',
        t.expert_name || 'N/A',
        t.description || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F14]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="pt-24 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Revenue Management</h1>
          <p className="text-white/60">Track and analyze platform revenue and transactions</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">
                ₹{stats.totalRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-white/60">Total Revenue</p>
          </div>
          <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">
                {stats.totalBookings}
              </span>
            </div>
            <p className="text-white/60">Total Bookings</p>
          </div>
          <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">
                ₹{stats.monthlyRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-white/60">Monthly Revenue</p>
          </div>
          <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">
                ₹{stats.dailyRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-white/60">Daily Revenue</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#fbcc1e]"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="booking_payment">Booking Payments</option>
              <option value="refund">Refunds</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="commission">Commissions</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#fbcc1e]"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#fbcc1e]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
            <div className="flex items-center gap-2">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-[#fbcc1e] text-black font-medium rounded-lg hover:bg-[#fbcc1e]/80 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <div className="text-white/60 text-sm">
                {filteredTransactions.length} transactions
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Transactions ({filteredTransactions.length})</h2>
          </div>
          <div className="divide-y divide-white/10">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="text-white/60">Loading transactions...</div>
              </div>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fbcc1e] to-[#e6b800] flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(transaction.type)}`}>
                              {getTypeLabel(transaction.type)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>
                          <p className="text-white text-lg font-semibold">
                            {transaction.type === 'refund' || transaction.type === 'withdrawal' ? '-' : '+'}
                            ₹{transaction.amount}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/60">
                        <div>
                          <p className="text-white/40 text-xs mb-1">User</p>
                          <p>{transaction.user_email || 'Unknown User'}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs mb-1">Expert</p>
                          <p>{transaction.expert_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs mb-1">Date</p>
                          <p>{new Date(transaction.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {transaction.description && (
                        <div className="mt-2">
                          <p className="text-white/40 text-xs mb-1">Description</p>
                          <p className="text-white/60 text-sm">{transaction.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <DollarSign className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No transactions found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
