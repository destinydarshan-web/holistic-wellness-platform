import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Users, Star, Clock, CheckCircle, MessageCircle, Phone, Briefcase, DollarSign, Camera, Upload, AlertCircle, User, MapPin, Calendar } from 'lucide-react'

interface AstrologerCardProps {
  astrologer: {
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

export default function AstrologerCard({ astrologer }: AstrologerCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const handleSessionStart = async (sessionType: 'chat' | 'voice' | 'video') => {
    if (!user?.id) {
      console.log('User not authenticated')
      return
    }

    console.log(`Starting ${sessionType} session with expert ${astrologer.id}`)
    setLoading(sessionType)

    try {
      // Step A: Fetch wallet balance
      console.log('Fetching wallet balance...')
      console.log('User ID:', user.id)
      
      const { data: wallet, error: walletError } = await supabase
        .from("user_wallet")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle()

      console.log('Wallet fetch result:', { wallet, walletError })

      if (walletError) {
        console.error('Wallet fetch error:', walletError)
        console.error('Error details:', {
          code: walletError.code,
          message: walletError.message,
          details: walletError.details
        })
        alert('Unable to fetch wallet balance. Please try again.')
        setLoading(null)
        return
      }

      console.log('Wallet data:', wallet)
      console.log('Wallet balance:', wallet?.balance || 0)

      // Check minimum required balance
      const MINIMUM_BALANCE = 50
      const currentBalance = wallet?.balance || 0
      if (currentBalance < MINIMUM_BALANCE) {
        console.log('Insufficient balance:', currentBalance, 'Required:', MINIMUM_BALANCE)
        alert(`Insufficient wallet balance. Current: ₹${currentBalance}, Required: ₹${MINIMUM_BALANCE}`)
        setLoading(null)
        return
      }
      console.log('Balance sufficient, creating session...')

      // Step 2: Create session in live_sessions
      const { data: session, error: sessionError } = await supabase
        .from("live_sessions")
        .insert({
          user_id: user.id,
          expert_id: astrologer.id,
          service_category: "astrology",
          session_type: sessionType,
          status: "pending"
        })
        .select()
        .single()

      if (sessionError) {
        console.error('Session creation error:', sessionError)
        alert('Failed to create session. Please try again.')
        setLoading(null)
        return
      }
      console.log('Session created successfully:', session)

      // Step 3: Redirect to appropriate live session page
      let redirectUrl = ''
      switch (sessionType) {
        case 'chat':
          redirectUrl = `/live/chat/${session.id}`
          break
        case 'voice':
          redirectUrl = `/live/voice/${session.id}`
          break
        case 'video':
          redirectUrl = `/live/video/${session.id}`
          break
      }
      console.log('Redirecting to:', redirectUrl)
      router.push(redirectUrl)

    } catch (error) {
      console.error('Unexpected error during session creation:', error)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const formatExperience = (years: number): string => {
    if (years === 1) return '1 year'
    if (years === 0) return '0 years'
    return `${years} years`
  }

  const handleAppointmentBooking = async () => {
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

      if (wallet.balance < astrologer.hourly_rate) {
        alert('Insufficient wallet balance for appointment booking')
        return
      }

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          expert_id: astrologer.id,
          service_category: 'astrology',
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          duration_minutes: 60,
          amount_paid: astrologer.hourly_rate,
          hourly_rate: astrologer.hourly_rate,
          status: 'upcoming',
          payment_status: 'paid'
        })
        .select()
        .single()

      if (appointmentError) {
        throw new Error(appointmentError.message)
      }

      // Deduct from wallet
      const { error: deductError } = await supabase
        .from('user_wallet')
        .update({ balance: wallet.balance - astrologer.hourly_rate })
        .eq("user_id", user.id)

      if (deductError) {
        throw new Error('Failed to process payment')
      }

      // Create notification for expert
        try {
          console.log('=== DEBUG: Sending notification to expert ===')
          const notificationResponse = await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              expert_id: astrologer.id,
              user_id: user.id,
              type: 'appointment_booked',
              message: `New appointment booked by ${user.email} for ${selectedDate} at ${selectedTime}`,
              appointment_id: appointment.id
            })
          })

          const notificationData = await notificationResponse.json()
          console.log('Notification response:', notificationData)

