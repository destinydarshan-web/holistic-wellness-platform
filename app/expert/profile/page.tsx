'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { User, Camera, Save, AlertCircle, Upload, Star, Briefcase, Clock, DollarSign, MessageCircle, Phone, Video, CheckCircle } from 'lucide-react'

interface ExpertProfile {
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
  created_at?: string
  updated_at?: string
}

const ASTROLOGY_SPECIALIZATIONS = [
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

const YOGA_SPECIALIZATIONS = [
  'Hatha Yoga',
  'Vinyasa Flow',
  'Ashtanga Yoga',
  'Iyengar Yoga',
  'Bikram Yoga',
  'Kundalini Yoga',
  'Yin Yoga',
  'Restorative Yoga',
  'Power Yoga',
  'Prenatal Yoga',
  'Aerial Yoga',
  'Acro Yoga',
  'Meditation & Mindfulness',
  'Yoga Therapy',
  'Kids Yoga',
  'Senior Yoga',
  'Corporate Wellness',
  'Yoga Nidra',
  'Breathwork',
  'Alignment & Posture',
  'Stress Relief Yoga',
  'Flexibility Training',
  'Yoga Philosophy',
  'Ayurvedic Yoga',
  'Yoga Retreats',
  'Yoga Teacher Training',
  'Yoga Workshops'
]

const MEDITATION_SPECIALIZATIONS = [
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

const COUNSELLING_SPECIALIZATIONS = [
  'Cognitive Behavioral Therapy',
  'Relationship Counselling',
  'Career Counselling',
  'Mental Health Counselling',
  'Family Therapy',
  'Stress Management',
  'Anxiety & Depression',
  'Life Coaching',
  'Substance Abuse Counselling',
  'Grief Counselling'
]

export default function ExpertProfilePage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Determine specializations based on specialization
  const getSpecializations = () => {
    if (profile?.specialization === 'astrologer') {
      return ASTROLOGY_SPECIALIZATIONS
    } else if (profile?.specialization === 'counsellor') {
      return COUNSELLING_SPECIALIZATIONS
    } else if (profile?.specialization === 'yoga_trainer') {
      return YOGA_SPECIALIZATIONS
    } else if (profile?.specialization === 'meditation_expert') {
      return MEDITATION_SPECIALIZATIONS
    } else if (profile?.role === 'expert') {
      // Default for expert role to meditation
      return MEDITATION_SPECIALIZATIONS
    } else {
      return []
    }
  }
  
  const [profileData, setProfileData] = useState<ExpertProfile>({
    id: user?.id || '',
    display_name: '',
    avatar_url: '',
    bio: '',
    experience_years: 0,
    price_per_minute: 299,
    hourly_rate: 17940, // Default hourly rate (299 * 60)
    specialties: [],
    is_profile_complete: false,
    is_online: false
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

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
    
    // Add timeout fallback to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('=== DEBUG: Loading timeout, forcing loading to false ===')
      setLoading(false)
    }, 5000) // 5 second timeout

    return () => clearTimeout(timeout)
  }, [user, profile, router])

  const loadProfile = async () => {
    try {
      console.log('=== DEBUG: Loading Expert Profile ===')
      setLoading(true)
      
      if (!user?.id) {
        console.log('=== DEBUG: No user ID, returning ===')
        return
      }
      
      console.log('=== DEBUG: Fetching profile for user:', user.id)
      
      // Determine table name based on specialization
      let tableName = ""
      console.log('=== DEBUG: Profile object (fetch) ===', profile)
      console.log('=== DEBUG: Profile role (fetch) ===', profile?.role)
      console.log('=== DEBUG: Profile specialization (fetch) ===', profile?.specialization)
      console.log('=== DEBUG: Profile specialization type (fetch) ===', typeof profile?.specialization)
      
      if (profile?.specialization === 'counsellor') {
        tableName = "expert_counsellors"
      } else if (profile?.specialization === 'yoga_trainer') {
        tableName = "expert_yoga"
      } else if (profile?.specialization === 'meditation_expert') {
        tableName = "expert_meditation"
      } else if (profile?.specialization === 'astrologer') {
        tableName = "expert_astrologers"
      } else if (profile?.role === 'expert') {
        // Default for expert role to meditation
        tableName = "expert_meditation"
      } else if (profile?.role === 'astrologer') {
        tableName = "expert_astrologers"
      } else {
        tableName = "expert_astrologers" // Default fallback
      }
      
      console.log('=== DEBUG: Fetching from table ===', tableName)
      
      let { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", user.id)
        .single()

      console.log('=== DEBUG: Profile fetch result ===')
      console.log('Data:', data)
      console.log('Error:', error)

      // If error and it's a counsellor or yoga trainer, try the other tables as fallback
      if (error && (profile?.specialization === 'counsellor' || profile?.specialization === 'yoga_trainer')) {
        console.log(`=== DEBUG: Error fetching from ${tableName}, trying fallback tables ===`)
        
        // Try expert_astrologers as fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("expert_astrologers")
          .select("*")
          .eq("id", user.id)
          .single()
        
        console.log('=== DEBUG: Fallback fetch result ===')
        console.log('Fallback Data:', fallbackData)
        console.log('Fallback Error:', fallbackError)
        
        if (!fallbackError && fallbackData) {
          // Use fallback data
          data = fallbackData
          error = null
          console.log('=== DEBUG: Using fallback data from expert_astrologers ===')
        } else if (profile?.specialization === 'counsellor') {
          // For counsellors, also try expert_counsellors
          const { data: secondFallback, error: secondFallbackError } = await supabase
            .from("expert_counsellors")
            .select("*")
            .eq("id", user.id)
            .single()
          
          if (!secondFallbackError && secondFallback) {
            data = secondFallback
            error = null
            console.log('=== DEBUG: Using second fallback data from expert_counsellors ===')
          }
        }
      }

      if (error) {
        // Only log error if it's not a "no rows found" error
        if (error.code !== 'PGRST116' && !error.message?.includes('No rows found')) {
          console.error('=== DEBUG: Error loading profile ===', error)
          console.log('=== DEBUG: Error details ===', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
        } else {
          // Expected case - profile doesn't exist yet
          console.log('=== DEBUG: Profile does not exist yet (expected) ===')
        }
        
        // Handle different error types
        if (error.code === 'PGRST116') {
          // No rows found - profile doesn't exist yet
          console.log('=== DEBUG: Profile does not exist yet, using defaults ===')
        } else if (error.message?.includes('No rows found')) {
          // Profile doesn't exist in this table yet
          console.log('=== DEBUG: Profile not found in table, using defaults ===')
        } else {
          // Other error
          console.error('=== DEBUG: Database error ===', error)
        }
      }

      if (data) {
        console.log('=== DEBUG: Setting profile data ===')
        console.log('=== DEBUG: Raw data from DB ===', data)
        
        // Map database fields to our interface
        const mappedData: ExpertProfile = {
          id: data.id || user.id,
          display_name: data.display_name || '',
          avatar_url: data.avatar_url || '',
          bio: data.bio || '',
          experience_years: data.experience_years || 0,
          price_per_minute: data.price_per_minute || 299,
          hourly_rate: data.hourly_rate || (data.price_per_minute || 299) * 60,
          specialties: data.specialties || [],
          is_profile_complete: data.is_profile_complete || false,
          is_online: data.is_online || false
        }
        
        console.log('=== DEBUG: Mapped profile data ===', mappedData)
        setProfileData(mappedData)
      } else {
        console.log('=== DEBUG: No profile data found, using defaults ===')
        // Profile doesn't exist yet, keep default values
        setProfileData(prev => ({
          ...prev,
          id: user.id
        }))
      }
    } catch (error) {
      console.error('=== DEBUG: Unexpected error in loadProfile ===', error)
    } finally {
      console.log('=== DEBUG: Setting loading to false ===')
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      console.log('=== DEBUG: Save button clicked ===')
      setSaving(true)
      setSaveMessage(null)

      if (!user?.id) {
        console.log('=== DEBUG: No user ID ===')
        setSaveMessage({
          type: 'error',
          message: 'User not authenticated'
        })
        setSaving(false)
        return
      }

      console.log('=== DEBUG: Saving Expert Profile ===')
      console.log('Profile data:', profileData)

      // Create update object with only existing fields
      const updateData: any = {
        id: user.id,
        updated_at: new Date().toISOString()
      }

      // Only include fields that have values
      if (profileData.display_name) updateData.display_name = profileData.display_name
      if (profileData.bio !== undefined) updateData.bio = profileData.bio
      if (profileData.experience_years !== undefined) updateData.experience_years = profileData.experience_years
      if (profileData.price_per_minute !== undefined) updateData.price_per_minute = profileData.price_per_minute
      if (profileData.hourly_rate !== undefined) updateData.hourly_rate = profileData.hourly_rate
      if (profileData.specialties) {
        updateData.specialties = profileData.specialties
        console.log('=== DEBUG: Specialties being saved ===', profileData.specialties)
        console.log('=== DEBUG: Specialties type ===', typeof profileData.specialties)
        console.log('=== DEBUG: Specialties length ===', profileData.specialties.length)
      }
      if (profileData.avatar_url !== undefined) updateData.avatar_url = profileData.avatar_url
      if (profileData.is_online !== undefined) updateData.is_online = profileData.is_online

      // Check if profile is complete
      const isComplete = 
        profileData.display_name && 
        profileData.bio && 
        profileData.experience_years !== undefined && 
        profileData.price_per_minute !== undefined &&
        profileData.specialties && 
        profileData.specialties.length > 0
      
      updateData.is_profile_complete = isComplete
      
      console.log('=== DEBUG: Profile completeness check ===')
      console.log('Display name:', !!profileData.display_name)
      console.log('Bio:', !!profileData.bio)
      console.log('Experience years:', profileData.experience_years !== undefined)
      console.log('Price per minute:', profileData.price_per_minute !== undefined)
      console.log('Specialties:', profileData.specialties?.length || 0)
      console.log('Is complete:', isComplete)

      console.log('=== DEBUG: Update data ===', updateData)

      // Determine table name based on specialization
      let tableName = ""
      console.log('=== DEBUG: Profile object ===', profile)
      console.log('=== DEBUG: Profile role ===', profile?.role)
      console.log('=== DEBUG: Profile specialization ===', profile?.specialization)
      console.log('=== DEBUG: Profile specialization type ===', typeof profile?.specialization)
      
      if (profile?.specialization === 'counsellor') {
        tableName = "expert_counsellors"
      } else if (profile?.specialization === 'yoga_trainer') {
        tableName = "expert_yoga"
      } else if (profile?.specialization === 'meditation_expert') {
        tableName = "expert_meditation"
      } else if (profile?.specialization === 'astrologer') {
        tableName = "expert_astrologers"
      } else if (profile?.role === 'expert') {
        // Default for expert role to meditation
        tableName = "expert_meditation"
      } else {
        // Default fallback - but this should not happen with proper role setup
        console.warn('=== DEBUG: Unknown specialization, defaulting to expert_astrologers ===', profile?.specialization)
        tableName = "expert_astrologers"
      }
      
      // Additional safeguard: Prevent counsellors from saving to expert_astrologers
      if (profile?.specialization === 'counsellor' && tableName === 'expert_astrologers') {
        console.error('=== DEBUG: ERROR: Attempting to save counsellor to expert_astrologers table ===')
        setSaveMessage({
          type: 'error',
          message: 'System error: Counsellors cannot be saved to astrologers table. Please contact support.'
        })
        setSaving(false)
        return
      }
      
console.log('=== DEBUG: Saving to table ===', tableName)

      const query = supabase
        .from(tableName)
        .upsert(updateData)
        .select()
        .single()

      const result = await query
      const data = result.data
      const error = result.error

      console.log('=== DEBUG: Save Response ===')
      console.log('Data:', data)
      console.log('Error:', error)
      console.log('Specialties in saved data:', data?.specialties)
      console.log('Specialties type in saved data:', typeof data?.specialties)

      if (error) {
        console.error('=== DEBUG: Save Error ===', error)
        setSaveMessage({
          type: 'error',
          message: `Failed to save profile: ${error.message}`
        })
        setSaving(false)
        return
      }

      console.log('=== DEBUG: Profile saved successfully ===')
      setSaveMessage({
        type: 'success',
        message: 'Profile saved successfully!'
      })
      
      // Show confirmation modal
      setShowConfirmationModal(true)
      
      // Reload profile to verify the save
      console.log('=== DEBUG: Reloading profile to verify save ===')
      await loadProfile()

    } catch (err: any) {
      console.error('=== DEBUG: Unexpected error in handleSave ===', err)
      setSaveMessage({
        type: 'error',
        message: `Unexpected error: ${err.message || 'Unknown error'}`
      })
    } finally {
      console.log('=== DEBUG: Setting saving to false ===')
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setSaveMessage(null)
    
    try {
      console.log('=== DEBUG: Starting Avatar Upload ===')
      console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type)
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSaveMessage({
          type: 'error',
          message: 'Please upload an image file (JPG, PNG, etc.)'
        })
        setUploading(false)
        return
      }

      // Validate file size (max 2MB for base64)
      if (file.size > 2 * 1024 * 1024) {
        setSaveMessage({
          type: 'error',
          message: 'File size must be less than 2MB'
        })
        setUploading(false)
        return
      }

      // Convert file to base64 and compress
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        
        // Validate base64 format
        if (!base64 || !base64.startsWith('data:image/')) {
          setSaveMessage({
            type: 'error',
            message: 'Invalid image format'
          })
          setUploading(false)
          return
        }
        
        console.log('=== DEBUG: Storing avatar URL in database ===')
        console.log('Original base64 length:', base64.length)
        
        // Store the original base64 (no compression to avoid corruption)
        // If needed for very large files, implement proper image compression
        let finalBase64 = base64
        
        // Only compress if file is very large (>1MB in base64)
        if (base64.length > 1000000) {
          // Convert to JPEG and reduce quality using canvas
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            // Reduce dimensions for large images
            const maxSize = 800
            let { width, height } = img
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width
                width = maxSize
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height
                height = maxSize
              }
            }
            
            canvas.width = width
            canvas.height = height
            
            ctx?.drawImage(img, 0, 0, width, height)
            
            // Compress to JPEG with 0.7 quality
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
            
            console.log('Compressed base64 length:', compressedBase64.length)
            
            // Update profile with compressed avatar
            setProfileData(prev => ({
              ...prev,
              avatar_url: compressedBase64
            }))
            
            setSaveMessage({
              type: 'success',
              message: 'Avatar uploaded and compressed successfully!'
            })
            setUploading(false)
          }
          
          img.onerror = () => {
            setSaveMessage({
              type: 'error',
              message: 'Failed to process image'
            })
            setUploading(false)
          }
          
          img.src = base64
          return
        }
        
        // For smaller images, use original
        setProfileData(prev => ({
          ...prev,
          avatar_url: finalBase64
        }))
        
        setSaveMessage({
          type: 'success',
          message: 'Avatar uploaded successfully!'
        })
        setUploading(false)
      }
      
      reader.onerror = () => {
        setSaveMessage({
          type: 'error',
          message: 'Failed to read image file'
        })
        setUploading(false)
      }
      reader.readAsDataURL(file)
      
    } catch (error) {
      console.error('Upload error:', error)
      setSaveMessage({
        type: 'error',
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      })
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (field: keyof ExpertProfile, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSpecialtyToggle = (specialty: string) => {
    setProfileData(prev => {
      // If specialty is already selected, remove it
      if (prev.specialties.includes(specialty)) {
        return {
          ...prev,
          specialties: prev.specialties.filter(s => s !== specialty)
        }
      }
      
      // If not selected and we have less than 3, add it
      if (prev.specialties.length < 3) {
        return {
          ...prev,
          specialties: [...prev.specialties, specialty]
        }
      }
      
      // If we already have 3, don't add more
      return prev
    })
  }

  const handleOnlineToggle = () => {
    setProfileData(prev => ({
      ...prev,
      is_online: !prev.is_online
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F14]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F14] py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-white/60">
            Fill in your details to get listed in our marketplace
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
          {/* Profile Header */}
          <div className="mb-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-[#2C2C34] rounded-full flex items-center justify-center">
                  {profileData.avatar_url ? (
                    <img src={profileData.avatar_url} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-white/40" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera className="w-4 h-4 text-black" />
                  )}
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{profileData.display_name || 'Your Name'}</h2>
                
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-yellow-500" />
              Basic Information
            </h3>
            
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
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                  <input
                    type="number"
                    value={profileData.experience_years}
                    onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0F0F14] border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-500"
                    placeholder="Years of experience"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Bio <span className="text-gray-400 text-xs">(max 60 characters)</span>
              </label>
              <div className="relative">
                <textarea
                  value={profileData.bio}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.length <= 60) {
                      handleInputChange('bio', value)
                    }
                  }}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0F0F14] border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-500"
                  placeholder="Tell us about yourself and your expertise..."
                  maxLength={60}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {profileData.bio.length}/60
                </div>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Specialties * <span className="text-gray-400 text-sm font-normal">(select max 3)</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {getSpecializations().map((specialty: string) => (
                <button
                  key={specialty}
                  onClick={() => handleSpecialtyToggle(specialty)}
                  disabled={!profileData.specialties.includes(specialty) && profileData.specialties.length >= 3}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    profileData.specialties.includes(specialty)
                      ? 'bg-yellow-500 text-black border-yellow-500'
                      : profileData.specialties.length >= 3 && !profileData.specialties.includes(specialty)
                      ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                      : 'bg-[#0F0F14] text-white/70 border-white/20 hover:border-white/40'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
            {profileData.specialties.length >= 3 && (
              <p className="mt-2 text-sm text-yellow-500">Maximum 3 specialties selected</p>
            )}
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              Pricing
            </h3>
            
            {/* Price Presets */}
            <div className="mb-6">
              <p className="text-sm text-white/60 mb-3">Quick presets (per minute):</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Budget', price: 199 },
                  { label: 'Standard', price: 299 },
                  { label: 'Premium', price: 499 },
                  { label: 'Expert', price: 799 }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      handleInputChange('price_per_minute', preset.price)
                      // Don't auto-calculate hourly rate - let user set it manually
                    }}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${
                      profileData.price_per_minute === preset.price
                        ? 'bg-yellow-500 text-black border-yellow-500'
                        : 'bg-white/5 text-white/70 border-white/20 hover:border-white/40'
                    }`}
                  >
                    {preset.label} (₹{preset.price})
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Price per Minute (₹) *
                  <span className="text-gray-400 text-xs ml-2">Min: ₹50, Max: ₹1999</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                  <input
                    type="number"
                    value={profileData.price_per_minute}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0
                      if (value >= 50 && value <= 1999) {
                        handleInputChange('price_per_minute', value)
                        // Don't auto-calculate hourly rate - let user set it manually
                      }
                    }}
                    min={50}
                    max={1999}
                    className="w-full pl-10 pr-4 py-3 bg-[#0F0F14] border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-500"
                    placeholder="299"
                  />
                </div>
                <p className="text-xs text-white/50 mt-1">For chat sessions (per minute)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Hourly Rate (₹) *
                  <span className="text-gray-400 text-xs ml-2">Editable</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                  <input
                    type="number"
                    value={profileData.hourly_rate || (profileData.price_per_minute * 60)}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0
                      if (value >= 3000 && value <= 119940) { // Min: 50*60, Max: 1999*60
                        handleInputChange('hourly_rate', value)
                      }
                    }}
                    min={3000}
                    max={119940}
                    className="w-full pl-10 pr-4 py-3 bg-[#0F0F14] border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-500"
                    placeholder="17940"
                  />
                </div>
                <p className="text-xs text-white/50 mt-1">For appointment bookings (1 hour)</p>
                <p className="text-xs text-yellow-500 mt-1">
                  💡 Tip: Min: ₹3,000, Max: ₹119,940 (based on per-minute rate range)
                </p>
              </div>
            </div>

            {/* Price Summary */}
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-sm font-medium text-white/80 mb-3">Price Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Per Minute:</span>
                  <span className="ml-2 text-yellow-500 font-semibold">₹{profileData.price_per_minute}</span>
                </div>
                <div>
                  <span className="text-white/60">Per Hour:</span>
                  <span className="ml-2 text-yellow-500 font-semibold">₹{profileData.hourly_rate || (profileData.price_per_minute * 60)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Online Status Toggle */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${profileData.is_online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              Online Status
            </h3>
            <div className="flex items-center gap-4">
              <button
                onClick={handleOnlineToggle}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-[#0F0F14] ${
                  profileData.is_online ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
                    profileData.is_online ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-white font-medium">
                {profileData.is_online ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-white/60 text-sm mt-2">
              Toggle your availability to receive session requests from users.
            </p>
          </div>

          {/* Save and Cancel Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => router.push('/expert-dashboard')}
              disabled={saving}
              className="px-6 py-3 bg-black text-[#fdce20] font-semibold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-red-500"
            >
              Cancel
            </button>
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
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0F0F14] border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Profile Saved Successfully!</h3>
              <p className="text-white/60 mb-6">
                Your profile has been updated and is now live. Users can discover and book sessions with you based on your expertise.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmationModal(false)
                    router.push('/expert-dashboard')
                  }}
                  className="flex-1 px-4 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
                >
                  Continue Editing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
