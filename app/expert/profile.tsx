'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { User, Camera, Edit2, Save, X, Check, Star, Languages, Briefcase, Clock, DollarSign, MessageCircle, Phone, Video, Eye, EyeOff, AlertCircle, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ExpertProfile {
  id?: string
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
  cost_per_minute: number
  response_time: string
  is_online: boolean
  is_suspended: boolean
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
  const { user, profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  const [profileData, setProfileData] = useState<ExpertProfile>({
    user_id: '',
    display_name: '',
    profile_photo_url: '',
    tagline: '',
    bio: '',
    years_of_experience: 0,
    primary_specialization: '',
    additional_specializations: [],
    languages_spoken: [],
    chat_enabled: true,
    call_enabled: true,
    video_enabled: true,
    cost_per_minute: 299,
    response_time: 'Usually responds within 5 minutes',
    is_online: false,
    is_suspended: false
  })

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

  // Bulletproof profile loading with proper auth
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("expert_astrologers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        return;
      }

      if (!data) {
        const { error: insertError } = await supabase
          .from("expert_astrologers")
          .insert({ user_id: user.id });

        if (insertError) {
          console.error(insertError);
          return;
        }

        return init(); // reload
      }

      setProfileData(data);
      setOriginalData(data);
    };

    init();
  }, []);

  useEffect(() => {
    if (originalData) {
      const changed = JSON.stringify(profileData) !== JSON.stringify(originalData)
      setHasChanges(changed)
    }
  }, [profileData, originalData])

  const loadProfileData = async () => {
    try {
      if (!user?.id) return;
      
      console.log('=== DEBUG: Loading Expert Profile ===')
      console.log('User ID:', user.id)
      
      const { data, error } = await supabase
        .from("expert_astrologers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      console.log('Profile query result:', { data, error })
      
      if (error) throw error;
      
      if (!data) {
        console.log('No profile found, creating new one...');
        // create row if missing
        const { error: insertError } = await supabase
          .from("expert_astrologers")
          .insert({ user_id: user.id });
        
        if (insertError) throw insertError;
        
        // Reload after creating
        loadProfileData();
        return;
      }
      
      setProfileData(data);
      setOriginalData(data);
      
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!profileData.display_name?.trim()) {
      errors.display_name = 'Display name is required'
    }
    
    if (!profileData.tagline?.trim()) {
      errors.tagline = 'Tagline is required'
    }
    
    if (!profileData.bio?.trim()) {
      errors.bio = 'Bio is required'
    } else if (profileData.bio.split(' ').length < 20) {
      errors.bio = 'Bio should be at least 20 words'
    } else if (profileData.bio.split(' ').length > 200) {
      errors.bio = 'Bio should not exceed 200 words'
    }
    
    if (!profileData.primary_specialization?.trim()) {
      errors.primary_specialization = 'Primary specialization is required'
    }
    
    const experience = profileData.years_of_experience ?? 0
    if (experience < 0 || experience > 50) {
      errors.years_of_experience = 'Experience must be between 0 and 50 years'
    }
    
    const price = profileData.cost_per_minute ?? 0
    if (price < 50 || price > 5000) {
      errors.cost_per_minute = 'Price must be between $50 and $5000'
    }
    
    if (!profileData.languages_spoken?.length) {
      errors.languages_spoken = 'At least one language is required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

 const handleSave = async () => {
  try {
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

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

    const updateData = {
      display_name: profileData.display_name,
      profile_photo_url: profileData.profile_photo_url,
      tagline: profileData.tagline,
      bio: profileData.bio,
      years_of_experience: profileData.years_of_experience,
      cost_per_minute: profileData.cost_per_minute,
      is_online: profileData.is_online,
      updated_at: new Date().toISOString()
    }
    
    console.log("Update payload:", updateData);
    console.log("show_instant_chat included in payload:", 'show_instant_chat' in updateData);

    if (!existingProfile) {
      // INSERT new row
      const { error: insertError } = await supabase
        .from("expert_astrologers")
        .insert({
          user_id: user.id,
          ...updateData
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }
      
      console.log("Profile created successfully");
    } else {
      // UPDATE existing row
      const { error: updateError } = await supabase
        .from("expert_astrologers")
        .update(updateData)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }
      
      console.log("Profile updated successfully");
    }

    alert("Profile saved successfully")

  } catch (err: any) {
    console.error("FULL ERROR:", err)
    alert(err.message || "Save failed")
  } finally {
    setSaving(false)
  }
}
  const handleInputChange = (field: keyof ExpertProfile, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear validation error for this field
    if (field === 'years_of_experience' || field === 'cost_per_minute' || field === 'languages_spoken') {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleArrayChange = (field: 'additional_specializations' | 'languages_spoken', action: 'add' | 'remove', value?: string) => {
    if (action === 'add' && value && value.trim()) {
      setProfileData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }))
    } else if (action === 'remove' && value) {
      setProfileData(prev => ({
        ...prev,
        [field]: prev[field].filter((item: string) => item !== value)
      }))
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Handle image upload
      const reader = new FileReader()
      reader.onload = (e) => {
        handleInputChange('profile_photo_url', e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePreview = () => {
    // Navigate to preview page with current form data
    const previewData = btoa(JSON.stringify(profileData))
    router.push(`/astrologer/preview?data=${previewData}`)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  // Show different content based on user state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  // Safe loading guard - prevents half-render state
  if (!profileData) {
    return <div className="p-10">Loading profile...</div>;
  }

  // Add loading state to prevent empty form flicker
  if (loading || !profileData) {
    return <div className="p-10">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              {profile?.role === 'expert' && (
                <div className="flex items-center gap-4">
                  <span>
                    Status: {profileData?.is_online ? "Online" : "Offline"}
                  </span>
                  <button
                    onClick={async () => {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) return;

                      await supabase
                        .from("expert_astrologers")
                        .update({ is_online: !profileData.is_online })
                        .eq("user_id", user.id);

                      setProfileData(prev => ({
                        ...prev,
                        is_online: !prev.is_online
                      }));
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Toggle Online
                  </button>
                </div>
              )}
              
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
                    value={profileData.years_of_experience ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange(
                        "years_of_experience",
                        value === "" ? null : Number(value)
                      );
                    }}
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
                          onChange={() => handleArrayChange('additional_specializations', 'add', spec)}
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
                          onChange={() => handleArrayChange('languages_spoken', 'add', lang)}
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

                {/* Base Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (₹ per session)</label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <input
                      type="number"
                      value={profileData.cost_per_minute ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange(
                          "cost_per_minute",
                          value === "" ? null : Number(value)
                        );
                      }}
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
        </div>

        {/* Preview Panel - 30% */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white rounded-[20px] shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
                <Eye className="w-5 h-5 text-gray-600" />
              </div>
              
              {/* Expert Card Preview */}
              <div className="bg-white rounded-[20px] p-6 shadow-lg border">
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
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {profileData.display_name || 'Your Name'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {profileData.tagline || 'Your tagline'}
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
                    <div className="text-gray-600">{profileData.years_of_experience ?? 0} years</div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3 text-center leading-relaxed">
                    {profileData.bio || 'Your bio will appear here...'}
                  </p>
                  
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{profileData.response_time}</span>
                  </div>
                </div>

                {/* Action Zone */}
                <div className="space-y-4">
                  <button className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg hover:shadow-lg transition-all duration-300">
                    Start Chat Now
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {profileData.call_enabled && (
                      <button className="py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50">
                        Call
                      </button>
                    )}
                    {profileData.video_enabled && (
                      <button className="py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50">
                        Video
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-500">From</div>
                      <div className="text-xl font-bold text-gray-900">${profileData.cost_per_minute ?? 0}/min</div>
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
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {hasChanges && (
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
