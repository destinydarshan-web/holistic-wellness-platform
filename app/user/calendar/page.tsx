'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  MessageCircle, 
  Video, 
  Phone,
  DollarSign,
  Filter,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface Appointment {
  id: string
  user_id: string
  expert_id: string
  service_category: string
  appointment_date: string
  appointment_time: string
  status: string
  amount_paid: number
  hourly_rate: number
  created_at: string
  expert_name?: string
  expert_email?: string
  session_type?: string
}

interface CalendarDay {
  date: Date
  appointments: Appointment[]
  isCurrentMonth: boolean
  isToday: boolean
}

export default function UserCalendar() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }

      if (!profile || profile.role !== 'user') {
        router.push('/dashboard')
        return
      }

      loadAppointments()
    }
  }, [user, profile, loading, router])

  const loadAppointments = async () => {
    try {
      setLoadingData(true)
      console.log('=== DEBUG: Loading User Calendar Data ===')
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user?.id)
        .order('appointment_date', { ascending: true })

      if (error) {
        console.error('Error loading appointments:', error)
      } else {
        console.log('Appointments loaded:', data?.length || 0)
        
        // Enrich appointments with expert data
        const enrichedAppointments = await Promise.all(
          (data || []).map(async (appointment: Appointment) => {
            if (appointment.expert_id) {
              const { data: expertData } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', appointment.expert_id)
                .maybeSingle()

              return {
                ...appointment,
                expert_name: expertData?.full_name || 'Unknown Expert',
                expert_email: expertData?.email || 'unknown@example.com'
              }
            }
            return appointment
          })
        )

        setAppointments(enrichedAppointments)
      }
    } catch (error) {
      console.error('Error in loadAppointments:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: CalendarDay[] = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthLastDay = new Date(year, month, 0).getDate()
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - startingDayOfWeek + i + 1),
        appointments: [],
        isCurrentMonth: false,
        isToday: false
      })
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      // Fixed: Use local date string instead of ISO to avoid timezone issues
      const dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
      
      const dayAppointments = appointments.filter(apt => {
        // Fixed: Use same date string format
        const aptDate = new Date(apt.appointment_date).getFullYear() + '-' + String(new Date(apt.appointment_date).getMonth() + 1).padStart(2, '0') + '-' + String(new Date(apt.appointment_date).getDate()).padStart(2, '0')
        return aptDate === dateStr
      })
      
      const isToday = date.toDateString() === new Date().toDateString()

      days.push({
        date,
        appointments: dayAppointments,
        isCurrentMonth: true,
        isToday
      })
    }

    // Add empty cells for days after month ends
    const remainingCells = 42 - days.length // 6 weeks * 7 days
    for (let i = 0; i < remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i + 1),
        appointments: [],
        isCurrentMonth: false,
        isToday: false
      })
    }

    return days
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString()
  }

  const getAppointmentsForDate = (date: Date) => {
    // Fixed: Use local date string format for consistent comparison
    const dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
    return appointments.filter(apt => {
      // Fixed: Use same date string format
      const aptDate = new Date(apt.appointment_date).getFullYear() + '-' + String(new Date(apt.appointment_date).getMonth() + 1).padStart(2, '0') + '-' + String(new Date(apt.appointment_date).getDate()).padStart(2, '0')
      return aptDate === dateStr
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getSessionIcon = (type?: string) => {
    switch (type) {
      case 'chat':
        return <MessageCircle className="w-4 h-4" />
      case 'video':
        return <Video className="w-4 h-4" />
      case 'phone':
        return <Phone className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'astrology':
        return <Calendar className="w-4 h-4" />
      case 'counselling':
        return <Users className="w-4 h-4" />
      case 'yoga':
        return <Users className="w-4 h-4" />
      case 'meditation':
        return <Users className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowAppointmentModal(true)
  }

  const filteredAppointments = appointments.filter(apt => {
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false
    return true
  })

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthDays = getDaysInMonth(currentDate)
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F14]">
        <div className="text-white">Loading calendar...</div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect
  }

  return (
    <div className="pt-24 py-8 bg-[#0F0F14] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard"
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Calendar</h1>
              <p className="text-white/60">View and manage your appointments</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <h2 className="text-xl font-semibold text-white">{monthYear}</h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-[#fdce20] text-black rounded-lg hover:bg-amber-400 transition-colors font-medium"
              >
                Today
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#fdce20]"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6 mb-8">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center">
                <p className="text-sm font-medium text-white/60">{day}</p>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day, index) => (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2 rounded-lg border transition-all cursor-pointer
                  ${day.isCurrentMonth ? 'bg-white/5 border-white/10' : 'bg-white/5 border-transparent opacity-50'}
                  ${day.isToday ? 'border-[#fdce20] bg-[#fdce20]/10' : ''}
                  ${selectedDate && isSameDay(day.date, selectedDate) ? 'border-[#fdce20] bg-[#fdce20]/10' : ''}
                  hover:bg-white/10
                `}
                onClick={() => setSelectedDate(day.date)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium ${day.isToday ? 'text-[#fdce20]' : 'text-white'}`}>
                    {day.date.getDate()}
                  </span>
                  {day.appointments.length > 0 && (
                    <span className="bg-[#fdce20] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {day.appointments.length}
                    </span>
                  )}
                </div>
                
                {/* Appointment Indicators */}
                <div className="space-y-1">
                  {day.appointments.slice(0, 2).map((apt, idx) => (
                    <div
                      key={apt.id}
                      className={`text-xs p-1 rounded border ${getStatusColor(apt.status)} truncate`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAppointmentClick(apt)
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {getSessionIcon(apt.session_type)}
                        <span>{apt.appointment_time}</span>
                      </div>
                    </div>
                  ))}
                  {day.appointments.length > 2 && (
                    <div className="text-xs text-white/60 text-center">
                      +{day.appointments.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <div className="space-y-3">
              {getAppointmentsForDate(selectedDate).length > 0 ? (
                getAppointmentsForDate(selectedDate).map(appointment => (
                  <div
                    key={appointment.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${getStatusColor(appointment.status)}`}>
                          {getSessionIcon(appointment.session_type)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{appointment.expert_name}</p>
                          <p className="text-sm text-white/60">{appointment.service_category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{appointment.appointment_time}</p>
                        <p className="text-sm text-white/60">₹{appointment.amount_paid}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/60 text-center py-8">No appointments scheduled for this date</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Appointment Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6 max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Appointment Details</h3>
              <button
                onClick={() => {
                  setShowAppointmentModal(false)
                  setSelectedAppointment(null)
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Appointment Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-lg font-semibold text-white">
                    {selectedAppointment.expert_name}
                  </div>
                  <div className="text-sm text-white/60">
                    {selectedAppointment.service_category}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60">Date</label>
                  <div className="font-medium text-white">
                    {selectedAppointment.appointment_date}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60">Time</label>
                  <div className="font-medium text-white">
                    {selectedAppointment.appointment_time}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60">Expert</label>
                <div className="font-medium text-white">
                  {selectedAppointment.expert_name}
                </div>
                <div className="text-sm text-white/60">
                  {selectedAppointment.expert_email}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60">Status</label>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status === 'confirmed' && <CheckCircle className="w-4 h-4" />}
                    {selectedAppointment.status === 'cancelled' && <X className="w-4 h-4" />}
                    {selectedAppointment.status === 'pending' && <AlertCircle className="w-4 h-4" />}
                    {selectedAppointment.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                    {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60">Amount Paid</label>
                  <div className="font-medium text-[#fdce20]">
                    ₹{selectedAppointment.amount_paid}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              {selectedAppointment.status === 'scheduled' && (
                <button
                  onClick={() => {
                    // Handle reschedule/cancel
                    setShowAppointmentModal(false)
                  }}
                  className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Cancel Appointment
                </button>
              )}
              <button
                onClick={() => {
                  setShowAppointmentModal(false)
                  setSelectedAppointment(null)
                }}
                className="flex-1 px-4 py-2 bg-[#fdce20] text-black rounded-lg hover:bg-[#fdce20]/90 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
