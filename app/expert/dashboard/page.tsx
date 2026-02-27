'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, DollarSign, Users, TrendingUp, ToggleLeft, ToggleRight, Video, Phone, MessageCircle, Star, AlertCircle, CheckCircle } from 'lucide-react'
import { RoleGuard } from '@/components/RoleGuard'
import ExpertIncomingSession from '@/components/ExpertIncomingSession'

interface Session {
  id: string
  clientName: string
  type: 'chat' | 'call' | 'video'
  time: string
  duration: string
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled' | 'pending'
  price: number
}

interface EarningsData {
  today: number
  thisWeek: number
  thisMonth: number
  pending: number
}

export default function ExpertDashboard() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [earnings, setEarnings] = useState<EarningsData>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    pending: 0
  })
  const [loading, setLoading] = useState(true)

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
    // Load dashboard data
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      setSessions([
        {
          id: '1',
          clientName: 'Sarah Johnson',
          type: 'chat',
          time: '10:00 AM',
          duration: '30 min',
          status: 'upcoming',
          price: 299
        },
        {
          id: '2',
          clientName: 'Michael Chen',
          type: 'video',
          time: '2:00 PM',
          duration: '45 min',
          status: 'upcoming',
          price: 499
        },
        {
          id: '3',
          clientName: 'Emma Davis',
          type: 'call',
          time: '4:30 PM',
          duration: '60 min',
          status: 'pending',
          price: 399
        }
      ])

      setEarnings({
        today: 1250,
        thisWeek: 8500,
        thisMonth: 32000,
        pending: 2400
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline)
    // API call to update online status
  }

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageCircle className="w-4 h-4" />
      case 'call': return <Phone className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      default: return <MessageCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'in-progress': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
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
    <RoleGuard allowedRoles={['expert']}>
      <ExpertIncomingSession 
        onSessionAccepted={(session) => {
          console.log("🔔 Session accepted in dashboard:", session)
          // You can add additional logic here, like refreshing sessions list
        }}
        onSessionRejected={(session) => {
          console.log("🔔 Session rejected in dashboard:", session)
          // You can add additional logic here
        }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Expert Dashboard</h1>
                <p className="text-gray-600">Manage your astrology practice</p>
              </div>
              
              {/* Online Status Toggle */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Availability Status</p>
                  <p className="text-xs text-gray-500">
                    {isOnline ? 'Available for sessions' : 'Not available'}
                  </p>
                </div>
                <button
                  onClick={toggleOnlineStatus}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isOnline 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isOnline ? (
                    <>
                      <ToggleRight className="w-5 h-5" />
                      Online
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5" />
                      Offline
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Earnings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <span className="text-xs text-gray-500">Today</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{earnings.today.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Today's earnings</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <span className="text-xs text-gray-500">This Week</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{earnings.thisWeek.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Weekly earnings</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-purple-600" />
                <span className="text-xs text-gray-500">This Month</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{earnings.thisMonth.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Monthly earnings</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
                <span className="text-xs text-gray-500">Pending</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{earnings.pending.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Pending payments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Sessions */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  Today's Sessions
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {sessions.length > 0 ? (
                    sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
                            {getSessionIcon(session.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{session.clientName}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-3 h-3" />
                              {session.time} • {session.duration}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{session.price}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No sessions scheduled for today</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                  Pending Requests
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {sessions.filter(s => s.status === 'pending').length > 0 ? (
                    sessions.filter(s => s.status === 'pending').map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-yellow-200 rounded-full">
                            {getSessionIcon(session.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{session.clientName}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-3 h-3" />
                              {session.time} • {session.duration}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                            Accept
                          </button>
                          <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700">
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No pending requests</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
