'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Calendar, Star, BookOpen, User, LogOut } from 'lucide-react'

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])

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

    loadUserBookings()
  }, [loading, user, profile, router])

  const loadUserBookings = async () => {
    // TODO: Load user's bookings from database
    // For now, mock data
    setBookings([
      {
        id: 1,
        service: 'Astrology',
        expert: 'Dr. Sarah Johnson',
        date: '2024-02-28',
        time: '10:00 AM',
        status: 'confirmed'
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
            Welcome back, {profile.full_name || user.email?.split('@')[0]}!
          </h1>
          <p className="text-white/60">
            Manage your wellness journey and bookings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <p className="text-white/60">Total Bookings</p>
          </div>
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Star className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <p className="text-white/60">Completed Sessions</p>
          </div>
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">5</span>
            </div>
            <p className="text-white/60">AI Consultations</p>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Recent Bookings</h2>
          </div>
          <div className="p-6">
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white">{booking.service}</h3>
                      <p className="text-white/60 text-sm">{booking.expert}</p>
                      <p className="text-white/60 text-sm">{booking.date} at {booking.time}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 mb-4">No bookings yet</p>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 bg-[#fbcc1e] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#e6b800] transition-colors"
                >
                  Book a Session
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/services"
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <BookOpen className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Book a Session</h3>
              <p className="text-white/60 text-sm">Schedule a consultation with our experts</p>
            </Link>
            <Link
              href="/#form-section"
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <Star className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Get AI Recommendation</h3>
              <p className="text-white/60 text-sm">Discover the best service for your needs</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
