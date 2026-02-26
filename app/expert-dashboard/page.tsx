'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Calendar, Users, Star, Clock, DollarSign, LogOut, Settings } from 'lucide-react'

export default function ExpertDashboard() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    earnings: 0
  })
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (!profile || profile.role !== 'expert' || profile.status !== 'approved') {
        router.push('/account-under-review')
        return
      }

      loadExpertData()
    }
  }, [user, profile, loading, router])

  const loadExpertData = async () => {
    // TODO: Load expert's actual data from database
    // For now, mock data
    setStats({
      totalBookings: 15,
      completedSessions: 12,
      upcomingSessions: 3,
      earnings: 15000
    })

    setBookings([
      {
        id: 1,
        clientName: 'John Doe',
        service: profile?.specialization?.replace('_', ' ').charAt(0).toUpperCase() + (profile?.specialization?.slice(1).replace('_', '') || ''),
        date: '2024-02-28',
        time: '10:00 AM',
        status: 'confirmed',
        payment: 1200
      },
      {
        id: 2,
        clientName: 'Jane Smith',
        service: profile?.specialization?.replace('_', ' ').charAt(0).toUpperCase() + (profile?.specialization?.slice(1).replace('_', '') || ''),
        date: '2024-02-29',
        time: '2:00 PM',
        status: 'confirmed',
        payment: 1200
      }
    ])
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F14]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Expert Dashboard
          </h1>
          <p className="text-white/60">
            Welcome back, {profile.full_name || user.email?.split('@')[0]}! • {profile.specialization?.replace('_', ' ').charAt(0).toUpperCase() + (profile.specialization?.slice(1).replace('_', '') || '')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">{stats.totalBookings}</span>
            </div>
            <p className="text-white/60">Total Bookings</p>
          </div>
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Star className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">{stats.completedSessions}</span>
            </div>
            <p className="text-white/60">Completed Sessions</p>
          </div>
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">{stats.upcomingSessions}</span>
            </div>
            <p className="text-white/60">Upcoming Sessions</p>
          </div>
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">₹{stats.earnings.toLocaleString()}</span>
            </div>
            <p className="text-white/60">Total Earnings</p>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10 mb-8">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Upcoming Sessions</h2>
          </div>
          <div className="p-6">
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#fbcc1e]/20 rounded-full flex items-center justify-center">
                        <Users className="text-[#fbcc1e] w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{booking.clientName}</h3>
                        <p className="text-white/60 text-sm">{booking.service}</p>
                        <p className="text-white/60 text-sm">{booking.date} at {booking.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                        booking.status === 'confirmed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {booking.status}
                      </span>
                      <p className="text-white/60 text-sm">₹{booking.payment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No upcoming sessions</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/profile"
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <Settings className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Profile Settings</h3>
              <p className="text-white/60 text-sm">Update your expert profile</p>
            </Link>
            <Link
              href="/schedule"
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <Calendar className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Manage Schedule</h3>
              <p className="text-white/60 text-sm">Set your availability</p>
            </Link>
            <Link
              href="/earnings"
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <DollarSign className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">View Earnings</h3>
              <p className="text-white/60 text-sm">Track your income</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
