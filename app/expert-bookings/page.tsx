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
  DollarSign,
  ArrowRight,
  Download,
  CalendarDays,
  UserCheck,
  BarChart3,
  Settings,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MoreVertical,
  Copy,
  Mail,
  PhoneCall
} from 'lucide-react'
import Link from 'next/link'

interface Booking {
  id: string
  user_id: string
  expert_id: string
  user_name?: string
  user_email?: string
  booking_date: string
  booking_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'
  amount: number
  notes?: string
  meeting_link?: string
  service_category: string
  created_at: string
  updated_at?: string
}

export default function ExpertBookingsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'amount'>('date')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showAppointmentRequests, setShowAppointmentRequests] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [showQuickActions, setShowQuickActions] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [animatingCard, setAnimatingCard] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
    earnings: 0
  })

  // Add loadExpertData to the loadExpertData function
  useEffect(() => {
    if (user && profile) {
      fetchBookings()
      loadPendingAppointments()
    }
  }, [loading, user, profile])

  // Load pending appointments
  const loadPendingAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('expert_id', user!.id)
        .eq('status', 'upcoming')
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Appointments table not found or error:', error)
        setPendingAppointments([])
        return
      }

      setPendingAppointments(data || [])
    } catch (error) {
      console.error('Error loading pending appointments:', error)
      setPendingAppointments([])
    }
  }

  // Handle accept appointment
  const handleAcceptAppointment = async (appointmentId: string) => {
    try {
      console.log('=== DEBUG: Accepting appointment ===', appointmentId)
      
      // First try to update in appointments table
      let { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'confirmed'
        })
        .eq('id', appointmentId)
        .eq('expert_id', user?.id)

      // If appointments table update fails, try bookings table
      if (error) {
        console.log('=== DEBUG: Appointments table update failed, trying bookings table ===', error)
        
        const { error: bookingsError } = await supabase
          .from('bookings')
          .update({ 
            status: 'confirmed'
          })
          .eq('id', appointmentId)
          .eq('expert_id', user?.id)

        if (bookingsError) {
          console.error('Error accepting appointment in both tables:', bookingsError)
          alert('Failed to accept appointment. Please try again.')
          return
        }
      }

      // Remove from pending appointments
      setPendingAppointments(prev => prev.filter((apt: any) => apt.id !== appointmentId))
      
      // Show success message
      console.log('✅ Appointment accepted successfully:', appointmentId)
      alert('Appointment accepted successfully! The user will be notified.')
      
      // Refresh bookings to show the updated appointment
      fetchBookings()
    } catch (error) {
      console.error('Error in handleAcceptAppointment:', error)
      alert('Failed to accept appointment. Please try again.')
    }
  }

  // Handle reject appointment
  const handleRejectAppointment = async (appointmentId: string) => {
    try {
      console.log('=== DEBUG: Rejecting appointment ===', appointmentId)
      
      // Try to update both tables to ensure consistency
      const { error: appointmentsError } = await supabase
        .from('appointments')
        .update({ 
          status: 'rejected'
        })
        .eq('id', appointmentId)
        .eq('expert_id', user?.id)

      console.log('=== DEBUG: Appointments table update result ===', { appointmentsError })

      const { error: bookingsError } = await supabase
        .from('bookings')
          .update({ 
            status: 'rejected'
          })
          .eq('id', appointmentId)
          .eq('expert_id', user?.id)

      console.log('=== DEBUG: Bookings table update result ===', { bookingsError })

      // If both updates fail, show error
      if (appointmentsError && bookingsError) {
        console.error('Error rejecting appointment in both tables:', { appointmentsError, bookingsError })
        alert('Failed to reject appointment. Please try again.')
        return
      }

      // Remove from pending appointments
      setPendingAppointments(prev => prev.filter((apt: any) => apt.id !== appointmentId))
      
      // Show success message
      console.log('❌ Appointment rejected successfully:', appointmentId)
      alert('Appointment rejected. The user will be notified.')
      
      // Force refresh bookings to show updated appointment
      await fetchBookings()
    } catch (error) {
      console.error('Error in handleRejectAppointment:', error)
      alert('Failed to reject appointment. Please try again.')
    }
  }

  // Real-time subscription for both bookings and appointments
  useEffect(() => {
    if (!user) return

    // Subscribe to bookings table changes
    const bookingSubscription = supabase
      .channel('expert_bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `expert_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Booking change received:', payload)
          fetchBookings()
        }
      )
      .subscribe()

    // Subscribe to appointments table changes
    const appointmentSubscription = supabase
      .channel('expert_appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `expert_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Appointment change received:', payload)
          fetchBookings()
          loadPendingAppointments()
        }
      )
      .subscribe()

    return () => {
      bookingSubscription.unsubscribe()
      appointmentSubscription.unsubscribe()
    }
  }, [user])

  const fetchBookings = async () => {
    try {
      console.log('=== DEBUG: Fetching Expert Bookings ===')
      console.log('=== DEBUG: User ID ===', user?.id)
      console.log('=== DEBUG: User Email ===', user?.email)
      
      // DEBUG: Check what expert_ids exist in bookings table
      const { data: allBookings, error: allBookingsError } = await supabase
        .from('bookings')
        .select('expert_id')
        .limit(10)

      console.log('=== DEBUG: All expert_ids in bookings ===', allBookings?.map(b => b.expert_id))
      
      // DEBUG: Check appointments table structure
      const { data: appointmentsSample, error: appointmentsSampleError } = await supabase
        .from('appointments')
        .select('*')
        .limit(1)

      console.log('=== DEBUG: Appointments table structure ===', appointmentsSample?.[0])
      console.log('=== DEBUG: Appointments columns ===', appointmentsSample?.[0] ? Object.keys(appointmentsSample[0]) : 'No data')
      
      // Try to fetch from appointments table first since bookings table is empty
      let { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('expert_id', user!.id)
        .order('created_at', { ascending: false })

      console.log('=== DEBUG: Appointments query result ===', { appointmentsData, error })
      console.log('=== DEBUG: Appointments count ===', appointmentsData?.length || 0)

      if (error) {
        console.log('=== DEBUG: Appointments table error ===', error)
        
        // If appointments table doesn't exist, try bookings table
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.log('=== DEBUG: Trying bookings table instead ===')
          
          const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select('*')
            .eq('expert_id', user!.id)
            .order('created_at', { ascending: false })

          console.log('=== DEBUG: Bookings query result ===', { bookingsData, error })
          console.log('=== DEBUG: Bookings count ===', bookingsData?.length || 0)

          if (bookingsError) {
            console.error('Error fetching bookings:', bookingsError)
            return
          }

          // Transform bookings to appointments format
          const bookingsFromBookings = (bookingsData || []).map(booking => ({
            id: booking.id,
            user_id: booking.user_id,
            expert_id: booking.expert_id,
            booking_date: booking.booking_date,
            booking_time: booking.booking_time,
            status: booking.status,
            amount: booking.amount || 0,
            notes: booking.notes || '',
            meeting_link: booking.meeting_link || '',
            service_category: booking.service_category || 'astrology',
            created_at: booking.created_at,
            updated_at: booking.updated_at
          }))

          console.log('=== DEBUG: Transformed bookings ===', bookingsFromBookings)
          setBookings(bookingsFromBookings)
          return
        }

        console.error('Error fetching appointments:', error)
        return
      }

      // Transform appointments to bookings format
      const bookingsFromAppointments = (appointmentsData || []).map(apt => ({
        id: apt.id,
        user_id: apt.user_id,
        expert_id: apt.expert_id,
        booking_date: apt.appointment_date,
        booking_time: apt.appointment_time,
        status: apt.status,
        amount: apt.amount_paid || 0,
        notes: apt.notes || '',
        meeting_link: apt.meeting_link || '',
        service_category: apt.service_category || 'astrology',
        created_at: apt.created_at,
        updated_at: apt.updated_at
      }))

      console.log('=== DEBUG: Transformed appointments ===', bookingsFromAppointments)
      setBookings(bookingsFromAppointments)
      
    } catch (error) {
      console.error('Error in fetchBookings:', error)
    }
  }

  useEffect(() => {
    // Calculate stats
    const newStats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending' || (b as any).status === 'upcoming').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      rejected: bookings.filter(b => b.status === 'rejected' || (b as any).status === 'astrologer_rejected').length,
      earnings: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.amount || 0), 0)
    }
    setStats(newStats)

    // Filter bookings
    let filtered = bookings

    // Apply status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'rejected') {
        // Handle both 'rejected' and 'astrologer_rejected' for backward compatibility
        filtered = filtered.filter(booking => booking.status === 'rejected' || (booking as any).status === 'astrologer_rejected')
      } else if (selectedStatus === 'pending') {
        // Handle both 'pending' and 'upcoming' for backward compatibility
        filtered = filtered.filter(booking => booking.status === 'pending' || (booking as any).status === 'upcoming')
      } else {
        filtered = filtered.filter(booking => booking.status === selectedStatus)
      }
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service_category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status)
      } else if (sortBy === 'amount') {
        return (b.amount || 0) - (a.amount || 0)
      }
      return 0
    })

    setFilteredBookings(filtered)
  }, [bookings, selectedStatus, searchTerm, sortBy])

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status)
  }

  const handleSort = (sort: 'date' | 'status' | 'amount') => {
    setSortBy(sort)
  }

  const handleViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode)
  }

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking)
  }

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      console.log('=== DEBUG: Updating booking status ===', bookingId, newStatus)
      
      // Convert 'rejected' to 'astrologer_rejected' for clarity
      const appointmentsStatus = newStatus === 'rejected' ? 'astrologer_rejected' : newStatus
      
      // First try to update in bookings table
      let { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus
        })
        .eq('id', bookingId)
        .eq('expert_id', user?.id)

      // If bookings table update fails, try appointments table
      if (error) {
        console.log('=== DEBUG: Bookings table update failed, trying appointments table ===', error)
        
        const { error: appointmentsError } = await supabase
          .from('appointments')
          .update({ 
            status: appointmentsStatus
          })
          .eq('id', bookingId)
          .eq('expert_id', user?.id)

        if (appointmentsError) {
          console.error('Error updating booking status in both tables:', appointmentsError)
          alert('Failed to update booking status. Please try again.')
          return
        }
      }

      console.log(`✅ Booking status updated to ${newStatus}:`, bookingId)
      alert(`Booking ${newStatus} successfully!`)
      
      // Refresh data to show the updated booking
      fetchBookings()
      loadPendingAppointments()
    } catch (error) {
      console.error('Error in handleUpdateStatus:', error)
      alert('Failed to update booking status. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      case 'confirmed': return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'completed': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border border-red-500/30'
      case 'rejected': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
      case 'astrologer_rejected': return 'bg-red-600/20 text-red-400 border border-red-600/30'
      default: return 'bg-white/10 text-white border border-white/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <X className="w-4 h-4" />
      case 'rejected': return <X className="w-4 h-4" />
      case 'astrologer_rejected': return <X className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const bookingDate = new Date(date)
    const bookingTime = new Date(`2000-01-01T${time}`)
    
    const combinedDateTime = new Date(
      bookingDate.getFullYear(),
      bookingDate.getMonth(),
      bookingDate.getDate(),
      bookingTime.getHours(),
      bookingTime.getMinutes()
    )

    return combinedDateTime.toLocaleString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  // User-friendly helper functions
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(type)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      await fetchBookings()
      await loadPendingAppointments()
    } finally {
      setIsLoading(false)
    }
  }

  const exportBookings = () => {
    const csvContent = [
      ['User Name', 'Email', 'Date', 'Time', 'Status', 'Amount', 'Service'],
      ...filteredBookings.map(b => [
        b.user_name || 'N/A',
        b.user_email || 'N/A',
        b.booking_date,
        b.booking_time,
        b.status,
        b.amount?.toString() || '0',
        b.service_category || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUpRight className="w-4 h-4 text-green-400" />
    if (current < previous) return <ArrowDownRight className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const animateCardAction = (cardId: string, action: () => void) => {
    setAnimatingCard(cardId)
    action()
    setTimeout(() => setAnimatingCard(null), 500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0e1117] to-[#05070d] flex items-center justify-center">
        <div className="relative">
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
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,200,0,0.03),_transparent_60%)]"></div>
      </div>

      {/* Header */}
      <div className="relative bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-lg opacity-50"></div>
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-full">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">My Bookings</h1>
                <p className="text-gray-300 text-sm sm:text-base">Manage all your booking requests and appointments</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="group relative px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onMouseEnter={() => setShowTooltip('refresh')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'}`} />
                </button>
                {showTooltip === 'refresh' && (
                  <div className="absolute top-full mt-2 right-0 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50">
                    Refresh Data
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  onClick={exportBookings}
                  disabled={filteredBookings.length === 0}
                  className="group relative px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onMouseEnter={() => setShowTooltip('export')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-300" />
                </button>
                {showTooltip === 'export' && (
                  <div className="absolute top-full mt-2 right-0 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50">
                    Export to CSV
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  className="group relative px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/15 transition-all duration-300"
                  onMouseEnter={() => setShowTooltip('help')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </button>
                {showTooltip === 'help' && (
                  <div className="absolute top-full mt-2 right-0 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50">
                    Help & Tips
                  </div>
                )}
              </div>
              
              <Link 
                href="/expert-dashboard" 
                className="group flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/15 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            </div>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
              <UserCheck className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">{stats.pending} Pending</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">{stats.confirmed} Confirmed</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">{formatCurrency(stats.earnings)} Earned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Requests Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-yellow-400 w-6 h-6" />
                <h2 className="text-xl font-semibold text-white">
                  Appointment Requests
                </h2>
                {pendingAppointments.length > 0 && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                    {pendingAppointments.length} New
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowAppointmentRequests(!showAppointmentRequests)}
                className="text-white/60 hover:text-white transition-colors"
              >
                {showAppointmentRequests ? 'Hide' : 'Show'} Details
              </button>
            </div>
            
            {showAppointmentRequests && (
              <div className="space-y-4">
                {pendingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">No new appointment requests</p>
                    <p className="text-white/40 text-sm mt-2">New appointment requests will appear here</p>
                  </div>
                ) : (
                  pendingAppointments.map((appointment: any) => (
                    <div key={appointment.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                              <Users className="w-6 h-6 text-white/60" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {appointment.user_name || 'User'}
                              </h3>
                              <p className="text-white/60 text-sm">
                                Requested: {new Date(appointment.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          {/* Appointment Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-white/60">Date & Time</span>
                              </div>
                              <p className="text-white font-medium">
                                {formatDateTime(appointment.appointment_date, appointment.appointment_time)}
                              </p>
                            </div>
                            
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-white/60">Amount</span>
                              </div>
                              <p className="text-white font-medium">
                                {formatCurrency(appointment.amount_paid || 0)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Notes */}
                          {appointment.notes && (
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-white/60">User Notes</span>
                              </div>
                              <p className="text-white">{appointment.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-col gap-3 lg:w-48">
                          <button
                            onClick={() => handleAcceptAppointment(appointment.id)}
                            className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Accept Request
                          </button>
                          <button
                            onClick={() => handleRejectAppointment(appointment.id)}
                            className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Reject Request
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total */}
          <div 
            className="group relative bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
            onClick={() => handleStatusFilter('all')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="text-yellow-400 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-white">{stats.total}</span>
                  {getTrendIcon(stats.total, 0)}
                </div>
              </div>
              <p className="text-gray-300 text-xs">Total</p>
              <div className="mt-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                All time bookings
              </div>
            </div>
          </div>
          
          {/* Pending */}
          <div 
            className="group relative bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
            onClick={() => handleStatusFilter('pending')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-yellow-400 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-white">{stats.pending}</span>
                  {stats.pending > 0 && <Bell className="w-3 h-3 text-yellow-400 animate-pulse" />}
                </div>
              </div>
              <p className="text-gray-300 text-xs">Pending</p>
              <div className="mt-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Awaiting action
              </div>
            </div>
          </div>
          
          {/* Confirmed */}
          <div 
            className="group relative bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
            onClick={() => handleStatusFilter('confirmed')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-green-400 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-white">{stats.confirmed}</span>
                  {getTrendIcon(stats.confirmed, 0)}
                </div>
              </div>
              <p className="text-gray-300 text-xs">Confirmed</p>
              <div className="mt-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Scheduled sessions
              </div>
            </div>
          </div>
          
          {/* Completed */}
          <div 
            className="group relative bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
            onClick={() => handleStatusFilter('completed')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-blue-400 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-white">{stats.completed}</span>
                  {getTrendIcon(stats.completed, 0)}
                </div>
              </div>
              <p className="text-gray-300 text-xs">Completed</p>
              <div className="mt-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Finished sessions
              </div>
            </div>
          </div>
          
          {/* Cancelled */}
          <div 
            className="group relative bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
            onClick={() => handleStatusFilter('cancelled')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <X className="text-red-400 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-white">{stats.cancelled}</span>
                  {getTrendIcon(stats.cancelled, 0)}
                </div>
              </div>
              <p className="text-gray-300 text-xs">Cancelled</p>
              <div className="mt-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Cancelled by user
              </div>
            </div>
          </div>
          
          {/* Rejected */}
          <div 
            className="group relative bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
            onClick={() => handleStatusFilter('rejected')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <X className="text-red-400 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-white">{stats.rejected}</span>
                  {getTrendIcon(stats.rejected, 0)}
                </div>
              </div>
              <p className="text-gray-300 text-xs">Rejected</p>
              <div className="mt-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Rejected by expert
              </div>
            </div>
          </div>
          
          {/* Earnings */}
          <div 
            className="group relative bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
            onClick={() => handleStatusFilter('completed')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-yellow-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="text-green-400 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold text-white">{formatCurrency(stats.earnings)}</span>
                  {stats.earnings > 0 && <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />}
                </div>
              </div>
              <p className="text-gray-300 text-xs">Earnings</p>
              <div className="mt-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Total revenue
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Search bookings by user name, email, or notes..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="relative w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-4 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="all" className="bg-[#0b0f19]">All Status</option>
                <option value="pending" className="bg-[#0b0f19]">Pending</option>
                <option value="confirmed" className="bg-[#0b0f19]">Confirmed</option>
                <option value="completed" className="bg-[#0b0f19]">Completed</option>
                <option value="cancelled" className="bg-[#0b0f19]">Cancelled</option>
                <option value="rejected" className="bg-[#0b0f19]">Rejected</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value as 'date' | 'status' | 'amount')}
                className="w-full px-4 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="date" className="bg-[#0b0f19]">Sort by Date</option>
                <option value="status" className="bg-[#0b0f19]">Sort by Status</option>
                <option value="amount" className="bg-[#0b0f19]">Sort by Amount</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="lg:w-32">
              <select
                value={viewMode}
                onChange={(e) => handleViewMode(e.target.value as 'grid' | 'list')}
                className="w-full px-4 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10 transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="grid" className="bg-[#0b0f19]">Grid View</option>
                <option value="list" className="bg-[#0b0f19]">List View</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-xl opacity-50"></div>
              <div className="relative w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 mt-8">No bookings found</h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              {searchTerm ? 'No bookings match your search criteria.' : 'Your booking history will appear here once users book consultations.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => handleBookingClick(booking)}
                className={`group relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer ${
                  animatingCard === booking.id ? 'scale-95 opacity-50' : 'hover:scale-[1.02]'
                }`}
              >
                {/* Header */}
                <div className="relative flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-6 h-6 text-white/60" />
                      </div>
                      {booking.status === 'pending' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-yellow-400 transition-colors duration-300">
                        {booking.user_name || 'User'}
                      </h3>
                      <p className="text-gray-300 text-sm">{booking.user_email || 'No email'}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${getStatusColor(booking.status)} group-hover:scale-105 transition-transform duration-300`}>
                    {getStatusIcon(booking.status)}
                    <span className="capitalize">{booking.status}</span>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors duration-300">
                    <Calendar className="w-4 h-4 text-white/60 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm">{formatDateTime(booking.booking_date, booking.booking_time)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors duration-300">
                    <DollarSign className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">{formatCurrency(booking.amount || 0)}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors duration-300">
                    <Star className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm capitalize">{booking.service_category || 'astrology'}</span>
                  </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <div className="relative mb-6">
                    <p className="text-sm text-gray-300 mb-2 group-hover:text-white transition-colors duration-300">Notes:</p>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 group-hover:bg-white/10 transition-colors duration-300">
                      <p className="text-white text-sm">{booking.notes}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          animateCardAction(booking.id, () => handleUpdateStatus(booking.id, 'confirmed'))
                        }}
                        className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 text-sm font-medium hover:scale-105 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          animateCardAction(booking.id, () => handleUpdateStatus(booking.id, 'rejected'))
                        }}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 text-sm font-medium hover:scale-105 disabled:opacity-50"
                      >
                        <X className="w-4 h-4 inline mr-1" />
                        Reject
                      </button>
                    </>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        animateCardAction(booking.id, () => handleUpdateStatus(booking.id, 'completed'))
                      }}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 text-sm font-medium hover:scale-105 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Complete
                    </button>
                  )}

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowQuickActions(showQuickActions === booking.id ? null : booking.id)
                      }}
                      className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/15 transition-all duration-300 text-sm font-medium hover:scale-105"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {showQuickActions === booking.id && (
                      <div className="absolute top-full mt-2 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[150px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(booking.user_email || '', 'email')
                          }}
                          className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          {copiedText === 'email' ? 'Copied!' : 'Copy Email'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/chat/${booking.user_id}`)
                          }}
                          className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => handleBookingClick(booking)}
                className="group relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <Users className="w-8 h-8 text-white/60" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{booking.user_name || 'User'}</h3>
                      <p className="text-gray-300">{booking.user_email || 'No email'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-3 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="capitalize">{booking.status}</span>
                    </div>
                    <div className="text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateTime(booking.booking_date, booking.booking_time)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mt-8">
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-3 text-gray-300">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <span className="text-white font-bold text-lg">{formatCurrency(booking.amount || 0)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="text-white capitalize">{booking.service_category || 'astrology'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpdateStatus(booking.id, 'confirmed')
                          }}
                          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpdateStatus(booking.id, 'rejected')
                          }}
                          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUpdateStatus(booking.id, 'completed')
                        }}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                      >
                        Mark Complete
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/chat/${booking.user_id}`)
                      }}
                      className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/15 transition-colors font-medium"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </button>
                  </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <div className="relative mt-8">
                    <p className="text-sm text-gray-300 mb-3">Notes:</p>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                      <p className="text-white">{booking.notes}</p>
                    </div>
                  </div>
                )}

                {/* Meeting Link */}
                {booking.meeting_link && booking.status === 'confirmed' && (
                  <div className="relative mt-8">
                    <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
                      <div className="flex items-center gap-4">
                        <Video className="w-6 h-6 text-blue-400" />
                        <a
                          href={booking.meeting_link}
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
