'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AstrologerCard from '@/components/AstrologerCard'

interface ExpertProfile {
  user_id: string
  display_name: string
  profile_photo_url: string
  tagline: string
  bio: string
  years_of_experience: number
  primary_specialization: string
  additional_specializations: string[]
  languages_spoken: string[]
  chat_enabled: boolean
  call_enabled: boolean
  video_enabled: boolean
  is_online: boolean
  cost_per_minute: number
  response_time: string
}

export default function ExpertPreviewPage() {
  const router = useRouter()
  const params = useParams()
  const [profileData, setProfileData] = useState<ExpertProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!params?.id) return

      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from("expert_astrologers")
          .select("*")
          .eq("user_id", params.id)
          .maybeSingle()

        if (error) {
          console.error("Profile fetch error:", error)
          setError('Failed to load profile')
          return
        }

        if (data) {
          setProfileData(data)
        } else {
          setError('Profile not found')
        }
      } catch (err) {
        console.error('Error:', err)
        setError('An error occurred while loading the profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [params?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Preview Not Available</h2>
          <p className="text-gray-600">{error || 'No profile data found for preview.'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Transform profile data to match AstrologerCard props
  const astrologerData = {
    id: profileData.user_id || (params.id as string),
    name: profileData.display_name,
    specialization: profileData.primary_specialization,
    bio: profileData.bio,
    rating: 4.5, // Default rating
    reviews: 0, // Default reviews
    experience: `${profileData.years_of_experience} years`,
    responseTime: profileData.response_time,
    price: profileData.cost_per_minute,
    image: profileData.profile_photo_url,
    online: profileData.is_online,
    verified: true, // Assuming preview is for verified experts
    modes: [
      ...(profileData.chat_enabled ? ['chat'] : []),
      ...(profileData.call_enabled ? ['call'] : []),
      ...(profileData.video_enabled ? ['video'] : [])
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Profile Preview</h1>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-blue-800 text-sm">
            <strong>Preview Mode:</strong> This is how your profile will appear to clients on the astrology listing page.
          </p>
        </div>

        {/* Single Astrologer Card */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <AstrologerCard astrologer={astrologerData} />
          </div>
        </div>
      </div>
    </div>
  )
}