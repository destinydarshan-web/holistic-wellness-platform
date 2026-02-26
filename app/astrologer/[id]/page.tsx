'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Star, MessageCircle, Phone, Video, Clock, DollarSign, CheckCircle } from 'lucide-react'

interface ExpertProfile {
  display_name: string
  profile_photo_url: string
  tagline: string
  bio: string
  experience_years: number
  primary_specialization: string
  additional_specializations: string[]
  languages: string[]
  chat_enabled: boolean
  call_enabled: boolean
  video_enabled: boolean
  base_price: number
  response_time_message: string
}

export default function ExpertPreviewPage() {
  const router = useRouter()
  const [profileData, setProfileData] = useState<ExpertProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get preview data from URL or use default
    const urlParams = new URLSearchParams(window.location.search)
    const dataParam = urlParams.get('data')
    
    if (dataParam) {
      try {
        const decodedData = JSON.parse(atob(dataParam))
        setProfileData(decodedData)
      } catch (error) {
        console.error('Error decoding preview data:', error)
      }
    } else {
      // Default preview data for testing
      setProfileData({
        display_name: 'Dr. Priya Sharma',
        profile_photo_url: '/images/expert-avatar.jpg',
        tagline: 'Vedic Astrologer with 15+ years of experience',
        bio: 'I am a certified Vedic Astrologer specializing in horoscope analysis, kundli matching, and remedial solutions. With over 15 years of experience, I have helped thousands of clients find clarity and direction in their lives.',
        experience_years: 15,
        primary_specialization: 'Vedic Astrology',
        additional_specializations: ['Kundli Matching', 'Horoscope Reading'],
        languages: ['English', 'Hindi', 'Sanskrit'],
        chat_enabled: true,
        call_enabled: true,
        video_enabled: true,
        base_price: 299,
        response_time_message: 'Usually responds within 5 minutes'
      })
    }
    
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Preview Not Available</h2>
          <p className="text-gray-600">No profile data found for preview.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Preview</h1>
              <p className="text-gray-600">This is how your profile appears to clients</p>
            </div>
            
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Edit
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {/* Expert Card Preview */}
            <div className="bg-white rounded-[20px] p-8 shadow-lg border">
              {/* Top Section */}
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {profileData.profile_photo_url ? (
                      <img 
                        src={profileData.profile_photo_url} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <CheckCircle size={14} className="text-black" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {profileData.display_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {profileData.tagline}
                </p>
              </div>

              {/* Middle Section */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">4.8</span>
                    <span className="text-gray-500">(156)</span>
                  </div>
                  <div className="text-gray-500">•</div>
                  <div className="text-gray-600">{profileData.experience_years} years</div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-3 mb-3 text-center leading-relaxed">
                  {profileData.bio}
                </p>
                
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{profileData.response_time_message}</span>
                </div>
              </div>

              {/* Action Zone */}
              <div className="space-y-4">
                <button className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg hover:shadow-lg transition-all duration-300 text-lg shadow-md">
                  Start Chat Now
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  {profileData.call_enabled && (
                    <button className="py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
                      Call
                    </button>
                  )}
                  {profileData.video_enabled && (
                    <button className="py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
                      Video
                    </button>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500">From</div>
                    <div className="text-xl font-bold text-gray-900">₹{profileData.base_price}</div>
                  </div>
                  <button className="text-yellow-600 hover:text-yellow-700 font-medium text-sm">
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Banner */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Preview Mode</span>
          </div>
        </div>
      </div>
    </div>
  )
}
