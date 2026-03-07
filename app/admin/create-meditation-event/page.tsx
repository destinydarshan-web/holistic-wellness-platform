'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, Calendar, Clock, MapPin, Users, DollarSign, Image, Save, X, Plus, Trash2 } from 'lucide-react'

interface MeditationEvent {
  title: string
  description: string
  date: string
  time: string
  timezone: string
  duration: string
  location: string
  price: number
  max_participants: number
  instructor: string
  instructor_description?: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'all'
  images?: string[]
  requirements?: string[]
  benefits?: string[]
  meditation_type: 'mindfulness' | 'transcendental' | 'vipassana' | 'zen' | 'guided' | 'other'
}

export default function CreateMeditationEventPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [eventData, setEventData] = useState<MeditationEvent>({
    title: '',
    description: '',
    date: '',
    time: '',
    timezone: 'UTC',
    duration: '',
    location: '',
    price: 0,
    max_participants: 0,
    instructor: '',
    level: 'all',
    images: [],
    requirements: [],
    benefits: [],
    meditation_type: 'mindfulness'
  })

  const [newRequirement, setNewRequirement] = useState('')
  const [newBenefit, setNewBenefit] = useState('')
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  useEffect(() => {
    if (!loading) {
      if (!user || !profile || profile.role !== 'admin') {
        router.push('/dashboard')
        return
      }
    }
  }, [user, profile, loading, router])

  const handleInputChange = (field: keyof MeditationEvent, value: string | number) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setEventData(prev => ({
        ...prev,
        requirements: [...(prev.requirements || []), newRequirement.trim()]
      }))
      setNewRequirement('')
    }
  }

  const removeRequirement = (index: number) => {
    setEventData(prev => ({
      ...prev,
      requirements: (prev.requirements || []).filter((_, i) => i !== index)
    }))
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setEventData(prev => ({
        ...prev,
        benefits: [...(prev.benefits || []), newBenefit.trim()]
      }))
      setNewBenefit('')
    }
  }

  const removeBenefit = (index: number) => {
    setEventData(prev => ({
      ...prev,
      benefits: (prev.benefits || []).filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (uploadedImages.length + validFiles.length > 3) {
      setError('You can only upload a maximum of 3 images')
      return
    }
    
    const newImages = [...uploadedImages, ...validFiles].slice(0, 3)
    setUploadedImages(newImages)
    
    // Create previews
    const newPreviews = newImages.map(file => URL.createObjectURL(file))
    setImagePreviews(newPreviews)
    
    // Upload images to get URLs
    const imageUrls: string[] = []
    for (const file of newImages) {
      try {
        const fileName = `${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage
          .from('event-images')
          .upload(fileName, file)
        
        if (error) {
          console.error('Error uploading image:', error)
          continue
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName)
        
        imageUrls.push(publicUrl)
      } catch (error) {
        console.error('Error uploading image:', error)
      }
    }
    
    setEventData(prev => ({
      ...prev,
      images: imageUrls
    }))
  }

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index])
    
    setUploadedImages(newImages)
    setImagePreviews(newPreviews)
    
    // Also remove from eventData.images
    setEventData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }))
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!eventData.title || !eventData.date || !eventData.time || !eventData.location) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const slug = generateSlug(eventData.title)
      
      console.log('Creating meditation event with data:', {
        slug,
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        timezone: eventData.timezone,
        duration: eventData.duration,
        location: eventData.location,
        price: eventData.price,
        max_participants: eventData.max_participants,
        instructor: eventData.instructor,
        instructor_description: eventData.instructor_description,
        level: eventData.level,
        images: eventData.images,
        requirements: eventData.requirements,
        benefits: eventData.benefits,
        meditation_type: eventData.meditation_type
      })
      
      // Create the meditation event
      const { data: eventDataResult, error: eventError } = await supabase
        .from('meditation_events')
        .insert({
          slug,
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          timezone: eventData.timezone,
          duration: eventData.duration,
          location: eventData.location,
          price: eventData.price,
          max_participants: eventData.max_participants,
          current_participants: 0,
          instructor: eventData.instructor,
          instructor_description: eventData.instructor_description,
          level: eventData.level,
          images: eventData.images,
          requirements: eventData.requirements,
          benefits: eventData.benefits,
          meditation_type: eventData.meditation_type,
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (eventError) {
        console.error('Supabase error:', eventError)
        throw eventError
      }

      console.log('Event created successfully:', eventDataResult)
      setSuccess('Meditation event created successfully!')
      setTimeout(() => {
        router.push('/meditation')
      }, 2000)

    } catch (error) {
      console.error('Error creating meditation event:', error)
      setError(error instanceof Error ? error.message : 'Failed to create meditation event')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F14]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F14] pt-24 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Admin Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Create Meditation Event</h1>
          <p className="text-white/60">Create a new meditation event for the platform</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Event Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Event Title *</label>
                <input
                  type="text"
                  value={eventData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  placeholder="Enter event title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Instructor</label>
                <input
                  type="text"
                  value={eventData.instructor}
                  onChange={(e) => handleInputChange('instructor', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  placeholder="Enter instructor name"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">Instructor Description</label>
                <textarea
                  value={eventData.instructor_description || ''}
                  onChange={(e) => handleInputChange('instructor_description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  placeholder="Describe the instructor's background, experience, and expertise..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Date *</label>
                <input
                  type="date"
                  value={eventData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Time *</label>
                <input
                  type="time"
                  value={eventData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Timezone</label>
                <select
                  value={eventData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#fbcc1e] appearance-none cursor-pointer"
                >
                  <option value="UTC" className="bg-[#1C1C24] text-white">UTC</option>
                  <option value="America/New_York" className="bg-[#1C1C24] text-white">Eastern Time (ET)</option>
                  <option value="America/Chicago" className="bg-[#1C1C24] text-white">Central Time (CT)</option>
                  <option value="America/Denver" className="bg-[#1C1C24] text-white">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles" className="bg-[#1C1C24] text-white">Pacific Time (PT)</option>
                  <option value="Europe/London" className="bg-[#1C1C24] text-white">London (GMT/BST)</option>
                  <option value="Europe/Paris" className="bg-[#1C1C24] text-white">Paris (CET/CEST)</option>
                  <option value="Asia/Kolkata" className="bg-[#1C1C24] text-white">India (IST)</option>
                  <option value="Asia/Tokyo" className="bg-[#1C1C24] text-white">Japan (JST)</option>
                  <option value="Australia/Sydney" className="bg-[#1C1C24] text-white">Sydney (AEDT/AEST)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Duration</label>
                <input
                  type="text"
                  value={eventData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  placeholder="e.g., 30 minutes, 1 hour"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Location *</label>
                <input
                  type="text"
                  value={eventData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  placeholder="Enter event location"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Price (₹)</label>
                <input
                  type="number"
                  value={eventData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Max Participants</label>
                <input
                  type="number"
                  value={eventData.max_participants}
                  onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Level</label>
                <select
                  value={eventData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#fbcc1e] appearance-none cursor-pointer"
                >
                  <option value="beginner" className="bg-[#1C1C24] text-white">Beginner</option>
                  <option value="intermediate" className="bg-[#1C1C24] text-white">Intermediate</option>
                  <option value="advanced" className="bg-[#1C1C24] text-white">Advanced</option>
                  <option value="all" className="bg-[#1C1C24] text-white">All Levels</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Meditation Type</label>
                <select
                  value={eventData.meditation_type}
                  onChange={(e) => handleInputChange('meditation_type', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#fbcc1e] appearance-none cursor-pointer"
                >
                  <option value="mindfulness" className="bg-[#1C1C24] text-white">Mindfulness</option>
                  <option value="transcendental" className="bg-[#1C1C24] text-white">Transcendental</option>
                  <option value="vipassana" className="bg-[#1C1C24] text-white">Vipassana</option>
                  <option value="zen" className="bg-[#1C1C24] text-white">Zen</option>
                  <option value="guided" className="bg-[#1C1C24] text-white">Guided</option>
                  <option value="other" className="bg-[#1C1C24] text-white">Other</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  value={eventData.description}
                  onChange={(e) => handleInputChange('description', e.target.value.slice(0, 100))}
                  rows={3}
                  maxLength={100}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  placeholder="Describe the meditation event (max 100 characters)..."
                />
                <p className="text-white/40 text-xs mt-1">{eventData.description.length}/100 characters</p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">Event Images (Max 3)</label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white cursor-pointer hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Image size={16} />
                      Choose Images
                    </label>
                    <span className="text-white/60 text-sm">{uploadedImages.length}/3 images</span>
                  </div>
                  
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-white/10"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Requirements</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                placeholder="Add a requirement (e.g., Comfortable clothing, Cushion"
              />
              <button
                type="button"
                onClick={addRequirement}
                className="px-4 py-2 bg-[#fbcc1e] text-black font-medium rounded-lg hover:bg-[#fbcc1e]/80 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-2">
              {(eventData.requirements || []).map((req, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-white">{req}</span>
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Benefits</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                placeholder="Add a benefit (e.g., Reduced stress, Better focus"
              />
              <button
                type="button"
                onClick={addBenefit}
                className="px-4 py-2 bg-[#fbcc1e] text-black font-medium rounded-lg hover:bg-[#fbcc1e]/80 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-2">
              {(eventData.benefits || []).map((benefit, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-white">{benefit}</span>
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-[#fbcc1e] text-black font-medium rounded-lg hover:bg-[#fbcc1e]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isSaving ? 'Creating...' : 'Create Event'}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
