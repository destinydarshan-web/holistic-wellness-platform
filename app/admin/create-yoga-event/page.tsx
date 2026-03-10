'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, Calendar, Clock, MapPin, Users, DollarSign, Image, Save, X, Plus, Trash2 } from 'lucide-react'

interface YogaEvent {
  slug: string
  title: string
  description: string
  date: string
  time: string
  timezone: string
  duration: string
  location: string
  price: number
  max_participants: number
  current_participants?: number
  instructor: string
  instructor_description?: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'all'
  images?: string[]
  requirements?: string[]
  benefits?: string[]
  status?: string
  created_at?: string
  updated_at?: string
}

export default function CreateYogaEventPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<'create' | 'upcoming' | 'past'>('create')
  const [events, setEvents] = useState<YogaEvent[]>([])
  const [editingEvent, setEditingEvent] = useState<YogaEvent | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [eventData, setEventData] = useState<YogaEvent>({
    slug: '',
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
    benefits: []
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
    
    if (activeSection !== 'create') {
      fetchEvents()
    }
  }, [user, profile, loading, router, activeSection])

  const fetchEvents = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('yoga_events')
        .select('*')
        .eq('status', 'published')
        .order('date', { ascending: false })

      if (eventsError) {
        throw new Error(`Failed to fetch events: ${eventsError.message}`)
      }

      const today = new Date()
      const upcoming = eventsData?.filter(event => new Date(event.date) >= today) || []
      const past = eventsData?.filter(event => new Date(event.date) < today) || []
      
      setEvents(activeSection === 'upcoming' ? upcoming : past)
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
    }
  }

  const handleEditEvent = (event: YogaEvent) => {
    setEditingEvent(event)
    setEventData({
      slug: event.slug,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      timezone: event.timezone,
      duration: event.duration,
      location: event.location,
      price: event.price,
      max_participants: event.max_participants,
      instructor: event.instructor,
      instructor_description: event.instructor_description,
      level: event.level,
      images: event.images,
      requirements: event.requirements,
      benefits: event.benefits
    })
    setActiveSection('create')
  }

  const handleDeleteEvent = async (eventSlug: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('yoga_events')
        .delete()
        .eq('slug', eventSlug)

      if (deleteError) {
        throw new Error(`Failed to delete event: ${deleteError.message}`)
      }

      setSuccess('Event deleted successfully!')
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
      
      // Refresh events list
      fetchEvents()
    } catch (err) {
      
      setError(err instanceof Error ? err.message : 'Failed to delete event')
    }
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!eventData.title || !eventData.date || !eventData.time || !eventData.location) {
      setError('Please fill in all required fields')
      return
    }

    if (!editingEvent) return

    try {
      setIsSaving(true)
      setError(null)

      const { data: eventDataResult, error: eventError } = await supabase
        .from('yoga_events')
        .update({
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
          updated_at: new Date().toISOString()
        })
        .eq('slug', editingEvent.slug)

      if (eventError) {
        
        throw eventError
      }

      
      setSuccess('Yoga event updated successfully!')
      setTimeout(() => {
        setSuccess(null)
        router.push('/yoga')
      }, 2000)

    } catch (error) {
      
      setError(error instanceof Error ? error.message : 'Failed to update yoga event')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof YogaEvent, value: string | number) => {
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
          
          continue
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName)
        
        imageUrls.push(publicUrl)
      } catch (error) {
        
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
      
      console.log('Creating yoga event with data:', {
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
        benefits: eventData.benefits
      })
      
      // Create the yoga event
      
      
      
      
      
      
      const eventPayload = {
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
        images: eventData.images || [],
        requirements: eventData.requirements || [],
        benefits: eventData.benefits || [],
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      
      
      
      
      const { data: eventDataResult, error: eventError } = await supabase
        .from('yoga_events')
        .insert(eventPayload)

      if (eventError) {
        
        throw eventError
      }

      
      setSuccess('Yoga event created successfully!')
      setTimeout(() => {
        router.push('/yoga')
      }, 2000)

    } catch (error) {
      
      setError(error instanceof Error ? error.message : 'Failed to create yoga event')
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Admin Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">
            {editingEvent ? 'Edit Yoga Event' : 'Yoga Event Management'}
          </h1>
          <p className="text-white/60">
            {editingEvent ? 'Update an existing yoga event' : 'Create, edit, and manage yoga events'}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-1 inline-flex">
            <button
              onClick={() => {
                setActiveSection('create')
                setEditingEvent(null)
                setEventData({
                  slug: '',
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
                  benefits: []
                })
              }}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeSection === 'create'
                  ? 'bg-[#fbcc1e] text-black shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Plus size={16} />
              <span>{editingEvent ? 'Edit Event' : 'Create Event'}</span>
            </button>
            <button
              onClick={() => {
                setActiveSection('upcoming')
                setEditingEvent(null)
              }}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeSection === 'upcoming'
                  ? 'bg-[#fbcc1e] text-black shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Calendar size={16} />
              <span>Upcoming Events</span>
            </button>
            <button
              onClick={() => {
                setActiveSection('past')
                setEditingEvent(null)
              }}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeSection === 'past'
                  ? 'bg-[#fbcc1e] text-black shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Clock size={16} />
              <span>Past Events</span>
            </button>
          </div>
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

        {/* Content Based on Active Section */}
        {activeSection === 'create' ? (
          /* Create/Edit Form */
          <form onSubmit={editingEvent ? handleUpdateEvent : handleSubmit} className="space-y-6">
            <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingEvent ? 'Edit Event Details' : 'Event Details'}
              </h2>
            
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
                  placeholder="e.g., 60 minutes, 2 hours"
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
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  value={eventData.description}
                  onChange={(e) => handleInputChange('description', e.target.value.slice(0, 100))}
                  rows={3}
                  maxLength={100}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#fbcc1e]"
                  placeholder="Describe the yoga event (max 100 characters)..."
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
                placeholder="Add a requirement (e.g., Yoga mat, Water bottle)"
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
                placeholder="Add a benefit (e.g., Improved flexibility, Stress relief)"
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
        ) : activeSection === 'upcoming' || activeSection === 'past' ? (
          /* Events List */
          <div className="space-y-6">
            <div className="bg-[#1C1C24] rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                {activeSection === 'upcoming' ? 'Upcoming Events' : 'Past Events'}
              </h2>
              
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">
                    {activeSection === 'upcoming' 
                      ? 'No upcoming yoga events found' 
                      : 'No past yoga events found'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.slug} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                          <p className="text-white/60 text-sm mb-3 line-clamp-2">{event.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-white/60">
                              <Calendar size={14} />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                              <Clock size={14} />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                              <MapPin size={14} />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                              <Users size={14} />
                              <span>{event.current_participants}/{event.max_participants}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Edit
                          </button>
                          {activeSection === 'upcoming' && (
                            <button
                              onClick={() => handleDeleteEvent(event.slug)}
                              className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
