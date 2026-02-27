'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Leaf, Heart, Lightbulb, Zap, ArrowRight, Badge, Sparkles, HeartHandshake, Leaf as YogaLeaf, Brain, Phone, Check } from 'lucide-react'
import { Testimonials } from '@/components/testimonials'
import { Stats } from '@/components/stats'
import { TrustBadges } from '@/components/trust-badges'
import { BookingModal } from '@/components/booking-modal'
import { ServiceCTALink } from '@/components/service-cta-link'
import { ScrollAnimatedSection } from '@/components/scroll-animated-section'
import { ServiceQuickLinks } from '@/components/ServiceQuickLinks'
import { ServiceIcon } from '@/components/ServiceIcon'

interface FormData {
  name: string
  email: string
  phone: string
  concern: string
}

interface RecommendationData {
  service: string
  description: string
  icon: React.ReactNode
  link: string
  secondary?: SecondaryService
  reason?: string
}

interface SecondaryService {
  service: string
  reason: string
}

interface AIRecommendationResponse {
  primaryService: 'Astrology' | 'Counselling' | 'Yoga' | 'Meditation'
  secondaryService?: 'Astrology' | 'Counselling' | 'Yoga' | 'Meditation'
  reason: string
}

const recommendations: { [key: string]: RecommendationData } = {
  astrology: {
    service: 'Astrology',
    description:
      'Gain insights into your life path and future through astrological guidance. Our experienced astrologers provide personalized readings based on your birth chart.',
    icon: <Lightbulb className="w-5 h-5 text-foreground" />,
    link: '/astrology',
  },
  counselling: {
    service: 'Counselling',
    description:
      'Professional mental health support to help you navigate life challenges. Our certified counsellors provide a safe, non-judgmental space for growth.',
    icon: <Heart className="w-5 h-5 text-foreground" />,
    link: '/counselling',
  },
  yoga: {
    service: 'Yoga',
    description:
      'Strengthen your body and mind through yoga practice. Join our instructors for sessions that improve flexibility, balance, and overall wellness.',
    icon: <Leaf className="w-5 h-5 text-foreground" />,
    link: '/yoga',
  },
  meditation: {
    service: 'Meditation',
    description:
      'Find inner peace and mental clarity through guided meditation. Our meditation guides offer various techniques to calm your mind and reduce stress.',
    icon: <Zap className="w-5 h-5 text-foreground" />,
    link: '/meditation',
  },
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    concern: '',
  })
  const [recommendation, setRecommendation] = useState<RecommendationData & { secondary?: SecondaryService; reason?: string } | null>(
    null
  )
  const [status, setStatus] = useState<'idle' | 'loading' | 'result'>('idle')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingService, setBookingService] = useState('')
  const [showResults, setShowResults] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const getServiceKey = (serviceName: string): keyof typeof recommendations => {
    const key = serviceName.toLowerCase() as keyof typeof recommendations
    return key in recommendations ? key : 'counselling'
  }

  const buildSecondaryService = (secondaryName?: string): SecondaryService | undefined => {
    if (!secondaryName) return undefined
    
    const supportingReasons: Record<string, Record<string, string>> = {
      'Astrology,Meditation': {
        Meditation: 'Balance cosmic insights with meditation to gain inner clarity and peace.'
      },
      'Counselling,Astrology': {
        Astrology: 'Gain astrological insights into timing and cosmic influences on your decisions.'
      },
      'Meditation,Yoga': {
        Yoga: 'Complement meditation with yoga for holistic stress relief and physical relaxation.'
      },
      'Yoga,Meditation': {
        Meditation: 'Enhance your practice with meditation for deeper mental and spiritual benefits.'
      }
    }

    const reasonKey = `${getServiceKey(secondaryName)},${getServiceKey(secondaryName)}`
    const reason = supportingReasons[reasonKey]?.[secondaryName] || 
      'This complements your primary service for a more holistic wellness approach.'

    return {
      service: secondaryName,
      reason
    }
  }

  const handleTryAgain = () => {
    setRecommendation(null)
    setStatus('idle')
    setSubmitted(false)
    setShowResults(false)
    // Reset form data
    setFormData({
      name: '',
      email: '',
      phone: '',
      concern: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.concern.trim()) {
      alert('Please describe your concern')
      return
    }

    setStatus('loading')
    setIsLoading(true)

    try {
      // Call AI recommendation API
      console.log('[v0] Requesting AI recommendation...')
      const aiResponse = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concern: formData.concern,
          name: formData.name,
        }),
      })

      if (!aiResponse.ok) {
        throw new Error('Failed to get recommendation')
      }

      const aiData: AIRecommendationResponse = await aiResponse.json()
      console.log('[v0] AI recommendation received:', aiData.primaryService)

      // Build recommendation data with service details
      const serviceKey = getServiceKey(aiData.primaryService)
      const primaryData = recommendations[serviceKey]
      
      const rec: RecommendationData & { secondary?: SecondaryService; reason?: string } = {
        ...primaryData,
        reason: aiData.reason,
        secondary: aiData.secondaryService 
          ? buildSecondaryService(aiData.secondaryService)
          : undefined,
      }

      // Simulate thoughtful AI processing time
      await new Promise(resolve => setTimeout(resolve, 1200))

      // Send form data to email API (async, don't wait)
      console.log('[AUDIT] Triggering email API with data:', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        concern: formData.concern,
        recommendedService: rec.service,
        aiReason: rec.reason,
        submittedAt: new Date().toLocaleString(),
      })
      
      fetch('/api/send-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          concern: formData.concern,
          recommendedService: rec.service,
          aiReason: rec.reason,
          submittedAt: new Date().toLocaleString(),
        }),
      }).catch(error => {
        console.error('[AUDIT] Email API call failed:', error)
      }).catch((error) => console.error('[v0] Error sending form to email:', error))

      console.log('[v0] Setting recommendation:', rec)
      setRecommendation(rec)
      setSubmitted(true)
      setStatus('result')
    } catch (error) {
      console.error('[v0] Error getting recommendation:', error)
      // Fallback to Counselling if AI fails
      const fallbackRec: RecommendationData & { secondary?: SecondaryService; reason?: string } = {
        ...recommendations.counselling,
        reason: 'Our counselling service provides compassionate support to help you navigate your challenges with clarity and confidence.',
      }
      console.log('[v0] Setting fallback recommendation:', fallbackRec)
      setRecommendation(fallbackRec)
      setSubmitted(true)
      setStatus('result')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh]">
      {/* Hero Section with Video Background */}
      <section className="relative min-h-[85vh] overflow-hidden">
        {/* Video Background */}
        {/* Desktop Video (md and above) */}
        <video 
          className="hidden md:block absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        >
          <source src="/videos/hero-stars.mp4" type="video/mp4" />
        </video>

        {/* Mobile Video (below md) */}
        <video 
          className="block md:hidden absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        >
          <source src="/videos/hero_mobile.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-black/50 md:bg-black/40 z-10"></div>
        
        {/* Main Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 z-10"></div>
        
        {/* Subtle Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,200,0,0.08),_transparent_60%)] z-5"></div>
        
        {/* Hero Content with Proper Top Spacing */}
        <div className="relative z-20 pt-24 lg:pt-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh] pb-14 sm:pb-20">
              {/* Left Column - Content */}
              <div className="space-y-6 max-w-xl text-center lg:text-left animate-fade-in">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
                  Holistic Wellness Platform
                </h1>
                <p className="text-lg md:text-xl leading-relaxed text-white/90">
                  </p>
                
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <a href="#form-section" className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 sm:py-4 rounded-full text-base font-semibold whitespace-nowrap shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition-all duration-200 mx-2">
                    Get My Personalized Guidance
                  </a>
                  <a href="tel:+919038984582" className="w-full sm:w-auto bg-white/5 border border-white/20 backdrop-blur-md text-white px-6 py-3 sm:py-4 rounded-full text-base font-semibold whitespace-nowrap flex items-center justify-center gap-2 active:bg-white/10 transition-all duration-200 mx-2">
                    <span className="text-sm sm:text-base">📞</span>
                    Talk to an Expert
                  </a>
                </div>
                
                <p className="text-xs sm:text-sm text-white/60">
                  🔒 100% confidential • Trusted by 1000+ clients
                </p>
              </div>

              {/* Right Column - Glassmorphism Service Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-[360px]:grid-cols-1">
                <Link href="/astrology" className="block group">
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/40 p-3 sm:p-6 hover:bg-white/10 active:scale-[0.98] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <div className="flex justify-center mb-2">
                      <ServiceIcon type="astrology" className="w-12 h-12 sm:w-14 sm:h-14" />
                    </div>
                    <h3 className="text-white font-bold text-base sm:text-lg font-semibold mb-1 text-center">Astrology</h3>
                    <p className="text-white/80 text-sm text-center hidden sm:block">Discover your cosmic path</p>
                  </div>
                </Link>
                
                <Link href="/counselling" className="block group">
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/40 p-3 sm:p-6 hover:bg-white/10 active:scale-[0.98] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <div className="flex justify-center mb-2">
                      <ServiceIcon type="counselling" className="w-12 h-12 sm:w-14 sm:h-14" />
                    </div>
                    <h3 className="text-white font-bold text-base sm:text-lg font-semibold mb-1 text-center">Counselling</h3>
                    <p className="text-white/80 text-sm text-center hidden sm:block">Professional mental support</p>
                  </div>
                </Link>
                
                <Link href="/yoga" className="block group">
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/40 p-3 sm:p-6 hover:bg-white/10 active:scale-[0.98] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <div className="flex justify-center mb-2">
                      <ServiceIcon type="yoga" className="w-12 h-12 sm:w-14 sm:h-14" />
                    </div>
                    <h3 className="text-white font-bold text-base sm:text-lg font-semibold mb-1 text-center">Yoga</h3>
                    <p className="text-white/80 text-sm text-center hidden sm:block">Transform mind & body</p>
                  </div>
                </Link>
                
                <Link href="/meditation" className="block group">
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/40 p-3 sm:p-6 hover:bg-white/10 active:scale-[0.98] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <div className="flex justify-center mb-2">
                      <ServiceIcon type="meditation" className="w-12 h-12 sm:w-14 sm:h-14" />
                    </div>
                    <h3 className="text-white font-bold text-base sm:text-lg font-semibold mb-1 text-center">Meditation</h3>
                    <p className="text-white/80 text-sm text-center hidden sm:block">Find inner peace</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1">
        {/* Hero Section with Background Video */}
      

        {/* Form Section - Dynamic Layout */}
        <section id="form-section" className="bg-[#14141A] py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 relative">
          {/* Subtle transition from hero */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            {/* Conditional Layout: Form vs Result */}
            {status === 'result' ? (
              /* Result State - Two Column Premium Layout */
              <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8">
                <div className="bg-[radial-gradient(circle_at_top,_rgba(255,200,0,0.08),_transparent_60%)] rounded-3xl p-5 sm:p-8 lg:p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    {/* Left Side - Primary Recommendation (2 columns span) */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* Service Icon */}
                      <div className="flex justify-center lg:justify-start">
                        <ServiceIcon 
                          type={recommendation?.service.toLowerCase() as 'astrology' | 'counselling' | 'yoga' | 'meditation'}
                          size="lg"
                        />
                      </div>

                      {/* Primary Recommendation */}
                      <div className="space-y-6 text-center lg:text-left">
                        {/* Label */}
                        <p className="text-sm uppercase tracking-widest text-white/60">
                          Best Match For You
                        </p>
                        
                        {/* Service Name */}
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-400">
                          {recommendation?.service}
                        </h2>
                        
                        {/* Personalized Message */}
                        <p className="text-white/80 text-lg leading-relaxed">
                          {formData.name ? `${formData.name}, based on your concern` : 'Based on your concern'}, we recommend {recommendation?.service.toLowerCase()} guidance for your wellness journey.
                        </p>
                      </div>

                      {/* AI Reasoning */}
                      <div className="bg-white/5 rounded-2xl p-6 border-l-4 border-yellow-400/50">
                        <p className="text-white/90 text-base leading-relaxed">
                          {recommendation?.reason}
                        </p>
                      </div>

                      {/* Primary CTA */}
                      <div className="flex justify-center lg:justify-start">
                        <a 
                          href={recommendation?.link}
                          className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                        >
                          Book {recommendation?.service} Session
                        </a>
                      </div>
                    </div>

                    {/* Right Side - Secondary & Actions */}
                    <div className="space-y-6">
                      {/* Secondary Recommendation Card */}
                      {recommendation?.secondary && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
                          <div className="space-y-4">
                            <h3 className="text-sm uppercase tracking-widest text-white/60">
                              You May Also Benefit From
                            </h3>
                            <div className="space-y-3">
                              <p className="text-xl font-bold text-white/90">
                                {recommendation.secondary.service}
                              </p>
                              <p className="text-white/60 text-sm leading-relaxed">
                                {recommendation.secondary.reason}
                              </p>
                            </div>
                            <div className="w-full">
                              <a 
                                href={recommendations[recommendation.secondary.service.toLowerCase() as keyof typeof recommendations]?.link || '/'}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/20 text-white transition-all duration-300 hover:bg-white/10 hover:border-yellow-400 hover:text-yellow-400 group active:scale-95"
                              >
                                Explore {recommendation.secondary.service}
                                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ask Another Question */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white">
                            Have Another Question?
                          </h3>
                          <p className="text-white/60 text-sm leading-relaxed">
                            Our AI is ready to help with any other concerns you may have.
                          </p>
                          <button 
                            onClick={handleTryAgain}
                            className="w-full sm:w-auto bg-white/10 border border-white/20 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-white/20 transition-all duration-300 active:scale-95"
                          >
                            Ask Another Question
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Form State - Two Column Layout */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left Side - Animated AI Form Container */}
                <div className="bg-[#1C1C24] rounded-2xl shadow-2xl shadow-black/50 p-6 lg:p-8 transition-all duration-500 ease-in-out">
                  {/* Idle State - Form */}
                  {status === 'idle' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/40 rounded-lg focus:border-yellow-400 focus:ring-0 transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/40 rounded-lg focus:border-yellow-400 focus:ring-0 transition-all duration-200"
                          placeholder="your@email.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/40 rounded-lg focus:border-yellow-400 focus:ring-0 transition-all duration-200"
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div>
                        <label htmlFor="concern" className="block text-sm font-medium text-white mb-2">
                          What concerns you the most?
                        </label>
                        <textarea
                          id="concern"
                          name="concern"
                          value={formData.concern}
                          onChange={handleChange}
                          required
                          rows={3}
                          className="w-full px-4 py-2.5 text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/40 rounded-lg focus:border-yellow-400 focus:ring-0 transition-all duration-200 resize-none"
                          placeholder="Describe your concerns..."
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 py-2.5 text-base font-semibold mt-4"
                      >
                        Get My Personalized Guidance
                      </Button>
                    </form>
                  )}

                  {/* Loading State - AI Animation */}
                  {status === 'loading' && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-6">
                      {/* AI Orb */}
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 animate-pulse shadow-xl shadow-yellow-500/20"></div>
                        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-yellow-400/30 animate-spin"></div>
                      </div>
                      
                      {/* Animated Text */}
                      <div className="text-center space-y-2">
                        <p className="text-white/90 font-medium animate-pulse">
                          Analyzing your situation
                          <span className="inline-block animate-pulse delay-100">.</span>
                          <span className="inline-block animate-pulse delay-200">.</span>
                          <span className="inline-block animate-pulse delay-300">.</span>
                        </p>
                        <p className="text-white/60 text-sm animate-pulse delay-500">
                          Consulting our AI advisor
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Content */}
                <div className="space-y-6 max-w-lg">
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                      Get Personalized Wellness Guidance
                    </h2>
                    <p className="text-lg text-white/80 mb-6">
                      AI-powered insights tailored to your unique wellness needs.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={16} className="text-black" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">AI-Powered Analysis</h3>
                        <p className="text-sm text-white/70 hidden sm:block">Advanced algorithms analyze your concerns for personalized recommendations</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={16} className="text-black" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Expert Practitioners</h3>
                        <p className="text-sm text-white/70 hidden sm:block">Connect with certified professionals in astrology, counselling, yoga, and meditation</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={16} className="text-black" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Holistic Approach</h3>
                        <p className="text-sm text-white/70 hidden sm:block">Comprehensive wellness solutions addressing mind, body, and spiritual wellbeing</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={16} className="text-black" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Instant AI Insights</h3>
                        <p className="text-sm text-white/70 hidden sm:block">Get immediate guidance tailored to your specific situation and needs</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-white/60">
                      🔒 Your information is completely confidential and will never be shared with third parties.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Services Section */}
      <ScrollAnimatedSection className="py-12 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 bg-[#0F0F14] relative">
        {/* Subtle transition from result */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        
        <div className="max-w-6xl mx-auto pt-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Our Services
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {Object.values(recommendations).map((service, index) => (
              <div key={service.service} className={`animate-scroll-fade-in scroll-animate-stagger-${Math.min(index + 1, 4)}`}>
                <Card className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/40 hover:bg-white/10 transition-all duration-300 h-full max-w-[240px] mx-auto space-y-2">
                  <div className="flex justify-center mb-4">
                    <ServiceIcon 
                      type={service.service.toLowerCase() as 'astrology' | 'counselling' | 'yoga' | 'meditation'}
                      size="md"
                    />
                  </div>
                  <h3 className="text-base font-semibold text-center text-white mb-3">
                    {service.service}
                  </h3>
                  <p className="text-sm text-white/60 text-center mb-4">
                    {service.description.substring(0, 80)}...
                  </p>
                  <a href={service.link} className="block">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                      Explore
                    </Button>
                  </a>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </ScrollAnimatedSection>

      {/* Other sections... */}
      <Testimonials />
      <Stats />
      <TrustBadges />

      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        service={bookingService}
      />
    </div>
  )
}
