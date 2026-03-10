'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Users, Search, Filter, ArrowLeft, Mail, Calendar, Shield, UserX, CheckCircle, XCircle } from 'lucide-react'

interface UserProfile {
  id: string
  full_name: string | null
  email?: string
  role: 'user' | 'expert' | 'admin'
  status: 'approved' | 'pending' | 'rejected'
  created_at: string
  last_sign_in_at?: string
}

export default function AdminUsersPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!user || !profile || profile.role !== 'admin') {
        router.push('/dashboard')
        return
      }
      loadUsers()
    }
  }, [user, profile, loading, router])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, statusFilter])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'user') // Only fetch users, not experts
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Get user emails
      const usersWithEmails = await Promise.all(
        (profilesData || []).map(async (user) => {
          const { data: userData } = await supabase.auth.admin.getUserById(user.id)
          return {
            ...user,
            email: userData?.user?.email,
            last_sign_in_at: userData?.user?.last_sign_in_at
          }
        })
      )

      setUsers(usersWithEmails)
    } catch (error) {
      
      setError('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      await loadUsers()
    } catch (error) {
      
      setError('Failed to update user role')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId)

      if (error) throw error
      await loadUsers()
    } catch (error) {
      
      setError('Failed to update user status')
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-3xl font-bold text-white mb-2">Manage Users</h1>
          <p className="text-white/60">View and manage all platform users</p>
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

        {/* Filters */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#fbcc1e]"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="text-white/60 text-sm flex items-center">
              {filteredUsers.length} users found
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">All Users ({filteredUsers.length})</h2>
          </div>
          <div className="divide-y divide-white/10">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="text-white/60">Loading users...</div>
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fbcc1e] to-[#e6b800] flex items-center justify-center">
                          <Users className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{user.full_name || 'Unknown User'}</h3>
                          <p className="text-white/60 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          <span className="capitalize">{user.role}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                        {user.last_sign_in_at && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>Last seen {new Date(user.last_sign_in_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={user.status}
                        onChange={(e) => handleUpdateUserStatus(user.id, e.target.value)}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-[#fbcc1e]"
                        disabled={isLoading}
                      >
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-[#fbcc1e]"
                        disabled={isLoading}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <UserX className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No users found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
