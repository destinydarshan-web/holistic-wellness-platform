'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User, Camera, Edit2, Save, X, Check, Star, Languages, Briefcase, Clock, DollarSign, MessageCircle, Phone, Video, Eye, EyeOff, AlertCircle, Upload } from 'lucide-react'
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

const LANGUAGES = [
  'English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 
  'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Sanskrit'
]

const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-yellow-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
)

export default function ExpertProfilePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  const [profileData, setProfileData] = useState<ExpertProfile | null>(null)

  const [originalData, setOriginalData] = useState<ExpertProfile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Role-based access control - show page but with messaging if not expert
  useEffect(() => {
    if (!user) {
      // User not logged in - show login prompt
      return
    }
    
    if (profile?.role !== 'expert') {
      // User not expert - show upgrade prompt
      return
    }
  }, [user, profile, router])

  useEffect(() => {
    if (!user) {
      setProfileData(null)
      setOriginalData(null)
      setLoading(false)
      return
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("expert_astrologers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile fetch error:", error);
        return;
      }

      if (data) {
        setProfileData(data);
        setOriginalData(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchProfile();
  }, [user?.id]);

  useEffect(() => {
    if (originalData) {
      const changed = JSON.stringify(profileData) !== JSON.stringify(originalData)
      setHasChanges(changed)
    }
  }, [profileData, originalData])

  useEffect(() => {
    if (!user) {
      setProfileData(null);
      setOriginalData(null);
    }
  }, [user]);

  const validateForm = () => {
    if (!profileData) return false;
    
    const errors: Record<string, string> = {}
    
    if (!profileData.display_name.trim()) {
      errors.display_name = 'Display name is required'
    }
    
    if (!profileData.tagline.trim()) {
      errors.tagline = 'Tagline is required'
    }
    
    if (!profileData.bio.trim()) {
      errors.bio = 'Bio is required'
    } else if (profileData.bio.split(' ').length < 20) {
      errors.bio = 'Bio should be at least 20 words'
    } else if (profileData.bio.split(' ').length > 200) {
      errors.bio = 'Bio should not exceed 200 words'
    }
    
    if (!profileData.primary_specialization) {
      errors.primary_specialization = 'Primary specialization is required'
    }
    
    if (profileData.years_of_experience < 0 || profileData.years_of_experience > 50) {
      errors.years_of_experience = 'Experience must be between 0 and 50 years'
    }
    
    if (profileData.cost_per_minute < 50 || profileData.cost_per_minute > 5000) {
      errors.cost_per_minute = 'Price must be between ₹50 and ₹5000'
    }
    
    if (profileData.languages_spoken.length === 0) {
      errors.languages_spoken = 'At least one language is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!user || profile?.role !== 'expert') {
      setSaveMessage({ 
        type: 'error', 
        message: 'Only expert users can save profile changes. Please upgrade your account.' 
      })
      setTimeout(() => setSaveMessage(null), 5000)
      return
    }
    
    if (!profileData || !validateForm()) {
      return
    }
    
    setSaving(true)
    try {
      console.log('=== SAVE ATTEMPT ===')
      console.log('User ID:', user?.id)
      console.log('Profile Data:', profileData)
      
      // Check if expert profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("expert_astrologers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error checking profile:", fetchError);
        throw fetchError;
      }

      if (!existingProfile) {
        // INSERT new row
        console.log("Saved profile photo URL:", profileData.profile_photo_url);
        const { user_id, ...profileFields } = profileData;
        const { error: insertError } = await supabase
          .from("expert_astrologers")
          .insert({
            user_id: user.id,
            ...profileFields
          });

        if (insertError) {
          console.error("Insert error:", insertError);
          throw insertError;
        }
        
        console.log("Profile created successfully");
      } else {
        // UPDATE existing row
        console.log("Updated profile photo URL:", profileData.profile_photo_url);
        const { user_id, ...updateFields } = profileData;
        const { error: updateError } = await supabase
          .from("expert_astrologers")
          .update({
            ...updateFields
          })
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Update error:", updateError);
          throw updateError;
        }
        
        console.log("Profile updated successfully");
      }
      
      setOriginalData({ ...profileData })
      setHasChanges(false)
      setSaveMessage({ type: 'success', message: 'Profile updated successfully!' })
      setTimeout(() => setSaveMessage(null), 3000)
      
      // Refetch profile data to ensure UI is in sync
      await fetchProfile()
    } catch (error) {
      console.error('Error saving profile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setSaveMessage({ type: 'error', message: `Error saving profile: ${errorMessage}` })
      setTimeout(() => setSaveMessage(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ExpertProfile, value: any) => {
    setProfileData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value
      };
    })
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleMultiSelect = (field: 'additional_specializations' | 'languages_spoken', value: string) => {
    setProfileData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: prev[field].includes(value)
          ? prev[field].filter(item => item !== value)
          : [...prev[field], value]
      };
    })
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${user?.id}-${Date.now()}.${fileExt}`
        const filePath = `expert-photos/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('expert-photos')
          .upload(filePath, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }

        // Get public URL
        const { data } = supabase.storage
          .from('expert-photos')
          .getPublicUrl(filePath)

        const publicUrl = data.publicUrl
        console.log('Public URL:', publicUrl)

        // Update form with public URL
        handleInputChange('profile_photo_url', publicUrl)

      } catch (error) {
        console.error('Error uploading image:', error)
        alert('Failed to upload image. Please try again.')
      }
    }
  }

  const handlePreview = () => {
    // Navigate to preview page with user_id only
    router.push(`/astrologer/preview/${user?.id}`)
  }

  // Prevent navigation if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  // Show different content based on user state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-8">Please login to access your expert profile.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Login to Continue
          </button>
        </div>
      </div>
    )
  }

  if (profile?.role !== 'expert') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Expert Access Required</h2>
          <p className="text-gray-600 mb-8">
            This page is only available to expert users. Upgrade your account to access expert features.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Apply to Become Expert
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Fallback UI for when no profile data exists
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Profile Found</h2>
          <p className="text-gray-600 mb-4">You haven't created your expert profile yet.</p>
          <button
            onClick={() => router.push('/expert/profile')}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Create Profile
          </button>
        </div>
      </div>
    )
  }

  // Loading guard
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Profile not found guard
  if (!profileData && user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No profile found. Please create your expert profile.</p>
          <button
            onClick={() => router.push('/expert/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.role === 'expert' ? 'Edit Profile' : 'Expert Profile Preview'}
              </h1>
              <p className="text-gray-600">
                {profile?.role === 'expert' 
                  ? 'Manage your public profile information' 
                  : 'Preview of expert profile interface'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {profile?.role === 'expert' && hasChanges && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Unsaved changes</span>
                </div>
              )}
              {profile?.role !== 'expert' && (
                <div className="flex items-center gap-2 text-blue-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Preview Mode</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section - 70% */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-[20px] shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                Basic Information
              </h2>
              <p className="text-sm text-gray-600 mb-6">Your public profile details</p>
              
              <div className="space-y-6">
                {/* Profile Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {profileData.profile_photo_url ? (
                        <img 
                          src={profileData.profile_photo_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={profileData.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                      validationErrors.display_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Your professional name"
                  />
                  {validationErrors.display_name && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.display_name}</p>
                  )}
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                  <input
                    type="text"
                    value={profileData.tagline}
                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                      validationErrors.tagline ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Brief one-line description"
                  />
                  {validationErrors.tagline && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.tagline}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio (150-200 words)</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={6}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                      validationErrors.bio ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe your expertise, experience, and approach..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500">
                      {profileData.bio.split(' ').length} words
                    </p>
                    {validationErrors.bio && (
                      <p className="text-sm text-red-600">{validationErrors.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="bg-white rounded-[20px] shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-600" />
                Professional Details
              </h2>
              <p className="text-sm text-gray-600 mb-6">Your expertise and qualifications</p>
              
              <div className="space-y-6">
                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  <input
                    type="number"
                    value={profileData.years_of_experience}
                    onChange={(e) => handleInputChange('years_of_experience', parseInt(e.target.value))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                      validationErrors.years_of_experience ? 'border-red-300' : 'border-gray-300'
                    }`}
                    min="0"
                    max="50"
                  />
                  {validationErrors.years_of_experience && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.years_of_experience}</p>
                  )}
                </div>

                {/* Primary Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Specialization</label>
                  <select
                    value={profileData.primary_specialization}
                    onChange={(e) => handleInputChange('primary_specialization', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                      validationErrors.primary_specialization ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  {validationErrors.primary_specialization && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.primary_specialization}</p>
                  )}
                </div>

                {/* Additional Specializations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Specializations</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SPECIALIZATIONS.map(spec => (
                      <label key={spec} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.additional_specializations.includes(spec)}
                          onChange={() => handleMultiSelect('additional_specializations', spec)}
                          className="rounded text-yellow-500 focus:ring-yellow-400"
                        />
                        <span className="text-sm">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
                  <div className="grid grid-cols-3 gap-2">
                    {LANGUAGES.map(lang => (
                      <label key={lang} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.languages_spoken.includes(lang)}
                          onChange={() => handleMultiSelect('languages_spoken', lang)}
                          className="rounded text-yellow-500 focus:ring-yellow-400"
                        />
                        <span className="text-sm">{lang}</span>
                      </label>
                    ))}
                  </div>
                  {validationErrors.languages_spoken && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.languages_spoken}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Session Settings */}
            <div className="bg-white rounded-[20px] shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                Session Settings
              </h2>
              <p className="text-sm text-gray-600 mb-6">Configure your availability and pricing</p>
              
              <div className="space-y-6">
                {/* Session Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Available Session Types</label>
                  <div className="space-y-3">
                    <ToggleSwitch
                      checked={profileData.chat_enabled}
                      onChange={(checked) => handleInputChange('chat_enabled', checked)}
                      label="Chat Sessions"
                    />
                    <ToggleSwitch
                      checked={profileData.call_enabled}
                      onChange={(checked) => handleInputChange('call_enabled', checked)}
                      label="Call Sessions"
                    />
                    <ToggleSwitch
                      checked={profileData.video_enabled}
                      onChange={(checked) => handleInputChange('video_enabled', checked)}
                      label="Video Sessions"
                    />
                  </div>
                </div>

                {/* Online Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Availability Status</label>
                  <ToggleSwitch
                    checked={profileData.is_online}
                    onChange={(checked) => handleInputChange('is_online', checked)}
                    label="Available for Consultation"
                  />
                </div>

                {/* Base Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Charge per minute ($)</label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <input
                      type="number"
                      value={profileData.cost_per_minute}
                      onChange={(e) => handleInputChange('cost_per_minute', parseInt(e.target.value))}
                      className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                        validationErrors.cost_per_minute ? 'border-red-300' : 'border-gray-300'
                      }`}
                      min="50"
                      max="5000"
                    />
                  </div>
                  {validationErrors.cost_per_minute && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.cost_per_minute}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">System limits: $50 - $5000</p>
                </div>

                {/* Response Time Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Response Time Message</label>
                  <input
                    type="text"
                    value={profileData.response_time}
                    onChange={(e) => handleInputChange('response_time', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="e.g., Usually responds within 5 minutes"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel - 30% */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-[20px] shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
                  <Eye className="w-5 h-5 text-gray-600" />
                </div>
                
                {/* Real AstrologerCard Component */}
                <AstrologerCard 
                  astrologer={{
                    id: profileData?.user_id || '',
                    name: profileData?.display_name || 'Your Name',
                    specialization: profileData?.primary_specialization || 'Your Specialization',
                    bio: profileData?.bio || 'Your bio will appear here...',
                    rating: 4.8,
                    reviews: 156,
                    experience: `${profileData?.years_of_experience || 0} years`,
                    responseTime: profileData?.response_time || '5 minutes',
                    price: profileData?.cost_per_minute || 0,
                    image: profileData?.profile_photo_url || null,
                    online: profileData?.is_online || false,
                    verified: true,
                    modes: [
                      ...(profileData?.chat_enabled ? ['chat'] : []),
                      ...(profileData?.call_enabled ? ['call'] : []),
                      ...(profileData?.video_enabled ? ['video'] : [])
                    ]
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {profile?.role === 'expert' && hasChanges && (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Unsaved changes</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview Profile
              </button>
              
              <button
                onClick={handleSave}
                disabled={(!hasChanges || saving) && profile?.role === 'expert'}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Saving...
                  </>
                ) : profile?.role === 'expert' ? (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Upgrade to Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Message Toast */}
      {saveMessage && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          saveMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {saveMessage.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="font-medium">{saveMessage.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