          if (notificationResponse.ok && notificationData.success) {
            console.log('✅ Notification sent to expert successfully')
            if (notificationData.warning) {
              console.log('⚠️ Notification warning:', notificationData.warning)
            }
          } else {
            console.error('❌ Failed to send notification to expert')
            console.error('Response status:', notificationResponse.status)
            console.error('Response data:', notificationData)
          }
        } catch (notificationError) {
          console.error('Error sending notification to expert:', notificationError)
        }

        // Create transaction record
      console.log('Creating transaction record...')
      const transactionData = {
        user_id: user.id,
        type: 'debit',
        amount: astrologer.hourly_rate,
        description: `Appointment booking with ${astrologer.display_name} - ${selectedDate} ${selectedTime}`,
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
      
    } catch (error: any) {
      console.error('Appointment booking error:', error)
      alert(`Failed to book appointment: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl border border-white/20 p-4 hover:border-yellow-500/30 hover:from-yellow-500/5 hover:to-white/10 transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-yellow-500/10">
      {/* Header - Avatar, Name, Online Status */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white/10">
            {astrologer.avatar_url ? (
              <img 
                src={astrologer.avatar_url} 
                alt={astrologer.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-gray-400" />
            )}
          </div>
          
          {/* Online Status Indicator */}
          {astrologer.is_online && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-white/20 shadow-lg"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white truncate">{astrologer.display_name}</h3>
            {astrologer.is_profile_complete && (
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-white/50 text-xs">Expert Astrologer</p>
        </div>
      </div>

      {/* Rating and Experience */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-semibold text-white">4.5</span>
          <span className="text-white/30 text-xs">({astrologer.experience_years || 150})</span>
        </div>
        <div className="text-white/50 text-xs">
          {formatExperience(astrologer.experience_years)}
        </div>
      </div>

      {/* Specialties */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {(astrologer.specialties || []).slice(0, 2).map((specialty, index) => (
            <span 
              key={index}
              className="px-2 py-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/20"
            >
              {specialty}
            </span>
          ))}
          {(astrologer.specialties || []).length > 2 && (
            <span className="text-white/40 text-xs">+{(astrologer.specialties || []).length - 2}</span>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="mb-3">
        <p className="text-white/60 text-xs leading-relaxed line-clamp-2">
          {astrologer.bio || 'Experienced astrologer providing guidance and insights to help you navigate life\'s challenges.'}
        </p>
      </div>

      {/* Pricing */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs mb-0.5">Per Min</p>
            <p className="text-lg font-bold text-yellow-400">{formatPrice(astrologer.price_per_minute)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-xs mb-0.5">Per Hour</p>
            <p className="text-sm font-bold text-green-400">{formatPrice(astrologer.hourly_rate)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Appointment Booking Button */}
        <button 
          onClick={() => setShowAppointmentModal(true)}
          disabled={loading === 'appointment'}
          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-green-500/80 to-emerald-600/80 text-white font-semibold hover:from-green-500 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md"
        >
          {loading === 'appointment' ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Booking...
            </>
          ) : (
            <>
              <Calendar size={14} />
              Book
            </>
          )}
        </button>

        {astrologer.is_online && astrologer.modes.includes('chat') && (
          <button 
            onClick={() => handleSessionStart('chat')}
            disabled={loading === 'chat'}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-yellow-500/90 to-orange-500/90 text-black font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md"
          >
            {loading === 'chat' ? (
              <>
                <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Starting...
              </>
            ) : (
              <>
                <MessageCircle size={14} />
                Chat
              </>
            )}
          </button>
        )}
        
        {astrologer.is_online && astrologer.modes.includes('voice') && (
          <button 
            onClick={() => handleSessionStart('voice')}
            disabled={loading === 'voice'}
            className="w-full py-2 px-3 rounded-lg bg-white/10 text-white/80 font-medium hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm border border-white/10"
          >
            {loading === 'voice' ? (
              <>
                <div className="w-3 h-3 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </>
            ) : (
              <>
                <Phone size={14} />
                Call
              </>
            )}
          </button>
        )}
      </div>

      {/* Offline Message */}
      {!astrologer.is_online && (
        <div className="text-center py-2 px-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/50 text-xs">Currently offline</p>
        </div>
      )}

      {/* Appointment Booking Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1C1C24] to-[#0F0F14] rounded-xl border border-white/20 p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Book Appointment</h3>
            
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center ring-2 ring-white/10">
                  {astrologer.avatar_url ? (
                    <img src={astrologer.avatar_url} alt={astrologer.display_name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white/40" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{astrologer.display_name}</p>
                  <p className="text-white/50 text-xs">Expert Astrologer</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-2 mb-3">
                <p className="text-yellow-400 font-semibold text-sm">Fee: {formatPrice(astrologer.hourly_rate)}</p>
                <p className="text-white/50 text-xs">Duration: 1 hour</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 bg-[#0F0F14] border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Select Time
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F0F14] border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500"
                >
                  <option value="">Select time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowAppointmentModal(false)
                  setSelectedDate('')
                  setSelectedTime('')
                }}
                className="flex-1 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAppointmentBooking}
                disabled={!selectedDate || !selectedTime || loading === 'appointment'}
                className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
              >
                {loading === 'appointment' ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-1"></div>
                    Booking...
                  </>
                ) : (
                  'Book & Pay'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
