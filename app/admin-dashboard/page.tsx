'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Users, CheckCircle, XCircle, Clock, LogOut, Settings, TrendingUp, Calendar, DollarSign } from 'lucide-react'

interface ExpertProfile {
  id: string
  full_name: string | null
  role: 'expert'
  specialization: 'astrologer' | 'counsellor' | 'yoga_trainer' | 'meditation_expert' | null
  status: 'approved' | 'pending'
  created_at: string
  email?: string
}

export default function AdminDashboard() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [pendingExperts, setPendingExperts] = useState<ExpertProfile[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExperts: 0,
    pendingExperts: 0,
    approvedExperts: 0,
    totalBookings: 0,
    totalRevenue: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add real-time updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles',
          filter: 'role=eq.expert'
        }, 
        (payload) => {
          console.log('Profile change detected:', payload)
          loadAdminData() // Refresh data when profiles change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('admin-dashboard-bookings')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookings'
        }, 
        (payload) => {
          console.log('Booking change detected:', payload)
          loadAdminData() // Refresh data when bookings change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('admin-dashboard-transactions')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transactions'
        }, 
        (payload) => {
          console.log('Transaction change detected:', payload)
          loadAdminData() // Refresh data when transactions change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (!profile || profile.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      loadAdminData()
    }
  }, [user, profile, loading, router])

  const loadAdminData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Load pending experts
      const { data: pendingData, error: pendingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'expert')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (pendingError) throw pendingError

      // Get user emails for pending experts
      const pendingExpertsWithEmails = await Promise.all(
        (pendingData || []).map(async (expert) => {
          const { data: userData } = await supabase.auth.admin.getUserById(expert.id)
          return {
            ...expert,
            email: userData?.user?.email
          }
        })
      )

      setPendingExperts(pendingExpertsWithEmails)

      // Load comprehensive stats
      const [profilesData, bookingsData, transactionsData] = await Promise.all([
        supabase.from('profiles').select('role, status'),
        supabase.from('bookings').select('amount, status'),
        supabase.from('transactions').select('amount, type')
      ])

      if (profilesData.data) {
        const totalRevenue = (transactionsData.data || [])
          .filter(t => t.type === 'deposit' || t.type === 'booking_payment')
          .reduce((sum, t) => sum + (t.amount || 0), 0)

        const stats = {
          totalUsers: profilesData.data.filter(p => p.role === 'user').length,
          totalExperts: profilesData.data.filter(p => p.role === 'expert').length,
          pendingExperts: profilesData.data.filter(p => p.role === 'expert' && p.status === 'pending').length,
          approvedExperts: profilesData.data.filter(p => p.role === 'expert' && p.status === 'approved').length,
          totalBookings: bookingsData.data?.length || 0,
          totalRevenue: totalRevenue
        }
        setStats(stats)
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
      setError('Failed to load admin data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveExpert = async (expertId: string) => {
    try {
      setIsLoading(true)
      
      // Update profile status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', expertId)

      if (profileError) throw profileError

      // Send notification to expert (optional - you can implement this)
      console.log(`Expert ${expertId} approved successfully`)

      // Refresh data
      await loadAdminData()
    } catch (error) {
      console.error('Error approving expert:', error)
      setError('Failed to approve expert')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectExpert = async (expertId: string) => {
    try {
      setIsLoading(true)
      
      // Option 1: Delete the profile completely
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', expertId)

      if (deleteError) throw deleteError

      // Option 2: Update status to rejected (if you have this status)
      // const { error: updateError } = await supabase
      //   .from('profiles')
      //   .update({ status: 'rejected' })
      //   .eq('id', expertId)

      console.log(`Expert ${expertId} rejected and removed`)

      // Refresh data
      await loadAdminData()
    } catch (error) {
      console.error('Error rejecting expert:', error)
      setError('Failed to reject expert')
    } finally {
      setIsLoading(false)
    }
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
    <div className="pt-24 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-white/60">
            Manage users and expert applications
          </p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
          <div
            onClick={() => router.push('/admin/users')}
            className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">
                {isLoading ? '...' : stats.totalUsers}
              </span>
            </div>
            <p className="text-white/60">Total Users</p>
          </div>
          <div
            onClick={() => router.push('/admin/experts')}
            className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">
                {isLoading ? '...' : stats.totalExperts}
              </span>
            </div>
            <p className="text-white/60">Total Experts</p>
          </div>
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">
                {isLoading ? '...' : stats.pendingExperts}
              </span>
            </div>
            <p className="text-white/60">Pending Experts</p>
          </div>
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">
                {isLoading ? '...' : stats.approvedExperts}
              </span>
            </div>
            <p className="text-white/60">Approved Experts</p>
          </div>
          <div
            onClick={() => router.push('/admin/bookings')}
            className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">
                {isLoading ? '...' : stats.totalBookings}
              </span>
            </div>
            <p className="text-white/60">Total Bookings</p>
          </div>
          <div
            onClick={() => router.push('/admin/revenue')}
            className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">
                {isLoading ? '...' : `₹${(stats.totalRevenue / 1000).toFixed(1)}k`}
              </span>
            </div>
            <p className="text-white/60">Total Revenue</p>
          </div>
        </div>

        {/* Pending Expert Applications */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Pending Expert Applications</h2>
          </div>
          <div className="p-6">
            {pendingExperts.length > 0 ? (
              <div className="space-y-4">
                {pendingExperts.map((expert) => (
                  <div key={expert.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{expert.full_name || 'Unknown'}</h3>
                      <p className="text-white/60 text-sm">{expert.email}</p>
                      <p className="text-white/60 text-sm">
                        Specialization: {expert.specialization?.replace('_', ' ').charAt(0).toUpperCase() + (expert.specialization?.slice(1).replace('_', '') || '')}
                      </p>
                      <p className="text-white/60 text-sm">
                        Applied: {new Date(expert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveExpert(expert.id)}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle size={16} />
                        {isLoading ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectExpert(expert.id)}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle size={16} />
                        {isLoading ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No pending expert applications</p>
              </div>
            )}
          </div>
        </div>

        {/* Event Management */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Event Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => router.push('/admin/create-yoga-event')}
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">🧘</span>
                </div>
                <h3 className="font-medium text-white text-lg">Manage Yoga Events</h3>
              </div>
              <p className="text-white/60 text-sm">Create and manage yoga events for the platform</p>
            </div>
            <div
              onClick={() => router.push('/admin/create-meditation-event')}
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">🧘‍♀️</span>
                </div>
                <h3 className="font-medium text-white text-lg">Manage Meditation Events</h3>
              </div>
              <p className="text-white/60 text-sm">Create and manage meditation events for the platform</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => router.push('/admin/users')}
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Users className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Manage Users</h3>
              <p className="text-white/60 text-sm">View and manage all users</p>
            </div>
            <div
              onClick={() => router.push('/admin/experts')}
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <TrendingUp className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Manage Experts</h3>
              <p className="text-white/60 text-sm">View all expert profiles</p>
            </div>
            <div
              onClick={() => router.push('/admin/settings')}
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Settings className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Platform Settings</h3>
              <p className="text-white/60 text-sm">Configure platform settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
