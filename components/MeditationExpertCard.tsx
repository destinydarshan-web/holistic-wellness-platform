import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Users, Star, Clock, CheckCircle, MessageCircle, Phone, Briefcase, DollarSign, Camera, Upload, AlertCircle, User, MapPin, Calendar, X } from 'lucide-react'
import { showNotification } from './Notification'

interface MeditationExpertCardProps {
  expert: {
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

export default function MeditationExpertCard({ expert }: MeditationExpertCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationData, setConfirmationData] = useState<any>(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)

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
        expert: expert,
        date: selectedDate,
        time: selectedTime,
        notes: notes,
        cost: expert.hourly_rate,
        walletBalance: wallet.balance,
        hasSufficientBalance: wallet.balance >= expert.hourly_rate
      })
      setShowConfirmationModal(true)
      
    } catch (error: any) {
      
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
          service_category: 'meditation',
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

      // Create notification for expert
      try {
        
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
        

        if (notificationResponse.ok && notificationData.success) {
          
          if (notificationData.warning) {
            
          }
        } else {
          
          
          
        }
      } catch (notificationError) {
        
      }

      // Close confirmation modal
      setShowConfirmationModal(false)
      setConfirmationData(null)
      setSelectedDate('')
      setSelectedTime('')
      setNotes('')
      
      showNotification('Appointment request sent! Waiting for expert confirmation.', 'success')
      
    } catch (error: any) {
      
      showNotification(`Failed to book appointment: ${error.message}`, 'error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
      {/* Header - Avatar, Name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center overflow-hidden">
            {expert.avatar_url ? (
              <img 
                src={expert.avatar_url} 
                alt={expert.display_name} 
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
          {expert.is_online && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white/10"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">{expert.display_name}</h3>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-[#fdce20] fill-[#fdce20]" />
              ))}
            </div>
            <span className="text-purple-400 font-semibold">5.0</span>
          </div>
          <p className="text-gray-300 text-sm line-clamp-2">{expert.bio}</p>
        </div>
      </div>

      {/* Specialties */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {expert.specialties.map((specialty, index) => (
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
            <span className="text-sm">{expert.experience_years} years exp.</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <h4 className="text-sm font-medium text-white/80 mb-1">Per Minute</h4>
            <p className="text-lg font-semibold text-[#fdce20]">{formatPrice(expert.price_per_minute)}</p>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-medium text-white/80 mb-1">Per Hour</h4>
            <p className="text-lg font-semibold text-[#fdce20]">{formatPrice(expert.hourly_rate || (expert.price_per_minute * 60))}</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="space-y-3">
        <button 
          onClick={() => {
            if (!user?.id) {
              setShowLoginModal(true)
              return
            }
            setShowAppointmentModal(true)
          }}
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
              Book Appointment
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
              <h3 className="text-xl font-bold font-serif text-white">Book Meditation Session</h3>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Expert Info */}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#d8b4fe]/20 to-purple-500/20 rounded-full flex items-center justify-center">
                {expert.avatar_url ? (
                  <img src={expert.avatar_url} alt={expert.display_name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-[#d8b4fe]" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{expert.display_name}</p>
                <p className="text-white/60 text-xs">Meditation Expert</p>
              </div>
              <div className="text-right">
                <p className="text-[#d8b4fe] font-bold text-sm">{formatPrice(expert.hourly_rate)}</p>
                <p className="text-white/50 text-xs">per hour</p>
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]/50 focus:border-[#d8b4fe]"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Select Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]/50 focus:border-[#d8b4fe]"
                >
                  <option value="" className="bg-black text-white">Select a time</option>
                  <option value="09:00" className="bg-black text-white">9:00 AM</option>
                  <option value="10:00" className="bg-black text-white">10:00 AM</option>
                  <option value="11:00" className="bg-black text-white">11:00 AM</option>
                  <option value="12:00" className="bg-black text-white">12:00 PM</option>
                  <option value="14:00" className="bg-black text-white">2:00 PM</option>
                  <option value="15:00" className="bg-black text-white">3:00 PM</option>
                  <option value="16:00" className="bg-black text-white">4:00 PM</option>
                  <option value="17:00" className="bg-black text-white">5:00 PM</option>
                  <option value="18:00" className="bg-black text-white">6:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any specific meditation goals or preferences..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#d8b4fe]/50 focus:border-[#d8b4fe] placeholder-white/40 resize-none"
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAppointmentModal(false)
                  setSelectedDate('')
                  setSelectedTime('')
                  setNotes('')
                }}
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBookAppointment}
                disabled={!selectedDate || !selectedTime || loading === 'appointment'}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-400 text-white rounded-lg hover:from-purple-600 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading === 'appointment' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Booking...
                  </>
                ) : (
                  'Book Appointment'
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

    {/* Login Modal - For unauthorized users */}
    {showLoginModal && (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setShowLoginModal(false)}
      >
        <div 
          className="bg-gradient-to-br from-[#1C1C24] to-[#2a2a3e] border border-[#fbcc1e]/20 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-[#fbcc1e]/10 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowLoginModal(false)}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-[#fbcc1e]/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-[#fbcc1e]" />
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-white text-center mb-2">
            Authentication Required
          </h3>
          
          {/* Message */}
          <p className="text-white/70 text-center mb-6">
            Log in to get started
          </p>
          
          {/* Login Button */}
          <button
            onClick={() => {
              setShowLoginModal(false)
              router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
            }}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#fbcc1e] to-amber-500 text-black rounded-lg hover:from-[#fbcc1e]/90 hover:to-amber-500/90 transition-all font-semibold"
          >
            Log In
          </button>
        </div>
      </div>
    )}
    </>
  )
}
