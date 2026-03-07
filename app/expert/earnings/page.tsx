'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Calendar, DollarSign, TrendingUp, Download, Filter, ChevronDown, Clock, CheckCircle, AlertCircle, Users, Star } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface EarningRecord {
  id: string
  session_id: string
  date: string
  clientName: string
  type: 'chat' | 'call' | 'video'
  duration: number
  amount: number
  commission: number
  netEarning: number
  status: 'completed' | 'pending' | 'cancelled'
}

interface EarningsSummary {
  totalEarnings: number
  totalCommission: number
  netEarnings: number
  totalSessions: number
  averageEarning: number
  pendingAmount: number
  thisMonth: number
  lastMonth: number
  growth: number
}

export default function ExpertEarningsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [earningsLoading, setEarningsLoading] = useState(true)
  const [earnings, setEarnings] = useState<EarningRecord[]>([])
  const [summary, setSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    totalCommission: 0,
    netEarnings: 0,
    totalSessions: 0,
    averageEarning: 0,
    pendingAmount: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0
  })
  const [filter, setFilter] = useState({
    period: 'this-month',
    status: 'all'
  })

  // Role-based access control
  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('=== DEBUG: No user found, redirecting to login ===')
        router.push('/login')
        return
      }
      
      if (!profile) {
        console.log('=== DEBUG: No profile found, waiting for profile load ===')
        return
      }
      
      if (profile.role !== 'expert' && profile.role !== 'astrologer') {
        console.log('=== DEBUG: User not expert/astrologer, redirecting to dashboard ===')
        router.push('/dashboard')
        return
      }

      if (profile.status !== 'approved') {
        console.log('=== DEBUG: Expert not approved, redirecting to account-under-review ===')
        router.push('/account-under-review')
        return
      }

      console.log('=== DEBUG: Expert authenticated, loading earnings data ===')
      loadEarningsData()
    }
  }, [user, profile, loading, router])

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (earningsLoading) {
        console.log('=== DEBUG: Earnings loading timeout (20s), setting to false ===')
        setEarningsLoading(false)
        // Set empty state to show something to the user
        setEarnings([])
        setSummary({
          totalEarnings: 0,
          totalCommission: 0,
          netEarnings: 0,
          totalSessions: 0,
          averageEarning: 0,
          pendingAmount: 0,
          thisMonth: 0,
          lastMonth: 0,
          growth: 0
        })
      }
    }, 20000) // 20 second timeout

    return () => clearTimeout(timeout)
  }, [earningsLoading])

  // Handle filter changes separately
  useEffect(() => {
    if (user && profile && !loading && !earningsLoading) {
      console.log('=== DEBUG: Filter changed, reloading earnings data ===')
      loadEarningsData()
    }
  }, [filter.period, filter.status])

  // Add real-time listener for session updates
  useEffect(() => {
    if (!user?.id || loading) return

    console.log('=== DEBUG: Setting up real-time earnings listener ===')
    
    const channel = supabase
      .channel('expert-earnings-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_sessions',
          filter: `expert_id=eq.${user.id}`
        },
        (payload) => {
          console.log('=== DEBUG: Session update received ===', payload)
          // When any session is updated for this expert, refresh earnings
          if (payload.new?.expert_id === user.id && payload.new?.status === 'completed') {
            console.log('=== DEBUG: Session completed, refreshing earnings ===')
            loadEarningsData()
          }
        }
      )
      .subscribe()

    return () => {
      console.log('=== DEBUG: Cleaning up earnings listener ===')
      supabase.removeChannel(channel)
    }
  }, [user?.id, loading])

  const loadEarningsData = async () => {
    try {
      setEarningsLoading(true)
      console.log('=== DEBUG: Loading Expert Earnings Data ===')

      // Check if user is available
      if (!user?.id) {
        console.error('=== DEBUG: No user ID available ===')
        setEarningsLoading(false)
        return
      }

      // Load real session data from database
      let sessions = null
      let sessionsError = null
      let retryCount = 0
      const maxRetries = 3

      while (retryCount < maxRetries && !sessions) {
        try {
          console.log(`=== DEBUG: Database query attempt ${retryCount + 1} ===`)
          
          // Simplified query for better performance
          const result = await supabase
            .from('live_sessions')
            .select('id, status, created_at, started_at, ended_at, session_type')
            .eq('expert_id', user.id)
            .in('status', ['completed'])
            .order('created_at', { ascending: false })
            .limit(50) // Limit to recent sessions

          sessions = result.data
          sessionsError = result.error

          console.log(`=== DEBUG: Query result ===`, {
            sessionsCount: sessions?.length || 0,
            sessionsError,
            retryCount
          })

          if (sessionsError) {
            console.log(`=== DEBUG: Query attempt ${retryCount + 1} failed ===`, sessionsError)
            sessionsError = sessionsError
            retryCount++
            
            if (retryCount < maxRetries) {
              console.log(`=== DEBUG: Retrying in 2 seconds... ===`)
              await new Promise(resolve => setTimeout(resolve, 2000))
            }
          } else {
            console.log('=== DEBUG: Query successful ===')
            break
          }
        } catch (error) {
          console.error(`=== DEBUG: Query attempt ${retryCount + 1} error ===`, error)
          if (retryCount < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            retryCount++
          }
        }
      }

      if (sessionsError) {
        console.error('=== DEBUG: Error loading sessions ===', sessionsError)
        // Set empty state on error
        setEarnings([])
        setSummary({
          totalEarnings: 0,
          totalCommission: 0,
          netEarnings: 0,
          totalSessions: 0,
          averageEarning: 0,
          pendingAmount: 0,
          thisMonth: 0,
          lastMonth: 0,
          growth: 0
        })
        return
      }

      console.log('=== DEBUG: Sessions loaded for earnings ===', sessions?.length || 0)

      // Fetch expert transactions separately
      const { data: expertTransactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'credit')
        .order('created_at', { ascending: false })

      console.log('=== DEBUG: Expert transactions loaded ===', {
        count: expertTransactions?.length || 0,
        error: transactionsError
      })

      // Process sessions and calculate earnings
      const earningsRecords = sessions?.map((session: any) => {
        try {
          // Calculate duration - handle missing or invalid dates
          let duration = 0
          if (session.started_at && session.ended_at) {
            try {
              const startTime = new Date(session.started_at)
              const endTime = new Date(session.ended_at)
              
              // Check if dates are valid
              if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime()) && endTime > startTime) {
                duration = Math.ceil((endTime.getTime() - startTime.getTime()) / 60000)
              }
            } catch (dateError) {
              console.error('=== DEBUG: Date parsing error ===', dateError)
            }
          }
          
          // Match transaction to this specific session using multiple strategies
          let transactionAmount = 0
          if (expertTransactions && expertTransactions.length > 0) {
            console.log('=== DEBUG: Trying to match transaction for session ===', {
              sessionId: session.id,
              sessionDate: session.created_at,
              sessionEnded: session.ended_at,
              availableTransactions: expertTransactions.map(t => ({
                id: t.id,
                amount: t.amount,
                description: t.description,
                created_at: t.created_at,
                type: t.type
              }))
            })
            
            let sessionTransaction = null
            
            // Strategy 1: Try to find transaction with session ID in description
            sessionTransaction = expertTransactions.find(t => 
              t.description && t.description.includes(session.id)
            )
            
            if (!sessionTransaction) {
              // Strategy 2: Try timestamp matching around session end time
              const sessionEndDate = session.ended_at ? new Date(session.ended_at) : new Date(session.created_at)
              sessionTransaction = expertTransactions.find(t => {
                if (t.type !== 'credit') return false
                const transactionDate = new Date(t.created_at)
                const timeDiff = Math.abs(transactionDate.getTime() - sessionEndDate.getTime())
                // Look for transactions within 10 minutes of session end
                return timeDiff < 10 * 60 * 1000
              })
            }
            
            if (!sessionTransaction) {
              // Strategy 3: Try to match by amount pattern (avoid duplicates)
              const usedTransactions = new Set()
              sessionTransaction = expertTransactions.find(t => {
                if (t.type !== 'credit') return false
                if (usedTransactions.has(t.amount)) return false
                usedTransactions.add(t.amount)
                return true
              })
            }
            
            console.log('=== DEBUG: Transaction match result ===', {
              found: !!sessionTransaction,
              matchedTransaction: sessionTransaction,
              strategy: sessionTransaction ? 'matched' : 'no-match'
            })
            
            if (sessionTransaction) {
              transactionAmount = sessionTransaction.amount
            } else {
              // No matching transaction found - this session has no earnings
              transactionAmount = 0
              console.log('=== DEBUG: No transaction found for session ===', session.id)
            }
          }
          
          // Only process sessions that have matching transactions
          if (transactionAmount === 0) {
            console.log('=== DEBUG: Skipping session with no transaction ===', session.id)
            return null
          }

          // Since price_per_minute doesn't exist, use transaction amount directly
          const amount = transactionAmount
          
          const commission = Math.round(amount * 0.15) // 15% commission
          const netEarning = amount - commission

          console.log('=== DEBUG: Processing session with earnings ===', {
            sessionId: session.id,
            duration,
            amount,
            netEarning
          })

          return {
            id: session.id,
            session_id: session.id,
            date: session.created_at,
            clientName: 'Client', // Use default since user_name doesn't exist
            type: session.session_type || 'chat',
            duration,
            amount,
            commission,
            netEarning,
            status: session.status === 'completed' ? 'completed' : 'pending'
          }
        } catch (error) {
          console.error('=== DEBUG: Error processing session ===', session.id, error)
          return null
        }
      }).filter(Boolean) as EarningRecord[] || []

      console.log('=== DEBUG: Processed earnings records ===', earningsRecords.length)

      // Filter based on selected period
      const filteredEarnings = filterEarningsByPeriod(earningsRecords, filter.period)
      const statusFilteredEarnings = filter.status === 'all' 
        ? filteredEarnings 
        : filteredEarnings.filter(e => e.status === filter.status)

      // Calculate summary with safe operations
      const totalEarnings = statusFilteredEarnings.reduce((sum, e) => sum + (e.amount || 0), 0)
      const totalCommission = statusFilteredEarnings.reduce((sum, e) => sum + (e.commission || 0), 0)
      const netEarnings = statusFilteredEarnings.reduce((sum, e) => sum + (e.netEarning || 0), 0)
      const totalSessions = statusFilteredEarnings.length
      const averageEarning = totalSessions > 0 ? Math.round(netEarnings / totalSessions) : 0
      const pendingAmount = statusFilteredEarnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + (e.netEarning || 0), 0)

      // Calculate monthly comparison
      const now = new Date()
      const thisMonth = earningsRecords
        .filter(e => {
          try {
            const date = new Date(e.date)
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
          } catch {
            return false
          }
        })
        .reduce((sum, e) => sum + (e.netEarning || 0), 0)
      
      const lastMonth = earningsRecords
        .filter(e => {
          try {
            const date = new Date(e.date)
            const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1)
            return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear()
          } catch {
            return false
          }
        })
        .reduce((sum, e) => sum + (e.netEarning || 0), 0)

      const growth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0

      console.log('=== DEBUG: Earnings Summary ===')
      console.log('Total earnings:', totalEarnings)
      console.log('Net earnings:', netEarnings)
      console.log('Total sessions:', totalSessions)
      console.log('This month:', thisMonth)
      console.log('Last month:', lastMonth)
      console.log('Growth:', growth)

      setEarnings(statusFilteredEarnings)
      setSummary({
        totalEarnings,
        totalCommission,
        netEarnings,
        totalSessions,
        averageEarning,
        pendingAmount,
        thisMonth,
        lastMonth,
        growth
      })
    } catch (error) {
      console.error('=== DEBUG: Error in loadEarningsData ===', error)
      // Set empty state on any error
      setEarnings([])
      setSummary({
        totalEarnings: 0,
        totalCommission: 0,
        netEarnings: 0,
        totalSessions: 0,
        averageEarning: 0,
        pendingAmount: 0,
        thisMonth: 0,
        lastMonth: 0,
        growth: 0
      })
    } finally {
      setEarningsLoading(false)
    }
  }

  const filterEarningsByPeriod = (earnings: EarningRecord[], period: string) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    switch (period) {
      case 'this-month':
        return earnings.filter(e => {
          const date = new Date(e.date)
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear
        })
      case 'last-month':
        return earnings.filter(e => {
          const date = new Date(e.date)
          const lastMonth = new Date(currentYear, currentMonth - 1)
          return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear()
        })
      case 'last-3-months':
        return earnings.filter(e => {
          const date = new Date(e.date)
          const threeMonthsAgo = new Date(currentYear, currentMonth - 3)
          return date >= threeMonthsAgo
        })
      case 'last-6-months':
        return earnings.filter(e => {
          const date = new Date(e.date)
          const sixMonthsAgo = new Date(currentYear, currentMonth - 6)
          return date >= sixMonthsAgo
        })
      case 'this-year':
        return earnings.filter(e => new Date(e.date).getFullYear() === currentYear)
      default:
        return earnings
    }
  }

  const downloadStatement = () => {
    // Generate and download earnings statement
    const csvContent = [
      ['Date', 'Client', 'Type', 'Duration', 'Amount', 'Commission', 'Net Earning', 'Status'],
      ...earnings.map(e => [
        new Date(e.date).toLocaleDateString(),
        e.clientName,
        e.type,
        `${e.duration} min`,
        e.amount,
        e.commission,
        e.netEarning,
        e.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `earnings-statement-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'chat': return '💬'
      case 'call': return '📞'
      case 'video': return '📹'
      default: return '💬'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border border-red-500/30'
      default: return 'bg-white/20 text-white/60 border border-white/30'
    }
  }

  if (loading || earningsLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fbcc1e]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F14] pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Earnings</h1>
              <p className="text-white/60">Track your income and payment history</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  console.log('=== DEBUG: Manual refresh clicked ===')
                  loadEarningsData()
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors border border-white/20"
              >
                <TrendingUp className="w-4 h-4" />
                Refresh
              </button>
              
              <button
                onClick={downloadStatement}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#fbcc1e] to-amber-500 text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#fbcc1e]/20 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Download Statement
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#fbcc1e] w-8 h-8 flex items-center justify-center font-bold text-lg">₹</span>
              <span className="text-xs text-white/60">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">₹{summary.totalEarnings.toLocaleString()}</p>
            <p className="text-sm text-white/60">Total earnings</p>
          </div>

          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-[#fbcc1e]" />
              <span className="text-xs text-white/60">Net</span>
            </div>
            <p className="text-2xl font-bold text-white">₹{summary.netEarnings.toLocaleString()}</p>
            <p className="text-sm text-white/60">After commission</p>
          </div>

          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-[#fbcc1e]" />
              <span className="text-xs text-white/60">Sessions</span>
            </div>
            <p className="text-2xl font-bold text-white">{summary.totalSessions}</p>
            <p className="text-sm text-white/60">Total sessions</p>
          </div>

          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-[#fbcc1e]" />
              <span className="text-xs text-white/60">Pending</span>
            </div>
            <p className="text-2xl font-bold text-white">₹{summary.pendingAmount.toLocaleString()}</p>
            <p className="text-sm text-white/60">Pending payments</p>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Monthly Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-white/60 mb-1">This Month</p>
              <p className="text-2xl font-bold text-white">₹{summary.thisMonth.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/60 mb-1">Last Month</p>
              <p className="text-2xl font-bold text-white">₹{summary.lastMonth.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/60 mb-1">Growth</p>
              <p className={`text-2xl font-bold ${summary.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {summary.growth >= 0 ? '+' : ''}{summary.growth}%
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/60" />
              <span className="text-sm font-medium text-white">Filters:</span>
            </div>
            
            <select
              value={filter.period}
              onChange={(e) => setFilter(prev => ({ ...prev, period: e.target.value }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-[#fbcc1e]/50"
            >
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="this-year">This Year</option>
            </select>
            
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-[#fbcc1e]/50"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={downloadStatement}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#fbcc1e] to-amber-500 text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#fbcc1e]/20 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Download Statement
            </button>
          </div>
        </div>

        {/* Earnings Table */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Earnings History</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Net Earning
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {earnings.length > 0 ? (
                  earnings.map((earning) => (
                    <tr key={earning.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(earning.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {earning.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        <div className="flex items-center gap-2">
                          <span>{getSessionIcon(earning.type)}</span>
                          <span className="capitalize">{earning.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-white/40" />
                          {earning.duration} min
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        ₹{earning.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                        ₹{earning.commission}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        ₹{earning.netEarning}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(earning.status)}`}>
                          {earning.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-white/60">
                      <div className="flex flex-col items-center">
                        <DollarSign className="w-12 h-12 text-white/40 mb-4" />
                        <p>No earnings records found</p>
                        <p className="text-sm text-white/40 mt-2">Complete sessions to see your earnings here</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-8 bg-[#1C1C24] border border-white/10 rounded-xl p-6">
          <h3 className="font-medium text-white mb-3">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-white/80">
            <div>
              <h4 className="font-medium mb-2 text-white">Commission Structure</h4>
              <ul className="space-y-1">
                <li>• Chat sessions: 15% commission</li>
                <li>• Call sessions: 15% commission</li>
                <li>• Video sessions: 15% commission</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-white">Payment Schedule</h4>
              <ul className="space-y-1">
                <li>• Payments are processed weekly</li>
                <li>• Pending payments clear within 24-48 hours</li>
                <li>• Minimum withdrawal amount: ₹500</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
