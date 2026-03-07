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

const ALL_SPECIALIZATIONS = {
  astrology: [
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
  ],
  counselling: [
    'Anxiety',
    'Depression',
    'Relationships',
    'Stress Management',
    'Career Counselling',
    'Trauma & PTSD',
    'Self-Esteem',
    'Addiction Recovery',
    'Grief & Loss',
    'Family Therapy'
  ],
  yoga: [
    'Hatha Yoga',
    'Vinyasa Flow',
    'Ashtanga',
    'Yin Yoga',
    'Restorative',
    'Power Yoga',
    'Meditation',
    'Prenatal Yoga',
    'Kids Yoga',
    'Aerial Yoga'
  ],
  meditation: [
    'Mindfulness',
    'Breathing',
    'Guided Meditation',
    'Transcendental',
    'Vipassana',
    'Zen Meditation',
    'Chakra Healing',
    'Yoga Nidra',
    'Loving Kindness',
    'Stress Relief'
  ]
}

// Fallback to all specialties if service type is not detected
const SPECIALIZATIONS = Object.values(ALL_SPECIALIZATIONS).flat()

// Helper function to get table name based on service type
const getTableName = (serviceType: string): string => {
  switch (serviceType) {
    case 'astrology': return 'expert_astrologers'
    case 'counselling': return 'expert_counsellors'
    case 'yoga': return 'expert_yoga'
    case 'meditation': return 'expert_meditation'
    default: return 'expert_meditation'
  }
}

