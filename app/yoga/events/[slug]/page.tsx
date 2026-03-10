'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  IndianRupee, 
  User, 
  ArrowLeft, 
  Shield,
  Heart,
  Star,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Leaf,
  ChevronLeft,
  MessageCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

// Import fonts for consistency
import { Poppins, Merriweather } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-merriweather',
})

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
  current_participants: number
  instructor: string
  instructor_description?: string
  level: string
  images?: string[]
  requirements?: string[]
  benefits?: string[]
  status: string
  created_at: string
  updated_at: string
}

export default function YogaEventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [event, setEvent] = useState<YogaEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (slug) {
      fetchEvent()
    }
  }, [slug])

  // Auto carousel for images (desktop only)
  useEffect(() => {
    if (!event || !event.images || event.images.length <= 1) return

    // Check if we're on mobile (screen width < 1024px for lg breakpoint)
    const isMobile = window.innerWidth < 1024
    if (isMobile) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === event.images!.length - 1 ? 0 : prevIndex + 1
      )
    }, 3000) // Change image every 3 seconds

    return () => clearInterval(interval)
  }, [event])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('yoga_events')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error('Event not found')
      }

      setEvent(data)
    } catch (err) {
      console.error('Error fetching event:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch event')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleBooking = async () => {
    if (!event) return

    setIsBooking(true)
    try {
      // Here you would implement the actual booking logic
      // For now, we'll just simulate a successful booking
      await new Promise(resolve => setTimeout(resolve, 2000))
      setBookingSuccess(true)
    } catch (err) {
      console.error('Booking error:', err)
      setError('Failed to complete booking')
    } finally {
      setIsBooking(false)
    }
  }

  const goToPreviousImage = () => {
    if (!event || !event.images) return
    setCurrentImageIndex(currentImageIndex === 0 ? event.images.length - 1 : currentImageIndex - 1)
  }

  const goToNextImage = () => {
    if (!event || !event.images) return
    setCurrentImageIndex(currentImageIndex === event.images.length - 1 ? 0 : currentImageIndex + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-[#fdce20] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'This event could not be found.'}</p>
          <Link
            href="/yoga"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#fdce20] text-black font-semibold rounded-lg hover:bg-[#fdce20]/80 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Yoga Events
          </Link>
        </div>
      </div>
    )
  }

  const spotsLeft = event.max_participants - event.current_participants
  const isFullyBooked = spotsLeft <= 0

  return (
    <div className={`min-h-screen bg-[#0F0F14] pt-20 ${poppins.variable} ${merriweather.variable}`}>
      {/* Hero Section - Carousel on Desktop, Scrollable on Mobile */}
      <div className="relative h-96 overflow-hidden">
        {event.images && event.images.length > 0 ? (
          <>
            {/* Desktop: Auto Carousel */}
            <div className="hidden lg:block relative w-full h-full">
              {event.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${event.title} - Image ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              
              {/* Desktop Carousel Controls */}
              {event.images.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={goToPreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  {/* Next Button */}
                  <button
                    onClick={goToNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                  >
                    <ChevronRight size={20} />
                  </button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {event.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-[#fdce20]' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mobile: Scrollable Images */}
            <div className="lg:hidden relative w-full h-full">
              <div className="flex overflow-x-auto snap-x snap-mandatory w-full h-full">
                {event.images.map((image, index) => (
                  <div key={index} className="w-full h-full flex-shrink-0 snap-center">
                    <img
                      src={image}
                      alt={`${event.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              
              {/* Mobile Scroll Indicators */}
              {event.images.length > 1 && (
                <>
                  {/* Left Scroll Indicator */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 pointer-events-none">
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </div>
                  
                  {/* Right Scroll Indicator */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 pointer-events-none">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                  
                  {/* Photo Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 pointer-events-none">
                    <span className="text-white text-xs font-medium">
                      1 / {event.images.length}
                    </span>
                  </div>
                  
                  {/* Scroll Hint Animation */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-1 pointer-events-none">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                      <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                    </div>
                    <span className="text-white/60 text-xs animate-pulse">Swipe</span>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#fdce20]/20 to-[#f97316]/20 flex items-center justify-center">
            <Leaf className="w-24 h-24 text-[#fdce20]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F14] via-transparent to-transparent"></div>
        
        {/* Back Button */}
        <div className="absolute top-8 left-6 z-10">
          <Link
            href="/yoga"
            className="flex items-center justify-center w-10 h-10 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
        </div>

        {/* Event Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-[#fdce20] text-black text-sm font-semibold rounded-full">
                {event.level.charAt(0).toUpperCase() + event.level.slice(1)}
              </span>
              {isFullyBooked ? (
                <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
                  Fully Booked
                </span>
              ) : (
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                  {spotsLeft} spots left
                </span>
              )}
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold text-white mb-4 ${merriweather.className}`}>
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className={`text-xl font-bold text-white mb-4 ${merriweather.className}`}>About This Event</h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                {event.description}
              </p>
            </section>

            {/* Instructor */}
            {event.instructor_description && (
              <section>
                <h2 className={`text-xl font-bold text-white mb-4 ${merriweather.className}`}>Meet Your Instructor</h2>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-[#fdce20] rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-black" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold text-white ${merriweather.className}`}>{event.instructor}</h3>
                      <p className="text-gray-400">Certified Yoga Instructor</p>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {event.instructor_description}
                  </p>
                </div>
              </section>
            )}

            {/* Requirements */}
            {event.requirements && event.requirements.length > 0 && (
              <section>
                <h2 className={`text-xl font-bold text-white mb-4 ${merriweather.className}`}>What to Bring</h2>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <ul className="space-y-3">
                    {event.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-[#fdce20] flex-shrink-0" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Benefits */}
            {event.benefits && event.benefits.length > 0 && (
              <section>
                <h2 className={`text-xl font-bold text-white mb-4 ${merriweather.className}`}>Benefits</h2>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <ul className="space-y-3">
                    {event.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-300">
                        <Star className="w-5 h-5 text-[#fdce20] flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Event Details Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className={`text-lg font-bold text-white mb-6 ${merriweather.className}`}>Event Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="w-5 h-5 text-[#fdce20]" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="w-5 h-5 text-[#fdce20]" />
                    <span>{formatTime(event.time)} ({event.timezone})</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="w-5 h-5 text-[#fdce20]" />
                    <span>Duration: {event.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin className="w-5 h-5 text-[#fdce20]" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Users className="w-5 h-5 text-[#fdce20]" />
                    <span>{event.current_participants}/{event.max_participants} participants</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-gray-400">Price</span>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-5 h-5 text-[#fdce20]" />
                      <span className="text-2xl font-bold text-white">₹{event.price}</span>
                    </div>
                  </div>

                  {bookingSuccess ? (
                    <div className="text-center py-4 px-6 bg-green-500/20 border border-green-500 rounded-lg">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-green-400 font-semibold">Booking Confirmed!</p>
                      <p className="text-gray-400 text-sm mt-1">Check your email for details</p>
                    </div>
                  ) : (
                    <a
                      href={`https://wa.me/919038984582?text=Hello Destiny Darshan! 🙏 I'm interested in joining your yoga event: "${event.title}". 🧑‍🏫 Instructor: ${event.instructor}. 📅 Date: ${formatDate(event.date)} ⏰ Time: ${formatTime(event.time)} 📍 Location: ${event.location} 💰 Price: ₹${event.price}. Could you please provide more details about booking and availability? Thank you! 🧘‍♀️`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-6 font-semibold rounded-lg transition-colors bg-[#fdce20] text-black hover:bg-[#fdce20]/80 flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Ask on WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Why Choose Us</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Shield className="w-5 h-5 text-[#fdce20]" />
                    <span className="text-sm">Secure Booking</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Heart className="w-5 h-5 text-[#fdce20]" />
                    <span className="text-sm">Expert Instructors</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-[#fdce20]" />
                    <span className="text-sm">Satisfaction Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0F0F14] border-t border-white/10 p-4 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-[#fdce20]" />
              <span className="text-xl font-bold text-white">₹{event.price}</span>
            </div>
            {bookingSuccess ? (
              <div className="flex-1 text-center py-2 px-4 bg-green-500/20 border border-green-500 rounded-lg">
                <p className="text-green-400 font-semibold text-sm">Booking Confirmed!</p>
              </div>
            ) : (
              <a
                href={`https://wa.me/919038984582?text=Hello Destiny Darshan! 🙏 I'm interested in joining your yoga event: "${event.title}". 🧑‍🏫 Instructor: ${event.instructor}. 📅 Date: ${formatDate(event.date)} ⏰ Time: ${formatTime(event.time)} 📍 Location: ${event.location} 💰 Price: ₹${event.price}. Could you please provide more details about booking and availability? Thank you! 🧘‍♀️`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-6 font-semibold rounded-lg transition-colors bg-[#fdce20] text-black hover:bg-[#fdce20]/80 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Enquire
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
