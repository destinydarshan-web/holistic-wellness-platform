'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Calendar, DollarSign, TrendingUp, Download, Filter, ChevronDown, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface EarningRecord {
  id: string
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
  const { user, profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
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
    if (!user) {
      router.push('/login')
      return
    }
    
    if (profile?.role !== 'expert') {
      router.push('/dashboard')
      return
    }
  }, [user, profile, router])

  useEffect(() => {
    loadEarningsData()
  }, [filter])

  const loadEarningsData = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockEarnings: EarningRecord[] = [
        {
          id: '1',
          date: '2024-02-26',
          clientName: 'Sarah Johnson',
          type: 'chat',
          duration: 30,
          amount: 299,
          commission: 45,
          netEarning: 254,
          status: 'completed'
        },
        {
          id: '2',
          date: '2024-02-26',
          clientName: 'Michael Chen',
          type: 'video',
          duration: 45,
          amount: 499,
          commission: 75,
          netEarning: 424,
          status: 'completed'
        },
        {
          id: '3',
          date: '2024-02-25',
          clientName: 'Emma Davis',
          type: 'call',
          duration: 60,
          amount: 399,
          commission: 60,
          netEarning: 339,
          status: 'pending'
        },
        {
          id: '4',
          date: '2024-02-25',
          clientName: 'Robert Wilson',
          type: 'chat',
          duration: 20,
          amount: 199,
          commission: 30,
          netEarning: 169,
          status: 'completed'
        },
        {
          id: '5',
          date: '2024-02-24',
          clientName: 'Lisa Anderson',
          type: 'video',
          duration: 30,
          amount: 299,
          commission: 45,
          netEarning: 254,
          status: 'completed'
        }
      ]

      const totalEarnings = mockEarnings.reduce((sum, e) => sum + e.amount, 0)
      const totalCommission = mockEarnings.reduce((sum, e) => sum + e.commission, 0)
      const netEarnings = mockEarnings.reduce((sum, e) => sum + e.netEarning, 0)
      const totalSessions = mockEarnings.length
      const averageEarning = totalSessions > 0 ? netEarnings / totalSessions : 0
      const pendingAmount = mockEarnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.netEarning, 0)

      setEarnings(mockEarnings)
      setSummary({
        totalEarnings,
        totalCommission,
        netEarnings,
        totalSessions,
        averageEarning,
        pendingAmount,
        thisMonth: 15000,
        lastMonth: 12000,
        growth: 25
      })
    } catch (error) {
      console.error('Error loading earnings data:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadStatement = () => {
    // Generate and download earnings statement
    const csvContent = [
      ['Date', 'Client', 'Type', 'Duration', 'Amount', 'Commission', 'Net Earning', 'Status'],
      ...earnings.map(e => [
        e.date,
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
      case 'completed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
              <p className="text-gray-600">Track your income and payment history</p>
            </div>
            
            <button
              onClick={downloadStatement}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-600"
            >
              <Download className="w-4 h-4" />
              Download Statement
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{summary.totalEarnings.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total earnings</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="text-xs text-gray-500">Net</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{summary.netEarnings.toLocaleString()}</p>
            <p className="text-sm text-gray-600">After commission</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-purple-600" />
              <span className="text-xs text-gray-500">Sessions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalSessions}</p>
            <p className="text-sm text-gray-600">Total sessions</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <span className="text-xs text-gray-500">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{summary.pendingAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Pending payments</p>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">This Month</p>
              <p className="text-2xl font-bold text-gray-900">₹{summary.thisMonth.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Last Month</p>
              <p className="text-2xl font-bold text-gray-900">₹{summary.lastMonth.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Growth</p>
              <p className={`text-2xl font-bold ${summary.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.growth >= 0 ? '+' : ''}{summary.growth}%
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filter.period}
              onChange={(e) => setFilter(prev => ({ ...prev, period: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Earnings Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Earnings History</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Earning
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {earnings.length > 0 ? (
                  earnings.map((earning) => (
                    <tr key={earning.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(earning.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {earning.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{getSessionIcon(earning.type)}</span>
                          <span className="capitalize">{earning.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {earning.duration} min
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{earning.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        ₹{earning.commission}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <DollarSign className="w-12 h-12 text-gray-400 mb-4" />
                        <p>No earnings records found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-medium text-blue-900 mb-3">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Commission Structure</h4>
              <ul className="space-y-1">
                <li>• Chat sessions: 15% commission</li>
                <li>• Call sessions: 15% commission</li>
                <li>• Video sessions: 15% commission</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Payment Schedule</h4>
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
