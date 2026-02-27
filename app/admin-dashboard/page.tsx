'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Users, CheckCircle, XCircle, Clock, LogOut, Settings, TrendingUp } from 'lucide-react'

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
    approvedExperts: 0
  })

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

      // Load stats
      const { data: allExperts } = await supabase
        .from('profiles')
        .select('role, status')

      if (allExperts) {
        const stats = {
          totalUsers: allExperts.filter(p => p.role === 'user').length,
          totalExperts: allExperts.filter(p => p.role === 'expert').length,
          pendingExperts: allExperts.filter(p => p.role === 'expert' && p.status === 'pending').length,
          approvedExperts: allExperts.filter(p => p.role === 'expert' && p.status === 'approved').length
        }
        setStats(stats)
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }

  const handleApproveExpert = async (expertId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'approved' })
        .eq('id', expertId)

      if (error) throw error

      // Refresh data
      loadAdminData()
    } catch (error) {
      console.error('Error approving expert:', error)
    }
  }

  const handleRejectExpert = async (expertId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'pending' }) // Or you could delete the profile
        .eq('id', expertId)

      if (error) throw error

      // Refresh data
      loadAdminData()
    } catch (error) {
      console.error('Error rejecting expert:', error)
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">{stats.totalUsers}</span>
            </div>
            <p className="text-white/60">Total Users</p>
          </div>
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">{stats.totalExperts}</span>
            </div>
            <p className="text-white/60">Total Experts</p>
          </div>
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">{stats.pendingExperts}</span>
            </div>
            <p className="text-white/60">Pending Experts</p>
          </div>
          <div className="bg-[#1C1C24] rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-[#fbcc1e] w-8 h-8" />
              <span className="text-2xl font-bold text-white">{stats.approvedExperts}</span>
            </div>
            <p className="text-white/60">Approved Experts</p>
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
                        className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectExpert(expert.id)}
                        className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <XCircle size={16} />
                        Reject
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

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/users"
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <Users className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Manage Users</h3>
              <p className="text-white/60 text-sm">View and manage all users</p>
            </Link>
            <Link
              href="/admin/experts"
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <TrendingUp className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Manage Experts</h3>
              <p className="text-white/60 text-sm">View all expert profiles</p>
            </Link>
            <Link
              href="/admin/settings"
              className="bg-[#1C1C24] rounded-xl p-6 border border-white/10 hover:bg-white/5 transition-colors"
            >
              <Settings className="text-[#fbcc1e] w-8 h-8 mb-3" />
              <h3 className="font-medium text-white mb-2">Platform Settings</h3>
              <p className="text-white/60 text-sm">Configure platform settings</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
