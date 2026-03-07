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
  user_name?: string
  user_email?: string
  session_type?: string
}

interface CalendarDay {
  date: Date
  appointments: Appointment[]
  isCurrentMonth: boolean
  isToday: boolean
}

export default function ExpertCalendar() {
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

      if (!profile || (profile.role !== 'expert' && profile.role !== 'astrologer' && profile.role !== 'counsellor')) {
        router.push('/dashboard')
        return
      }

      loadAppointments()
    }
  }, [user, profile, loading, router])

  const loadAppointments = async () => {
    try {
      setLoadingData(true)
      console.log('=== DEBUG: Loading Expert Calendar Data ===')
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('expert_id', user?.id)
        .order('appointment_date', { ascending: true })

      if (error) {
        console.error('Error loading appointments:', error)
      } else {
        console.log('Appointments loaded:', data?.length || 0)
        
        // Enrich appointments with user data
        const enrichedAppointments = await Promise.all(
          (data || []).map(async (appointment: Appointment) => {
            if (appointment.user_id) {
              const { data: userData } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', appointment.user_id)
                .maybeSingle()
              
              return {
                ...appointment,
                user_name: userData?.full_name || 'Unknown User',
                user_email: userData?.email || 'unknown@example.com'
              }
            }
            return appointment
          })
        )
        
        setAppointments(enrichedAppointments)
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: CalendarDay[] = []

    // Add previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i)
      days.push({
        date: day,
        appointments: [],
        isCurrentMonth: false,
        isToday: isSameDay(day, new Date())
      })
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i)
      const dayAppointments = getAppointmentsForDate(day)
      days.push({
        date: day,
        appointments: dayAppointments,
        isCurrentMonth: true,
        isToday: isSameDay(day, new Date())
      })
    }

    // Add next month's leading days
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i)
      days.push({
        date: day,
        appointments: [],
        isCurrentMonth: false,
        isToday: isSameDay(day, new Date())
      })
    }

    return days
  }

  const getAppointmentsForDate = (date: Date): Appointment[] => {
    // Fixed: Use local date string format for consistent comparison
    const dateStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
    return appointments.filter(apt => {
      if (statusFilter !== 'all' && apt.status !== statusFilter) return false
      // Fixed: Use same date string format
      const aptDate = new Date(apt.appointment_date).getFullYear() + '-' + String(new Date(apt.appointment_date).getMonth() + 1).padStart(2, '0') + '-' + String(new Date(apt.appointment_date).getDate()).padStart(2, '0')
      return aptDate === dateStr
    })
  }

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.toDateString() === date2.toDateString()
  }

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

  const getSessionIcon = (type?: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-3 h-3" />
      case 'voice':
        return <Phone className="w-3 h-3" />
      default:
        return <MessageCircle className="w-3 h-3" />
    }
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

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowAppointmentModal(true)
  }

  const filteredAppointments = appointments.filter(apt => {
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false
    return true
  })

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

  const monthDays = getDaysInMonth(currentDate)
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="pt-24 py-8 bg-[#0F0F14] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/expert-dashboard"
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
                          <p className="font-medium text-white">{appointment.user_name}</p>
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
                <p className="text-white/60 text-center py-8">No appointments scheduled for this day</p>
              )}
            </div>
          </div>
        )}

        {/* Appointment Modal */}
        {showAppointmentModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Appointment Details</h3>
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/60 mb-1">Client</p>
                  <p className="text-white font-medium">{selectedAppointment.user_name}</p>
                  <p className="text-sm text-white/60">{selectedAppointment.user_email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-white/60 mb-1">Service</p>
                  <p className="text-white font-medium">{selectedAppointment.service_category}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Date</p>
                    <p className="text-white font-medium">{new Date(selectedAppointment.appointment_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Time</p>
                    <p className="text-white font-medium">{selectedAppointment.appointment_time}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Status</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(selectedAppointment.status)}`}>
                      <span className="capitalize">{selectedAppointment.status}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Amount</p>
                    <p className="text-white font-medium">₹{selectedAppointment.amount_paid}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Close
                </button>
                {selectedAppointment.status === 'confirmed' && (
                  <Link
                    href={`/session/chat/${selectedAppointment.id}`}
                    className="flex-1 px-4 py-2 bg-[#fdce20] text-black rounded-lg hover:bg-amber-400 transition-colors text-center font-medium"
                  >
                    Start Session
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
