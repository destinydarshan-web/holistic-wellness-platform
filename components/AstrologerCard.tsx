import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Users, Star, Clock, CheckCircle, MessageCircle, Phone, Briefcase, DollarSign, Camera, Upload, AlertCircle, User, MapPin } from 'lucide-react'

interface AstrologerCardProps {
  astrologer: {
    id: string
    display_name: string
    avatar_url: string
    bio: string
    experience_years: number
    price_per_minute: number
    specialties: string[]
    is_profile_complete: boolean
    is_online: boolean
    created_at?: string
    updated_at?: string
  }
}

export default function AstrologerCard({ astrologer }: AstrologerCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

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
      const { data: wallet, error: walletError } = await supabase
        .from("user_wallet")
        .select("balance")
        .eq("user_id", user.id)
        .single()

      if (walletError) {
        console.error('Wallet fetch error:', walletError)
      }
      console.log('Wallet data:', wallet)
      console.log('Wallet balance:', wallet?.balance || 0)

      // Check minimum required balance
      const MINIMUM_BALANCE = 50
      if (!wallet || wallet.balance < MINIMUM_BALANCE) {
        console.log('Insufficient balance:', wallet?.balance || 0, 'Required:', MINIMUM_BALANCE)
        alert('Insufficient wallet balance. Minimum required: $50')
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

  const formatPrice = (price: number): string => {
    return `₹${price}/min`
  }

  return (
    <div className="bg-[#0b1220] rounded-2xl border border-white/10 shadow-inner shadow-black/20 p-6 transition-all duration-300 hover:shadow-inner hover:shadow-black/30">
      {/* Header - Avatar, Name, Online Status */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            {astrologer.avatar_url ? (
              <img 
                src={astrologer.avatar_url} 
                alt={astrologer.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          {/* Online Status Indicator */}
          {astrologer.is_online && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0b1220]"></div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-white">{astrologer.display_name}</h3>
            {astrologer.is_profile_complete && (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
          </div>
          <p className="text-white/60 text-sm">Expert Astrologer</p>
        </div>
      </div>

      {/* Rating and Reviews */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-lg font-semibold text-white">{astrologer.rating || '4.5'}</span>
          <span className="text-white/30">({astrologer.experience_years || 150} reviews)</span>
        </div>
        <div className="text-white/60 text-sm">
          {formatExperience(astrologer.experience_years)} experience
        </div>
      </div>

      {/* Specialties */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-white/80 mb-3">Specialties</h4>
        <div className="flex flex-wrap gap-2">
          {astrologer.specialties.map((specialty, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-white/80 mb-3">About</h4>
        <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
          {astrologer.bio || 'Experienced astrologer providing guidance and insights to help you navigate life\'s challenges and opportunities.'}
        </p>
      </div>

      {/* Pricing */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-medium text-white/80 mb-1">Consultation Price</h4>
          <p className="text-2xl font-bold text-yellow-400">{formatPrice(astrologer.price_per_minute)}</p>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-xs mb-1">Response Time</p>
          <p className="text-white text-sm font-medium">{astrologer.response_time || '2-3 min'}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-3">
        {astrologer.is_online && astrologer.modes.includes('chat') && (
          <button 
            onClick={() => handleSessionStart('chat')}
            disabled={loading === 'chat'}
            className="w-full py-3 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading === 'chat' ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Starting...
              </>
            ) : (
              <>
                <MessageCircle size={16} />
                Start Chat
              </>
            )}
          </button>
        )}
        
        {astrologer.is_online && astrologer.modes.includes('voice') && (
          <button 
            onClick={() => handleSessionStart('voice')}
            disabled={loading === 'voice'}
            className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading === 'voice' ? (
              <>
                <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </>
            ) : (
              <>
                <Phone size={16} />
                Voice Call
              </>
            )}
          </button>
        )}
      </div>

      {/* Offline Message */}
      {!astrologer.is_online && (
        <div className="text-center py-3 px-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-white/60 text-sm">Currently offline</p>
        </div>
      )}
    </div>
  )
}