// Helper function to detect service type based on specialties or role
const detectServiceType = (specialties: string[], role?: string): string => {
  // Debug logging
  console.log('DEBUG: detectServiceType called with:', { specialties, role })
  
  // Check if specialties contain service-specific keywords
  const specialtiesLower = specialties.map(s => s.toLowerCase())
  
  if (specialtiesLower.some(s => s.includes('astrology') || s.includes('vedic') || s.includes('tarot') || s.includes('numerology'))) {
    console.log('DEBUG: Detected astrology service')
    return 'astrology'
  }
  if (specialtiesLower.some(s => s.includes('anxiety') || s.includes('depression') || s.includes('counselling') || s.includes('therapy'))) {
    console.log('DEBUG: Detected counselling service')
    return 'counselling'
  }
  if (specialtiesLower.some(s => s.includes('yoga') || s.includes('vinyasa') || s.includes('ashtanga') || s.includes('hatha'))) {
    console.log('DEBUG: Detected yoga service')
    return 'yoga'
  }
  if (specialtiesLower.some(s => s.includes('meditation') || s.includes('mindfulness') || s.includes('breathing') || s.includes('vipassana'))) {
    console.log('DEBUG: Detected meditation service')
    return 'meditation'
  }
  
  // Fallback to role-based detection
  if (role === 'astrologer') {
    console.log('DEBUG: Using role fallback: astrology')
    return 'astrology'
  }
  if (role === 'expert') {
    console.log('DEBUG: Using role fallback: meditation (updated for experts)')
    return 'meditation' // Changed default to meditation for experts
  }
  
  // Default fallback
  console.log('DEBUG: Using default fallback: meditation')
  return 'meditation'
}

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
  const [serviceType, setServiceType] = useState<string>('')
  const [filteredSpecialties, setFilteredSpecialties] = useState<string[]>(SPECIALIZATIONS)

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
      
      // Try to detect service type first from role
      const initialServiceType = detectServiceType([], profile?.role)
      console.log('DEBUG: Initial service type detection:', initialServiceType)
      console.log('DEBUG: Profile role:', profile?.role)
      console.log('DEBUG: Profile specialization:', profile?.specialization)
      
      // For meditation experts (role='expert'), ensure we get meditation specialties and correct table
      let finalServiceType = initialServiceType
      console.log('DEBUG: Before forcing - finalServiceType:', finalServiceType)
      
      if (profile?.role === 'expert') {
        console.log('DEBUG: User is expert, forcing meditation service type')
        finalServiceType = 'meditation'
        console.log('DEBUG: After forcing - finalServiceType:', finalServiceType)
        setServiceType('meditation')
        setFilteredSpecialties(ALL_SPECIALIZATIONS.meditation)
        console.log('DEBUG: Set serviceType to meditation and filtered specialties')
      } else {
        console.log('DEBUG: User is not expert, using initial service type')
        setServiceType(initialServiceType)
        const filtered = ALL_SPECIALIZATIONS[initialServiceType as keyof typeof ALL_SPECIALIZATIONS] || SPECIALIZATIONS
        setFilteredSpecialties(filtered)
      }
      
      // Try the most likely table first using the final service type
      const primaryTable = getTableName(finalServiceType)
      console.log('DEBUG: Final service type:', finalServiceType)
      console.log('DEBUG: Primary table selected:', primaryTable)
      
      const tables = [
        primaryTable, // Use finalServiceType instead of initialServiceType
        'expert_meditation', // fallback for meditation experts
        'expert_counsellors', 
        'expert_yoga', 
        'expert_astrologers'
      ]
      
      // Remove duplicates
      const uniqueTables = [...new Set(tables)]
      console.log('DEBUG: Trying tables in order:', uniqueTables)
      
      let profileData = null
      let foundTable = null
      
      // Try each table until we find the profile
      for (const table of uniqueTables) {
        console.log(`DEBUG: Trying table: ${table}`)
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .eq("id", user.id)
          .maybeSingle()

        if (error) {
          console.log(`DEBUG: Error with table ${table}:`, error.message)
          continue
        }

        if (data) {
          console.log(`DEBUG: Found profile in table: ${table}`, data)
          profileData = data
          foundTable = table
          break
        }
      }

      if (profileData) {
        setProfileData(profileData)
        setProfileExists(true)
        
        // Detect service type based on existing specialties and role
        let detectedService = detectServiceType(profileData.specialties || [], profile?.role)
        console.log('DEBUG: Detected service type from profile:', detectedService)
        
        // For meditation experts, ensure we always use meditation service type
        if (profile?.role === 'expert') {
          detectedService = 'meditation'
          console.log('DEBUG: User is expert, forcing meditation service type from profile')
        }
        
        setServiceType(detectedService)
        
        const filtered = ALL_SPECIALIZATIONS[detectedService as keyof typeof ALL_SPECIALIZATIONS] || SPECIALIZATIONS
        console.log('DEBUG: Setting filtered specialties:', filtered)
        setFilteredSpecialties(filtered)
      } else {
        console.log('DEBUG: No existing profile data found in any table')
        setProfileExists(false)
        
        // For new profiles, use role-based detection
        let detectedService = detectServiceType([], profile?.role)
        console.log('DEBUG: Detected service type for new profile:', detectedService)
        
        // For meditation experts, ensure we always use meditation service type
        if (profile?.role === 'expert') {
          detectedService = 'meditation'
          console.log('DEBUG: User is expert, forcing meditation service type for new profile')
        }
        
        setServiceType(detectedService)
        
        const filtered = ALL_SPECIALIZATIONS[detectedService as keyof typeof ALL_SPECIALIZATIONS] || SPECIALIZATIONS
        console.log('DEBUG: Setting filtered specialties for new profile:', filtered)
        setFilteredSpecialties(filtered)
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

      // Save to expert profile via API with authentication
      console.log('=== DEBUG: Saving Profile ===')
      console.log('Profile Data:', profileData)
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) {
        setSaveMessage({
          type: 'error',
          message: 'Authentication required. Please log in again.'
        })
        return
      }
      
      console.log('=== DEBUG: Making API Call ===')
      console.log('Token exists:', !!token)
      console.log('Token length:', token?.length)
      
      const response = await fetch('/api/expert/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

      console.log('=== DEBUG: API Response Status ===')
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      const result = await response.json()
      console.log('=== DEBUG: API Response Data ===')
      console.log('Result:', result)
      
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
        console.log('=== DEBUG: API Call Failed ===')
        console.log('Error message:', result.error)
        console.log('Error details:', result.details)
        setSaveMessage({
          type: 'error',
          message: result.error || result.details || 'Failed to save profile'
        })
      }
      
    } catch (err: any) {
      console.error('=== DEBUG: Save Error ===', err)
      console.error('Error name:', err.name)
      console.error('Error message:', err.message)
      console.error('Error stack:', err.stack)
      setSaveMessage({
        type: 'error',
        message: err.message || "Save failed. Please check console for details."
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
            <h1 className="text-3xl font-bold font-serif text-white mb-2">Create Your Expert Profile</h1>
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
              <h2 className="text-xl font-semibold font-serif text-white mb-2">No Profile Found</h2>
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
          <h1 className="text-3xl font-bold font-serif text-white mb-2">Complete Your Profile</h1>
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
            <h2 className="text-xl font-semibold font-serif text-white mb-6">Basic Information</h2>
            
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold font-serif text-white">Specialties *</h2>
              {serviceType && (
                <div className="px-3 py-1 bg-[#fdce20]/10 border border-[#fdce20]/30 rounded-full">
                  <span className="text-[#fdce20] text-sm font-medium capitalize">
                    {serviceType} Services
                  </span>
                </div>
              )}
            </div>
            
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-white/5 rounded-lg text-xs">
                <div>Service Type: {serviceType || 'Not detected'}</div>
                <div>Filtered Specialties Count: {filteredSpecialties.length}</div>
                <div>Profile Role: {profile?.role || 'No role'}</div>
                <div>Profile Specialties: {JSON.stringify(profileData.specialties)}</div>
                <div>ALL_SPECIALIZATIONS.meditation: {JSON.stringify(ALL_SPECIALIZATIONS.meditation)}</div>
                <div>Filtered Specialties: {JSON.stringify(filteredSpecialties)}</div>
              </div>
            )}
            
            {filteredSpecialties.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredSpecialties.map((specialty) => (
                  <button
                    key={specialty}
                    onClick={() => handleSpecialtyToggle(specialty)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      profileData.specialties.includes(specialty)
                        ? 'bg-[#fdce20] text-black border-[#fdce20]'
                        : 'bg-[#0F0F14] text-white/70 border-white/20 hover:border-white/40'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/50 mb-4">No specialties available for this service type.</p>
                
                {/* Emergency fallback for meditation experts */}
                {profile?.role === 'expert' && (
                  <div className="mb-4">
                    <p className="text-[#fdce20]/80 text-sm mb-2">Are you a meditation expert? Click below to load meditation specialties:</p>
                    <button
                      onClick={() => {
                        console.log('DEBUG: Emergency fallback - forcing meditation specialties')
                        setServiceType('meditation')
                        setFilteredSpecialties(ALL_SPECIALIZATIONS.meditation)
                        console.log('DEBUG: Set meditation specialties:', ALL_SPECIALIZATIONS.meditation)
                      }}
                      className="px-4 py-2 bg-[#fdce20] text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
                    >
                      Load Meditation Specialties
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setServiceType('meditation')
                    setFilteredSpecialties(ALL_SPECIALIZATIONS.meditation)
                  }}
                  className="mt-4 px-4 py-2 bg-[#fdce20]/10 text-[#fdce20] rounded-lg hover:bg-[#fdce20]/20 transition-colors border border-[#fdce20]/30"
                >
                  Load Meditation Specialties
                </button>
                <button
                  onClick={() => {
                    setServiceType('')
                    setFilteredSpecialties(SPECIALIZATIONS)
                  }}
                  className="mt-2 ml-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Load All Specialties
                </button>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold font-serif text-white mb-6">Pricing</h2>
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
