'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { User, Camera, Save, AlertCircle, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface ExpertProfile {
  id: string
  display_name: string
  avatar_url: string
  bio: string
  experience_years: number
  price_per_minute: number
  specialties: string[]
  is_profile_complete: boolean
  created_at?: string
  updated_at?: string
}

const SPECIALIZATIONS = [
  'Vedic Astrology',
  'Western Astrology',
  'Numerology',
  'Palmistry',
  'Vastu Shastra',
  'Tarot Reading',
  'Face Reading',
  'Kundli Matching',
  'Horoscope Reading',
  'Remedial Astrology'
]

export default function ExpertProfilePage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ExpertProfile>({
    id: user?.id || '',
    display_name: '',
    avatar_url: '',
    bio: '',
    experience_years: 0,
    price_per_minute: 299,
    specialties: [],
    is_profile_complete: false
  })
  const [loading, setLoading] = useState(false)
  const [profileExists, setProfileExists] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!profile || (profile.role !== 'expert' && profile.role !== 'astrologer') || profile.status !== 'approved') {
      router.push('/account-under-review')
      return
    }

    loadProfile()
  }, [user, profile, router])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      if (!user?.id) return
      
      const { data, error } = await supabase
        .from("expert_astrologers")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (error) {
        console.error('Error loading profile:', error)
        // Check if table doesn't exist
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.log('expert_astrologers table does not exist yet')
          setProfileExists(false)
        }
        return
      }

      if (data) {
        setProfileData(data)
        setProfileExists(true)
      } else {
        setProfileExists(false)
      }
    } catch (error) {
      console.error('Error:', error)
      setProfileExists(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setSaveMessage(null)

      if (!user?.id) {
        setSaveMessage({
          type: 'error',
          message: 'User not authenticated'
        })
        return
      }

      // Validate required fields
      if (!profileData.display_name || !profileData.price_per_minute || !profileData.specialties.length) {
        setSaveMessage({
          type: 'error',
          message: 'Please complete all required fields: display name, price, and at least one specialty'
        })
        return
      }

      // Save to expert_astrologers table via API
      const response = await fetch('/api/expert/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          display_name: profileData.display_name,
          bio: profileData.bio,
          experience_years: profileData.experience_years,
          price_per_minute: profileData.price_per_minute,
          specialties: profileData.specialties,
          avatar_url: profileData.avatar_url,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setSaveMessage({
          type: 'success',
          message: 'Profile saved successfully! Redirecting to dashboard...'
        })
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/expert-dashboard')
        }, 2000)
      } else {
        setSaveMessage({
          type: 'error',
          message: result.error || 'Failed to save profile'
        })
      }
      
    } catch (err: any) {
      console.error("Error:", err)
      setSaveMessage({
        type: 'error',
        message: err.message || "Save failed"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ExpertProfile, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateProfile = async () => {
    try {
      if (!user?.id) {
        setSaveMessage({
          type: 'error',
          message: 'User not authenticated'
        })
        return
      }

      // Create initial profile entry
      const { data, error } = await supabase
        .from("expert_astrologers")
        .insert({
          id: user.id,
          display_name: '',
          bio: '',
          experience_years: 0,
          price_per_minute: 299,
          specialties: [],
          avatar_url: '',
          is_profile_complete: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        setSaveMessage({
          type: 'error',
          message: 'Failed to create profile'
        })
        return
      }

      if (data) {
        setProfileData(data)
        setProfileExists(true)
        setSaveMessage({
          type: 'success',
          message: 'Profile created! Please fill in your details.'
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setSaveMessage({
        type: 'error',
        message: 'Failed to create profile'
      })
    }
  }

  const handleSpecialtyToggle = (specialty: string) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F14]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Show create profile screen if no profile exists
  if (!profileExists) {
    return (
      <div className="min-h-screen bg-[#0F0F14] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Your Expert Profile</h1>
            <p className="text-white/60">
              Set up your professional profile to get listed in the astrology marketplace
            </p>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              saveMessage.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{saveMessage.message}</span>
              </div>
            </div>
          )}

          <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No Profile Found</h2>
              <p className="text-white/60 mb-6">
                You haven't created your expert profile yet. Click the button below to get started.
              </p>
            </div>
            
            <div className="flex items-center gap-4 justify-center">
              <button
                onClick={() => router.push('/expert-dashboard')}
                className="px-6 py-3 bg-[#0F0F14] text-white font-semibold rounded-lg hover:bg-[#2C2C34] transition-colors border border-white/20"
              >
                Back to Dashboard
              </button>
              
              <button
                onClick={handleCreateProfile}
                className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Create Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F14] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-white/60">
            Fill in your details to get listed in the astrology marketplace
          </p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveMessage.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{saveMessage.message}</span>
            </div>
          </div>
        )}

        <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-8">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={profileData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  className="w-full px-4 py-3 bg-[#0F0F14] border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-500"
                  placeholder="Enter your display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  value={profileData.experience_years}
                  onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-[#0F0F14] border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-500"
                  placeholder="Years of experience"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-[#0F0F14] border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-500"
                placeholder="Tell us about yourself and your expertise..."
              />
            </div>
          </div>

          {/* Specialties */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Specialties *</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SPECIALIZATIONS.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => handleSpecialtyToggle(specialty)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    profileData.specialties.includes(specialty)
                      ? 'bg-yellow-500 text-black border-yellow-500'
                      : 'bg-[#0F0F14] text-white/70 border-white/20 hover:border-white/40'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Pricing</h2>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Price per Minute (₹) *
              </label>
              <input
                type="number"
                value={profileData.price_per_minute}
                onChange={(e) => handleInputChange('price_per_minute', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-[#0F0F14] border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-500"
                placeholder="299"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
