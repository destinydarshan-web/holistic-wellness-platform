'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { TrendingUp, Search, Filter, ArrowLeft, Mail, Calendar, Star, DollarSign, Award, Clock, CheckCircle, XCircle, Eye } from 'lucide-react'

interface ExpertProfile {
  id: string
  full_name: string | null
  email?: string
  role: 'expert'
  specialization: 'astrologer' | 'counsellor' | 'yoga_trainer' | 'meditation_expert' | null
  status: 'approved' | 'pending' | 'rejected'
  created_at: string
  last_sign_in_at?: string
  price_per_minute?: number
  experience_years?: number
  rating?: number
  total_bookings?: number
  bio?: string
}

export default function AdminExpertsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [experts, setExperts] = useState<ExpertProfile[]>([])
  const [filteredExperts, setFilteredExperts] = useState<ExpertProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!user || !profile || profile.role !== 'admin') {
        router.push('/dashboard')
        return
      }
      loadExperts()
    }
  }, [user, profile, loading, router])

  useEffect(() => {
    filterExperts()
  }, [experts, searchTerm, specializationFilter, statusFilter])

  const loadExperts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'expert')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Get expert details from expert tables
      const expertsWithDetails = await Promise.all(
        (profilesData || []).map(async (expert) => {
          const { data: userData } = await supabase.auth.admin.getUserById(expert.id)
          
          // Get expert-specific data based on specialization
          let expertDetails = {}
          if (expert.specialization === 'astrologer') {
            const { data: astroData } = await supabase
              .from('expert_astrologers')
              .select('*')
              .eq('id', expert.id)
              .single()
            expertDetails = astroData || {}
          } else if (expert.specialization === 'counsellor') {
            const { data: counselData } = await supabase
              .from('expert_counsellors')
              .select('*')
              .eq('id', expert.id)
              .single()
            expertDetails = counselData || {}
          } else if (expert.specialization === 'yoga_trainer') {
            const { data: yogaData } = await supabase
              .from('expert_yoga')
              .select('*')
              .eq('id', expert.id)
              .single()
            expertDetails = yogaData || {}
          } else if (expert.specialization === 'meditation_expert') {
            const { data: medData } = await supabase
              .from('expert_meditation')
              .select('*')
              .eq('id', expert.id)
              .single()
            expertDetails = medData || {}
          }

          return {
            ...expert,
            email: userData?.user?.email,
            last_sign_in_at: userData?.user?.last_sign_in_at,
            ...expertDetails
          }
        })
      )

      setExperts(expertsWithDetails)
    } catch (error) {
      
      setError('Failed to load experts')
    } finally {
      setIsLoading(false)
    }
  }

  const filterExperts = () => {
    let filtered = experts

    if (searchTerm) {
      filtered = filtered.filter(expert => 
        expert.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (specializationFilter !== 'all') {
      filtered = filtered.filter(expert => expert.specialization === specializationFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(expert => expert.status === statusFilter)
    }

    setFilteredExperts(filtered)
  }

  const handleUpdateExpertStatus = async (expertId: string, newStatus: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', expertId)

      if (error) throw error
      await loadExperts()
    } catch (error) {
      
      setError('Failed to update expert status')
    } finally {
      setIsLoading(false)
    }
  }

  const getSpecializationLabel = (specialization: string) => {
    const labels = {
      'astrologer': 'Astrologer',
      'counsellor': 'Counsellor',
      'yoga_trainer': 'Yoga Trainer',
      'meditation_expert': 'Meditation Expert'
    }
    return labels[specialization as keyof typeof labels] || specialization
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'approved': 'text-green-400 bg-green-500/20',
      'pending': 'text-yellow-400 bg-yellow-500/20',
      'rejected': 'text-red-400 bg-red-500/20'
    }
    return colors[status as keyof typeof colors] || 'text-gray-400 bg-gray-500/20'
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
          <h1 className="text-3xl font-bold text-white mb-2">Manage Experts</h1>
          <p className="text-white/60">View and manage all expert profiles</p>
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
                placeholder="Search experts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
              />
            </div>
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#fbcc1e]"
            >
              <option value="all">All Specializations</option>
              <option value="astrologer">Astrologers</option>
              <option value="counsellor">Counsellors</option>
              <option value="yoga_trainer">Yoga Trainers</option>
              <option value="meditation_expert">Meditation Experts</option>
            </select>
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
              {filteredExperts.length} experts found
            </div>
          </div>
        </div>

        {/* Experts List */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">All Experts ({filteredExperts.length})</h2>
          </div>
          <div className="divide-y divide-white/10">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="text-white/60">Loading experts...</div>
              </div>
            ) : filteredExperts.length > 0 ? (
              filteredExperts.map((expert) => (
                <div key={expert.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#fbcc1e] to-[#e6b800] flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-black" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white">{expert.full_name || 'Unknown Expert'}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(expert.status)}`}>
                              {expert.status}
                            </span>
                          </div>
                          <p className="text-white/60 text-sm">{expert.email}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-white/40 text-xs mb-1">Specialization</p>
                          <p className="text-white text-sm font-medium">
                            {getSpecializationLabel(expert.specialization || '')}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs mb-1">Price/Min</p>
                          <p className="text-white text-sm font-medium">
                            ${expert.price_per_minute || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs mb-1">Experience</p>
                          <p className="text-white text-sm font-medium">
                            {expert.experience_years ? `${expert.experience_years} years` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs mb-1">Rating</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-white text-sm font-medium">
                              {expert.rating ? expert.rating.toFixed(1) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {expert.bio && (
                        <div className="mb-3">
                          <p className="text-white/40 text-xs mb-1">Bio</p>
                          <p className="text-white/60 text-sm line-clamp-2">{expert.bio}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {new Date(expert.created_at).toLocaleDateString()}</span>
                        </div>
                        {expert.last_sign_in_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Last seen {new Date(expert.last_sign_in_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedExpert(expert)}
                        className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-white/60" />
                      </button>
                      <select
                        value={expert.status}
                        onChange={(e) => handleUpdateExpertStatus(expert.id, e.target.value)}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-[#fbcc1e]"
                        disabled={isLoading}
                      >
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <TrendingUp className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No experts found</p>
              </div>
            )}
          </div>
        </div>

        {/* Expert Details Modal */}
        {selectedExpert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#1C1C24] rounded-xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Expert Details</h2>
                  <button
                    onClick={() => setSelectedExpert(null)}
                    className="text-white/60 hover:text-white"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#fbcc1e] to-[#e6b800] flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{selectedExpert.full_name || 'Unknown Expert'}</h3>
                    <p className="text-white/60">{selectedExpert.email}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${getStatusColor(selectedExpert.status)}`}>
                      {selectedExpert.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-white/40 text-sm mb-1">Specialization</p>
                    <p className="text-white font-medium">
                      {getSpecializationLabel(selectedExpert.specialization || '')}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-sm mb-1">Price per Minute</p>
                    <p className="text-white font-medium">${selectedExpert.price_per_minute || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-sm mb-1">Experience</p>
                    <p className="text-white font-medium">
                      {selectedExpert.experience_years ? `${selectedExpert.experience_years} years` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-sm mb-1">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-medium">
                        {selectedExpert.rating ? selectedExpert.rating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedExpert.bio && (
                  <div className="mb-6">
                    <p className="text-white/40 text-sm mb-2">Bio</p>
                    <p className="text-white/60">{selectedExpert.bio}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(selectedExpert.created_at).toLocaleDateString()}</span>
                  </div>
                  {selectedExpert.last_sign_in_at && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Last seen {new Date(selectedExpert.last_sign_in_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
