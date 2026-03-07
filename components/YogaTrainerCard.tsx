import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Users, Star, Clock, CheckCircle, MessageCircle, Phone, Calendar, User, MapPin, DollarSign, X } from 'lucide-react'

interface YogaTrainerCardProps {
  trainer: {
    id: string
    display_name: string
    avatar_url: string
    bio: string
    experience_years: number
    price_per_minute: number
    hourly_rate: number
    specialties: string[]
    is_profile_complete: boolean
    is_online: boolean
    modes: string[]
    created_at?: string
    updated_at?: string
  }
}

export default function YogaTrainerCard({ trainer }: YogaTrainerCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationData, setConfirmationData] = useState<any>(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleBookAppointment = async () => {
    if (!user?.id || !selectedDate || !selectedTime) {
      alert('Please select date and time for appointment')
      return
    }

    try {
      // Check wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from("user_wallet")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle()

      if (walletError || !wallet) {
        throw new Error('Unable to fetch wallet balance')
      }

      // Show confirmation modal with wallet balance
      setConfirmationData({
        expert: trainer,
        date: selectedDate,
        time: selectedTime,
        notes: notes,
        cost: trainer.hourly_rate,
        walletBalance: wallet.balance,
        hasSufficientBalance: wallet.balance >= trainer.hourly_rate
      })
      setShowConfirmationModal(true)
      
    } catch (error: any) {
      console.error('Error preparing appointment confirmation:', error)
      alert(`Failed to prepare appointment: ${error.message}`)
    }
  }

  const handleConfirmAppointment = async () => {
    if (!confirmationData || !user) return

    try {
      setLoading('appointment')
      
      // Create appointment with pending status
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          expert_id: confirmationData.expert?.id || '',
          service_category: 'yoga',
          appointment_date: confirmationData.date,
          appointment_time: confirmationData.time,
          duration_minutes: 60,
          amount_paid: confirmationData.cost,
          hourly_rate: confirmationData.cost,
          status: 'pending',
          payment_status: 'pending',
          notes: confirmationData.notes
        })
        .select()
        .single()

      if (appointmentError) {
        throw new Error(appointmentError.message)
      }

      // Create notification for trainer
      try {
        console.log('=== DEBUG: Sending notification to trainer ===')
        const notificationResponse = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            expert_id: confirmationData.expert?.id || '',
            user_id: user.id,
            type: 'appointment_request',
            message: `New appointment request by ${user?.email || 'user'} for ${confirmationData.date} at ${confirmationData.time}`,
            appointment_id: appointment.id
          })
        })

        const notificationData = await notificationResponse.json()
        console.log('Notification response:', notificationData)

        if (notificationResponse.ok && notificationData.success) {
          console.log('✅ Notification sent to trainer successfully')
          if (notificationData.warning) {
            console.log('⚠️ Notification warning:', notificationData.warning)
          }
        } else {
          console.error('❌ Failed to send notification to trainer')
          console.error('Response status:', notificationResponse.status)
          console.error('Response data:', notificationData)
        }
      } catch (notificationError) {
        console.error('Error sending notification to trainer:', notificationError)
      }

      // Close confirmation modal
      setShowConfirmationModal(false)
      setConfirmationData(null)
      setSelectedDate('')
      setSelectedTime('')
      setNotes('')
      
      alert('Appointment request sent! Waiting for expert confirmation.')
      
    } catch (error: any) {
      console.error('Appointment booking error:', error)
      alert(`Failed to book appointment: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  // Generate time slots for selected date with better UX
  const generateTimeSlots = () => {
    const slots: Array<{
      value: string;
      display: string;
      period: string;
    }> = []
    const periods = [
      { label: 'Morning', start: 6, end: 11 },
      { label: 'Afternoon', start: 12, end: 16 },
      { label: 'Evening', start: 17, end: 21 }
    ]
    
    periods.forEach(period => {
      for (let hour = period.start; hour <= period.end; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
          const ampm = hour < 12 ? 'AM' : 'PM'
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          const displayTime = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`
          slots.push({
            value: time,
            display: displayTime,
            period: period.label
          })
        }
      }
    })
    
    return slots
  }

  const timeSlots = generateTimeSlots()

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
      {/* Header - Avatar, Name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center overflow-hidden">
            {trainer.avatar_url ? (
              <img 
                src={trainer.avatar_url} 
                alt={trainer.display_name} 
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to emoji if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl">🧘</span>';
                }}
              />
            ) : (
              <span className="text-2xl">🧘</span>
            )}
          </div>
          {trainer.is_online && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white/10"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">{trainer.display_name}</h3>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-[#fdce20] fill-[#fdce20]" />
              ))}
            </div>
            <span className="text-purple-400 font-semibold">5.0</span>
          </div>
          <p className="text-gray-300 text-sm line-clamp-2 break-words">{trainer.bio}</p>
        </div>
      </div>

      {/* Specialties */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {trainer.specialties.map((specialty, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Experience & Location */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{trainer.experience_years} years exp.</span>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <h4 className="text-sm font-medium text-white/80 mb-1">Per Minute</h4>
          <p className="text-xl font-bold text-[#fdce20]">{formatPrice(trainer.price_per_minute)}</p>
        </div>
        <div className="text-center">
          <h4 className="text-sm font-medium text-white/80 mb-1">Per Hour</h4>
          <p className="text-xl font-bold text-[#fdce20]">{formatPrice(trainer.hourly_rate)}</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="space-y-3">
        <button 
          onClick={() => setShowAppointmentModal(true)}
          disabled={loading === 'appointment'}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#fdce20] to-amber-500 text-black font-semibold hover:from-[#fdce20]/90 hover:to-amber-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading === 'appointment' ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Booking...
            </>
          ) : (
            <>
              <Calendar size={16} />
              Book & Pay
            </>
          )}
        </button>
      </div>

      {/* Appointment Booking Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f172a] rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-serif text-white">Book Yoga Session</h3>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Trainer Info */}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full flex items-center justify-center">
                {trainer.avatar_url ? (
                  <img src={trainer.avatar_url} alt={trainer.display_name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-purple-400" />
                )}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{trainer.display_name}</p>
                <p className="text-white/60 text-xs">Yoga Instructor</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fdce20]/50 focus:border-[#fdce20]"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Select Time</label>
                <div className="space-y-3">
                  {['Morning', 'Afternoon', 'Evening'].map((period) => (
                    <div key={period} className="space-y-2">
                      <h4 className="text-xs font-semibold text-[#fdce20] uppercase tracking-wide">{period}</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots
                          .filter(slot => slot.period === period)
                          .map((slot) => (
                            <button
                              key={slot.value}
                              type="button"
                              onClick={() => setSelectedTime(slot.value)}
                              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                                selectedTime === slot.value
                                  ? 'bg-[#fdce20] text-black'
                                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {slot.display}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTime && (
                  <div className="mt-3 p-2 bg-[#fdce20]/10 rounded-lg">
                    <p className="text-sm text-[#fdce20] font-medium">
                      Selected: {timeSlots.find(s => s.value === selectedTime)?.display}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What would you like to focus on?"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#fdce20]/50 focus:border-[#fdce20] resize-none"
                  rows={2}
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBookAppointment}
                disabled={loading === 'appointment' || !selectedDate || !selectedTime}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#fdce20] to-amber-500 text-black rounded-lg hover:from-[#fdce20]/90 hover:to-amber-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading === 'appointment' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Booking...
                  </>
                ) : (
                  'Book Session'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && confirmationData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f172a] rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-serif text-white">Confirm Appointment</h3>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Appointment Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-[#fdce20]/20 to-amber-500/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#fdce20]" />
                </div>
                <div>
                  <div className="font-medium text-white">{confirmationData.expert.display_name}</div>
                  <div className="text-sm text-white/60">{confirmationData.service_category}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60">Date & Time</label>
                  <div className="font-medium text-white">
                    {confirmationData.date} at {confirmationData.time}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60">Duration</label>
                  <div className="font-medium text-white">
                    60 minutes
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60">Session Cost</label>
                  <div className="font-medium text-[#fdce20]">
                    ₹{confirmationData.cost}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60">Wallet Balance</label>
                  <div className={`font-medium ${confirmationData.hasSufficientBalance ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{confirmationData.walletBalance}
                  </div>
                </div>
              </div>

              {!confirmationData.hasSufficientBalance && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">
                    Insufficient wallet balance. Please add funds to book this appointment.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAppointment}
                disabled={!confirmationData.hasSufficientBalance}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#fdce20] to-amber-500 text-black rounded-lg hover:from-[#fdce20]/90 hover:to-amber-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
