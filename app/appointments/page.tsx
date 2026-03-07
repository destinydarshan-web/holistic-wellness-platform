'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Phone, 
  MessageCircle,
  ChevronRight,
  Bell,
  CheckCircle,
  X,
  AlertCircle,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Star,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export default function AppointmentsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'expert'>('date')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/login')
      return
    }

    // Check role-based redirects
    if (profile && profile.role !== 'user') {
      switch (profile.role) {
        case 'admin':
          router.push('/admin-dashboard')
          break
        case 'expert':
        case 'astrologer':
          router.push('/expert-dashboard')
          break
      }
      return
    }

    fetchAppointments()
  }, [loading, user, profile])

  // Real-time subscription for appointment updates
  useEffect(() => {
    if (!user) return

    // Subscribe to appointments table changes for this user
    const appointmentSubscription = supabase
      .channel('user_appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('User appointment change received:', payload)
          
          // Refresh appointments when changes occur
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            fetchAppointments()
          }
        }
      )
      .subscribe()

    // Subscribe to bookings table changes for this user
    const bookingSubscription = supabase
      .channel('user_bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('User booking change received:', payload)
          
          // Refresh appointments when changes occur
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            fetchAppointments()
          }
        }
      )
      .subscribe()

    return () => {
      appointmentSubscription.unsubscribe()
      bookingSubscription.unsubscribe()
    }
  }, [user])

  const fetchAppointments = async () => {
    try {
      if (!user) {
        console.log('=== DEBUG: No user found, skipping fetch ===')
        return
      }
      
      console.log('=== DEBUG: Fetching Appointments ===')
      
      // First try to fetch appointments without expert relationship
      let { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false })

      if (error) {
        console.log('=== DEBUG: Appointments table error ===', error)
        
        // If appointments table doesn't exist, try bookings table instead
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.log('=== DEBUG: Trying bookings table instead ===')
          
          const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
              *,
              expert_astrologers!inner(
                display_name,
                avatar_url
              )
            `)
            .eq('user_id', user.id)
            .order('booking_date', { ascending: false })
            .order('booking_time', { ascending: false })

          if (bookingsError) {
            console.error('Error fetching bookings:', bookingsError)
            return
          }

          console.log('=== DEBUG: Bookings Data ===')
          console.log('Bookings fetched:', bookingsData?.length || 0)
          
          // Transform bookings to look like appointments
          const appointmentsFromBookings = (bookingsData || []).map(booking => ({
            id: booking.id,
            user_id: booking.user_id,
            expert_id: booking.expert_id,
            appointment_date: booking.booking_date,
            appointment_time: booking.booking_time,
            status: booking.status || 'pending', // Handle both 'pending' and 'upcoming' in UI
            amount_paid: booking.amount || 0,
            notes: booking.notes || '',
            meeting_link: booking.meeting_link || '',
            created_at: booking.created_at,
            expert: booking.expert_astrologers
          }))

          setAppointments(appointmentsFromBookings)
          return
        }
        
        console.error('Error fetching appointments:', error)
        return
      }

      console.log('=== DEBUG: Raw Appointments Data ===')
      console.log('Appointments fetched:', appointmentsData?.length || 0)
      console.log('Sample appointment data:', appointmentsData?.[0])
      
      // If we have appointments, try to fetch expert info separately
      if (appointmentsData && appointmentsData.length > 0) {
        const expertIds = [...new Set(appointmentsData.map(apt => apt.expert_id).filter(Boolean))]
        
        console.log('=== DEBUG: Extracted expert IDs ===', expertIds)
        
        if (expertIds.length > 0) {
          // Try a simpler query first to see if the table exists
          try {
            const { data: testExperts, error: testExpertsError } = await supabase
              .from('expert_astrologers')
              .select('id, display_name')
              .limit(5)

            console.log('=== DEBUG: All experts test ===', { testExperts, testExpertsError })

            if (testExpertsError) {
              console.log('=== DEBUG: Expert astrologers table error ===', testExpertsError)
              // Set appointments without expert info if table doesn't exist
              setAppointments(appointmentsData || [])
              return
            }

            console.log('=== DEBUG: Fetching experts for IDs ===', expertIds)
            
            // Fetch experts from all possible tables
            const [astrologersData, counsellorsData, yogaData, meditationData] = await Promise.allSettled([
              supabase.from('expert_astrologers').select('id, display_name, avatar_url').in('id', expertIds),
              supabase.from('expert_counsellors').select('id, display_name, avatar_url').in('id', expertIds),
              supabase.from('expert_yoga').select('id, display_name, avatar_url').in('id', expertIds),
              supabase.from('expert_meditation').select('id, display_name, avatar_url').in('id', expertIds)
            ])

            console.log('=== DEBUG: Expert data results ===', {
              astrologers: astrologersData.status === 'fulfilled' ? astrologersData.value.data : astrologersData.reason,
              counsellors: counsellorsData.status === 'fulfilled' ? counsellorsData.value.data : counsellorsData.reason,
              yoga: yogaData.status === 'fulfilled' ? yogaData.value.data : yogaData.reason,
              meditation: meditationData.status === 'fulfilled' ? meditationData.value.data : meditationData.reason
            })

            // Combine all expert data
            const allExperts = []
            
            if (astrologersData.status === 'fulfilled' && astrologersData.value.data) {
              allExperts.push(...astrologersData.value.data.map(e => ({ ...e, type: 'astrologer' })))
            }
            if (counsellorsData.status === 'fulfilled' && counsellorsData.value.data) {
              allExperts.push(...counsellorsData.value.data.map(e => ({ ...e, type: 'counsellor' })))
            }
            if (yogaData.status === 'fulfilled' && yogaData.value.data) {
              allExperts.push(...yogaData.value.data.map(e => ({ ...e, type: 'yoga_trainer' })))
            }
            if (meditationData.status === 'fulfilled' && meditationData.value.data) {
              allExperts.push(...meditationData.value.data.map(e => ({ ...e, type: 'meditation_expert' })))
            }

            console.log('=== DEBUG: Combined experts ===', allExperts)

            if (allExperts.length > 0) {
              const expertMap = allExperts.reduce((acc, expert) => {
                acc[expert.id] = expert
                return acc
              }, {} as Record<string, any>)

              const appointmentsWithExperts = appointmentsData.map(appointment => ({
                ...appointment,
                expert: expertMap[appointment.expert_id] || null
              }))

              console.log('=== DEBUG: Appointments with expert data ===', appointmentsWithExperts)
              setAppointments(appointmentsWithExperts)
              return
            } else {
              console.log('=== DEBUG: No experts found in any table ===')
              setAppointments(appointmentsData || [])
              return
            }
          } catch (expertFetchError) {
            console.log('=== DEBUG: Expert fetch exception ===', expertFetchError)
            setAppointments(appointmentsData || [])
            return
          }
        }
      }
      
      // Set appointments without expert info if we can't fetch experts
      setAppointments(appointmentsData || [])
      
    } catch (error) {
      console.error('Error in fetchAppointments:', error)
    }
  }

  useEffect(() => {
    let filtered = appointments

    // Apply status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'pending') {
        // Handle both 'pending' and 'upcoming' for backward compatibility
        filtered = filtered.filter(apt => apt.status === 'pending' || apt.status === 'upcoming')
      } else {
        filtered = filtered.filter(apt => apt.status === selectedStatus)
      }
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.expert?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status)
      } else if (sortBy === 'expert') {
        return a.expert?.display_name?.localeCompare(b.expert?.display_name || '')
      }
      return 0
    })

    setFilteredAppointments(filtered)
  }, [appointments, selectedStatus, searchTerm, sortBy])

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleSort = (sort: 'date' | 'status' | 'expert') => {
    setSortBy(sort)
  }

  const handleViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode)
  }

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-[#d8b4fe]/20 text-[#d8b4fe] border border-[#d8b4fe]/30'
      case 'confirmed': return 'bg-[#fdce20]/20 text-[#fdce20] border border-[#fdce20]/30'
      case 'completed': return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border border-red-500/30'
      case 'rescheduled': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'astrologer_rejected': return 'bg-red-500/20 text-red-400 border border-red-500/30'
      default: return 'bg-white/10 text-white border border-white/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Calendar className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <X className="w-4 h-4" />
      case 'rescheduled': return <RefreshCw className="w-4 h-4" />
      case 'astrologer_rejected': return <X className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'confirmed': return 'Confirmed'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled by User'
      case 'rescheduled': return 'Rescheduled'
      case 'astrologer_rejected': return 'Rejected by Astrologer'
      default: return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const appointmentDate = new Date(date)
    const appointmentTime = new Date(`2000-01-01T${time}`)
    
    // Combine date and time
    const combinedDateTime = new Date(
      appointmentDate.getFullYear(),
      appointmentDate.getMonth(),
      appointmentDate.getDate(),
      appointmentTime.getHours(),
      appointmentTime.getMinutes()
    )

    return combinedDateTime.toLocaleString()
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      console.log('=== DEBUG: Cancelling appointment ===', appointmentId)
      
      // First try to update in appointments table
      let { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled'
        })
        .eq('id', appointmentId)
        .eq('user_id', user?.id)

      // If appointments table update fails, try bookings table
      if (error) {
        console.log('=== DEBUG: Appointments table update failed, trying bookings table ===', error)
        
        const { error: bookingsError } = await supabase
          .from('bookings')
          .update({ 
            status: 'cancelled'
          })
          .eq('id', appointmentId)
          .eq('user_id', user?.id)

        if (bookingsError) {
          console.error('Error cancelling appointment in both tables:', bookingsError)
          alert('Failed to cancel appointment. Please try again.')
          return
        }
      }

      console.log('✅ Appointment cancelled successfully:', appointmentId)
      alert('Appointment cancelled successfully!')
      
      // Refresh appointments to show the updated status
      fetchAppointments()
    } catch (error) {
      console.error('Error in handleCancelAppointment:', error)
      alert('Failed to cancel appointment. Please try again.')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0e1117] to-[#05070d] flex items-center justify-center">
        {/* Background Effects - matching GlobalBackground style */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Subtle Radial Glow - matching homepage style */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,200,0,0.03),_transparent_60%)]"></div>
        </div>
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
          <div className="absolute top-0 left-0 animate-ping">
            <div className="h-16 w-16 rounded-full bg-yellow-400 opacity-20"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0e1117] to-[#05070d] pt-20">
      {/* Background Effects - matching GlobalBackground style */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Subtle Radial Glow - matching homepage style */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,200,0,0.03),_transparent_60%)]"></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#fdce20]/10 to-[#d8b4fe]/10 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#fdce20]/20 rounded-full blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-br from-[#fdce20]/20 to-[#d8b4fe]/20 backdrop-blur-sm border border-[#fdce20]/30 p-3 rounded-full">
                  <Calendar className="w-8 h-8 text-[#fdce20]" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">My Appointments</h1>
                <p className="text-[#d8b4fe] text-sm sm:text-base">Manage all your Appointments at one place </p>
              </div>
            </div>
            <Link 
              href="/dashboard" 
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#fdce20]/20 to-[#d8b4fe]/20 backdrop-blur-sm border border-[#fdce20]/30 rounded-full text-white hover:from-[#fdce20]/30 hover:to-[#d8b4fe]/30 transition-all duration-300 hover:scale-105"
            >
              <ChevronRight className="w-5 h-5 text-[#fdce20] group-hover:rotate-180 transition-transform duration-300" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Cancelled by User */}
          <div className="group relative bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-xl rounded-2xl border border-red-500/20 p-6 hover:from-red-500/15 hover:to-red-600/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-lg opacity-50"></div>
                  <div className="relative bg-red-500/10 backdrop-blur-sm border border-red-500/30 p-3 rounded-full">
                    <X className="w-6 h-6 text-red-400" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{appointments.filter(apt => apt.status === 'cancelled').length}</p>
                  <p className="text-red-300 text-sm">Cancelled by User</p>
                </div>
              </div>
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-red-200">
                {appointments.filter(apt => apt.status === 'cancelled').length > 0 ? `${appointments.filter(apt => apt.status === 'cancelled').length} cancelled` : 'No cancelled'}
              </p>
            </div>
          </div>

          {/* Pending */}
          <div className="group relative bg-gradient-to-br from-[#d8b4fe]/10 to-[#d8b4fe]/15 backdrop-blur-xl rounded-2xl border border-[#d8b4fe]/20 p-6 hover:from-[#d8b4fe]/15 hover:to-[#d8b4fe]/20 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#d8b4fe]/20 rounded-full blur-lg opacity-50"></div>
                  <div className="relative bg-[#d8b4fe]/10 backdrop-blur-sm border border-[#d8b4fe]/30 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-[#d8b4fe]" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{appointments.filter(apt => apt.status === 'pending' || apt.status === 'upcoming').length}</p>
                  <p className="text-[#d8b4fe] text-sm">Pending</p>
                </div>
              </div>
              <Bell className="w-6 h-6 text-[#d8b4fe]" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-[#d8b4fe]">
                {appointments.filter(apt => apt.status === 'pending' || apt.status === 'upcoming').length > 0 ? `${appointments.filter(apt => apt.status === 'pending' || apt.status === 'upcoming').length} pending` : 'No pending'}
              </p>
            </div>
          </div>

          {/* Confirmed */}
          <div className="group relative bg-gradient-to-br from-[#fdce20]/10 to-[#fdce20]/15 backdrop-blur-xl rounded-2xl border border-[#fdce20]/20 p-6 hover:from-[#fdce20]/15 hover:to-[#fdce20]/20 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#fdce20]/20 rounded-full blur-lg opacity-50"></div>
                  <div className="relative bg-[#fdce20]/10 backdrop-blur-sm border border-[#fdce20]/30 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-[#fdce20]" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{appointments.filter(apt => apt.status === 'confirmed').length}</p>
                  <p className="text-[#fdce20] text-sm">Confirmed</p>
                </div>
              </div>
              <CheckCircle className="w-6 h-6 text-[#fdce20]" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-[#fdce20]">
                {appointments.filter(apt => apt.status === 'confirmed').length > 0 ? `${appointments.filter(apt => apt.status === 'confirmed').length} confirmed` : 'No confirmed'}
              </p>
            </div>
          </div>

          {/* Completed */}
          <div className="group relative bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl rounded-2xl border border-green-500/20 p-6 hover:from-green-500/15 hover:to-green-600/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-lg opacity-50"></div>
                  <div className="relative bg-green-500/10 backdrop-blur-sm border border-green-500/30 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{appointments.filter(apt => apt.status === 'completed').length}</p>
                  <p className="text-green-300 text-sm">Completed</p>
                </div>
              </div>
              <Star className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-green-200">
                {appointments.filter(apt => apt.status === 'completed').length > 0 ? `${appointments.filter(apt => apt.status === 'completed').length} completed` : 'No completed'}
              </p>
            </div>
          </div>

          {/* Rejected by Astrologer */}
          <div className="group relative bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-xl rounded-2xl border border-red-500/20 p-6 hover:from-red-500/15 hover:to-red-600/15 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-lg opacity-50"></div>
                  <div className="relative bg-red-500/10 backdrop-blur-sm border border-red-500/30 p-3 rounded-full">
                    <X className="w-6 h-6 text-red-400" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{appointments.filter(apt => apt.status === 'astrologer_rejected').length}</p>
                  <p className="text-red-300 text-sm">Rejected by Astrologer</p>
                </div>
              </div>
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-red-200">
                {appointments.filter(apt => apt.status === 'astrologer_rejected').length > 0 ? `${appointments.filter(apt => apt.status === 'astrologer_rejected').length} rejected` : 'No rejected'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-[#fdce20]/5 to-[#d8b4fe]/5 backdrop-blur-xl rounded-3xl border border-[#fdce20]/20 p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative group">
                <div className="absolute inset-0 bg-[#fdce20]/10 rounded-xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#d8b4fe] z-10" />
                <input
                  type="text"
                  placeholder="Search appointments by expert name or notes..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="relative w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-[#d8b4fe]/20 rounded-xl text-white placeholder-[#d8b4fe]/60 focus:outline-none focus:border-[#fdce20]/50 focus:ring-2 focus:ring-[#fdce20]/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-64">
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-4 py-4 bg-white/5 backdrop-blur-sm border border-[#d8b4fe]/20 rounded-xl text-white focus:outline-none focus:border-[#fdce20]/50 focus:ring-2 focus:ring-[#fdce20]/20 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="all" className="bg-[#0b0f19]">All Status</option>
                <option value="pending" className="bg-[#0b0f19]">Pending</option>
                <option value="confirmed" className="bg-[#0b0f19]">Confirmed</option>
                <option value="completed" className="bg-[#0b0f19]">Completed</option>
                <option value="cancelled" className="bg-[#0b0f19]">Cancelled</option>
                <option value="astrologer_rejected" className="bg-[#0b0f19]">Rejected by Astrologer</option>
                <option value="rescheduled" className="bg-[#0b0f19]">Rescheduled</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value as 'date' | 'status' | 'expert')}
                className="w-full px-4 py-4 bg-white/5 backdrop-blur-sm border border-[#d8b4fe]/20 rounded-xl text-white focus:outline-none focus:border-[#fdce20]/50 focus:ring-2 focus:ring-[#fdce20]/20 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="date" className="bg-[#0b0f19]">Sort by Date</option>
                <option value="status" className="bg-[#0b0f19]">Sort by Status</option>
                <option value="expert" className="bg-[#0b0f19]">Sort by Expert</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="lg:w-32">
              <select
                value={viewMode}
                onChange={(e) => handleViewMode(e.target.value as 'grid' | 'list')}
                className="w-full px-4 py-4 bg-white/5 backdrop-blur-sm border border-[#d8b4fe]/20 rounded-xl text-white focus:outline-none focus:border-[#fdce20]/50 focus:ring-2 focus:ring-[#fdce20]/20 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="grid" className="bg-[#0b0f19]">Grid View</option>
                <option value="list" className="bg-[#0b0f19]">List View</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-xl opacity-50"></div>
              <div className="relative w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 mt-8">No appointments found</h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              {searchTerm ? 'No appointments match your search criteria.' : 'Your appointment history will appear here once you book consultations.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/astrology"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#fdce20] to-[#d8b4fe] text-black rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                <span>Book Consultation</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-8 py-4 bg-gradient-to-r from-[#d8b4fe]/20 to-[#fdce20]/20 backdrop-blur-sm border border-[#d8b4fe]/30 rounded-full text-white hover:from-[#d8b4fe]/30 hover:to-[#fdce20]/30 transition-all duration-300 hover:scale-105"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                onClick={() => handleAppointmentClick(appointment)}
                className={`group relative bg-gradient-to-br from-[#fdce20]/5 to-[#d8b4fe]/5 backdrop-blur-xl rounded-2xl border border-[#d8b4fe]/20 p-6 hover:from-[#fdce20]/10 hover:to-[#d8b4fe]/10 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl ${
                  selectedAppointment?.id === appointment.id ? 'ring-2 ring-[#fdce20]/50 shadow-lg shadow-[#fdce20]/20' : ''
                }`}
              >
                {/* Header */}
                <div className="relative flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {appointment.expert?.avatar_url ? (
                        <img
                          src={appointment.expert.avatar_url}
                          alt={appointment.expert.display_name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d8b4fe]/20 to-[#fdce20]/20 backdrop-blur-sm border border-[#d8b4fe]/30 flex items-center justify-center">
                          <Users className="w-8 h-8 text-[#d8b4fe]" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#fdce20] to-[#d8b4fe] rounded-full border-2 border-white/20 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{appointment.expert?.display_name || 'Expert'}</h3>
                      <p className="text-[#d8b4fe] text-sm">{appointment.expert?.primary_specialization || appointment.expert?.specialization || 'Spiritual Guide'}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    <span>{getStatusText(appointment.status)}</span>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="relative mb-6">
                  <div className="flex items-center gap-3 text-[#d8b4fe]">
                    <Calendar className="w-5 h-5 text-[#fdce20]" />
                    <span className="text-white font-medium">{formatDateTime(appointment.appointment_date, appointment.appointment_time)}</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="relative mb-6">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-bold text-lg">{formatCurrency(appointment.amount_paid)}</span>
                  </div>
                </div>

                {/* Notes */}
                {appointment.notes && (
                  <div className="relative mb-6">
                    <p className="text-sm text-[#d8b4fe] mb-2">Notes:</p>
                    <div className="bg-gradient-to-br from-[#fdce20]/5 to-[#d8b4fe]/5 backdrop-blur-sm border border-[#d8b4fe]/20 rounded-xl p-4">
                      <p className="text-white">{appointment.notes}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {(appointment.status === 'pending' || appointment.status === 'upcoming') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/appointments/${appointment.id}/reschedule`)
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-[#d8b4fe]/20 to-[#fdce20]/20 backdrop-blur-sm border border-[#d8b4fe]/30 text-white rounded-xl hover:from-[#d8b4fe]/30 hover:to-[#fdce20]/30 transition-all duration-300 hover:scale-105"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reschedule
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/appointments/${appointment.id}/edit`)
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#d8b4fe]/20 to-[#fdce20]/20 backdrop-blur-sm border border-[#d8b4fe]/30 text-white rounded-xl hover:from-[#d8b4fe]/30 hover:to-[#fdce20]/30 transition-all duration-300 hover:scale-105"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>

                  {(appointment.status === 'pending' || appointment.status === 'upcoming') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancelAppointment(appointment.id)
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30 text-white rounded-xl hover:from-red-500/30 hover:to-red-600/30 transition-all duration-300 hover:scale-105"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/chat/${appointment.expert_id}`)
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#d8b4fe]/20 to-[#fdce20]/20 backdrop-blur-sm border border-[#d8b4fe]/30 text-white rounded-xl hover:from-[#d8b4fe]/30 hover:to-[#fdce20]/30 transition-all duration-300 hover:scale-105"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                onClick={() => handleAppointmentClick(appointment)}
                className="group relative bg-gradient-to-br from-[#fdce20]/5 to-[#d8b4fe]/5 backdrop-blur-xl rounded-3xl border border-[#d8b4fe]/20 p-8 hover:from-[#fdce20]/10 hover:to-[#d8b4fe]/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#d8b4fe] to-[#fdce20] rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                
                {/* Header */}
                <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {appointment.expert?.avatar_url ? (
                        <img
                          src={appointment.expert.avatar_url}
                          alt={appointment.expert.display_name}
                          className="w-20 h-20 rounded-full object-cover border-3 border-white/30"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#d8b4fe]/20 to-[#fdce20]/20 backdrop-blur-sm border border-[#d8b4fe]/30 flex items-center justify-center">
                          <Users className="w-10 h-10 text-[#d8b4fe]" />
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#fdce20] to-[#d8b4fe] rounded-full border-3 border-white/30 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{appointment.expert?.display_name || 'Expert'}</h3>
                      <p className="text-[#d8b4fe]">{appointment.expert?.primary_specialization || appointment.expert?.specialization || 'Spiritual Guide'}</p>
                    </div>
                  </div>

                  {/* Status & Date */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className={`px-6 py-3 rounded-full text-sm font-medium flex items-center gap-3 ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span>{getStatusText(appointment.status)}</span>
                    </div>
                    <div className="text-[#d8b4fe]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#fdce20]" />
                        <span>{formatDateTime(appointment.appointment_date, appointment.appointment_time)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mt-8">
                  <div className="text-2xl font-bold text-white">
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6 text-[#fdce20]" />
                      <span>{formatCurrency(appointment.amount_paid)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(appointment.status === 'pending' || appointment.status === 'upcoming') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/appointments/${appointment.id}/reschedule`)
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reschedule
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/appointments/${appointment.id}/edit`)
                      }}
                      className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>

                    {(appointment.status === 'pending' || appointment.status === 'upcoming') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCancelAppointment(appointment.id)
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {appointment.notes && (
                  <div className="relative mt-8">
                    <p className="text-sm text-purple-200 mb-3">Notes:</p>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                      <p className="text-white">{appointment.notes}</p>
                    </div>
                  </div>
                )}

                {/* Meeting Link */}
                {appointment.meeting_link && appointment.status === 'confirmed' && (
                  <div className="relative mt-8">
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
                      <div className="flex items-center gap-4">
                        <Video className="w-6 h-6 text-blue-400" />
                        <a
                          href={appointment.meeting_link}
                          target="_blank"
                          className="text-blue-400 hover:text-blue-300 font-medium underline text-lg"
                        >
                          Join Meeting
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
