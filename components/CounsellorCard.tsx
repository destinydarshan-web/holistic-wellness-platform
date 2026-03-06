import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Users, Star, Clock, CheckCircle, MessageCircle, Phone, Briefcase, DollarSign, Camera, Upload, AlertCircle, User, MapPin, Calendar } from 'lucide-react'

interface CounsellorCardProps {
  counsellor: {
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

export default function CounsellorCard({ counsellor }: CounsellorCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
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

    setLoading('appointment')
    
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

      if (wallet.balance < counsellor.hourly_rate) {
        alert('Insufficient wallet balance for appointment booking')
        return
      }

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          expert_id: counsellor.id,
          service_category: 'counselling',
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          duration_minutes: 60,
          amount_paid: counsellor.hourly_rate,
          hourly_rate: counsellor.hourly_rate,
          status: 'upcoming',
          payment_status: 'paid',
          notes: notes
        })
        .select()
        .single()

      if (appointmentError) {
        throw new Error(appointmentError.message)
      }

      // Deduct from wallet
      const { error: deductError } = await supabase
        .from('user_wallet')
        .update({ balance: wallet.balance - counsellor.hourly_rate })
        .eq("user_id", user.id)

      if (deductError) {
        throw new Error('Failed to process payment')
      }

      // Create notification for counsellor
        try {
          console.log('=== DEBUG: Sending notification to counsellor ===')
          const notificationResponse = await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              expert_id: counsellor.id,
              user_id: user.id,
              type: 'appointment_booked',
              message: `New appointment booked by ${user.email} for ${selectedDate} at ${selectedTime}`,
              appointment_id: appointment.id
            })
          })

          const notificationData = await notificationResponse.json()
          console.log('Notification response:', notificationData)

          if (notificationResponse.ok && notificationData.success) {
            console.log('✅ Notification sent to counsellor successfully')
            if (notificationData.warning) {
              console.log('⚠️ Notification warning:', notificationData.warning)
            }
          } else {
            console.error('❌ Failed to send notification to counsellor')
            console.error('Response status:', notificationResponse.status)
            console.error('Response data:', notificationData)
          }
        } catch (notificationError) {
          console.error('Error sending notification to counsellor:', notificationError)
        }

        // Create transaction record
      console.log('Creating transaction record...')
      const transactionData = {
        user_id: user.id,
        type: 'debit',
        amount: counsellor.hourly_rate,
        description: `Appointment booking with ${counsellor.display_name} - ${selectedDate} ${selectedTime}`,
        booking_id: appointment.id
      }
      console.log('Transaction data:', transactionData)
      
      const { error: transactionError, data: transactionDataResult } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()

      if (transactionError) {
        console.error('Failed to create transaction record:', transactionError)
        console.error('Transaction error details:', {
          message: transactionError.message,
          details: transactionError.details,
          hint: transactionError.hint,
          code: transactionError.code
        })
        // Don't throw error here, just log it - appointment is still successful
      } else {
        console.log('Transaction record created successfully:', transactionDataResult)
      }

      alert('Appointment booked successfully! Amount deducted from wallet.')
      setShowAppointmentModal(false)
      setSelectedDate('')
      setSelectedTime('')
      setNotes('')
      
    } catch (error: any) {
      console.error('Appointment booking error:', error)
      alert(`Failed to book appointment: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  // Generate time slots for the selected date
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
      {/* Expert Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            {counsellor.avatar_url ? (
              <img src={counsellor.avatar_url} alt={counsellor.display_name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-white/40" />
            )}
          </div>
          {counsellor.is_online && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white/10"></div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{counsellor.display_name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white text-sm">4.8</span>
            </div>
            <span className="text-white/40 text-sm">•</span>
            <span className="text-white text-sm">{counsellor.experience_years} years</span>
            <span className="text-white/40 text-sm">•</span>
            <span className={`text-sm ${counsellor.is_online ? 'text-green-400' : 'text-white/40'}`}>
              {counsellor.is_online ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-white/60 text-sm line-clamp-2">{counsellor.bio}</p>
        </div>
      </div>

      {/* Specialties */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {counsellor.specialties.slice(0, 3).map((specialty, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
            >
              {specialty}
            </span>
          ))}
          {counsellor.specialties.length > 3 && (
            <span className="px-3 py-1 bg-white/10 text-white/60 text-xs rounded-full">
              +{counsellor.specialties.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <h4 className="text-sm font-medium text-white/80 mb-1">Per Minute</h4>
          <p className="text-xl font-bold text-green-400">{formatPrice(counsellor.price_per_minute)}</p>
        </div>
        <div className="text-center">
          <h4 className="text-sm font-medium text-white/80 mb-1">Per Hour</h4>
          <p className="text-xl font-bold text-green-400">{formatPrice(counsellor.hourly_rate)}</p>
        </div>
      </div>

      {/* Action Buttons - Only Book Appointment */}
      <div className="space-y-3">
        <button 
          onClick={() => setShowAppointmentModal(true)}
          disabled={loading === 'appointment'}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading === 'appointment' ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Booking...
            </>
          ) : (
            <>
              <Calendar size={16} />
              Book Appointment
            </>
          )}
        </button>
      </div>

      {/* Appointment Booking Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1C24] rounded-2xl border border-white/10 p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Book Counselling Appointment</h3>
            
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center ring-2 ring-white/10">
                  {counsellor.avatar_url ? (
                    <img src={counsellor.avatar_url} alt={counsellor.display_name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-white/40" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{counsellor.display_name}</p>
                  <p className="text-white/50 text-xs">Professional Counsellor</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                <p className="text-green-400 font-semibold text-sm">Fee: {formatPrice(counsellor.hourly_rate)}</p>
                <p className="text-white/50 text-xs">Duration: 1 hour • Payment via wallet</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Select Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-white/80 text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe what you'd like to discuss..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 resize-none"
                  rows={3}
                />
              </div>
              
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Session Fee:</span>
                  <span className="text-xl font-bold text-green-400">{formatPrice(counsellor.hourly_rate)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBookAppointment}
                disabled={loading === 'appointment' || !selectedDate || !selectedTime}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'appointment' ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
