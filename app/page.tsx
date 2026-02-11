'use client'

import React from "react"

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Leaf, Heart, Lightbulb, Zap, ArrowRight, Badge } from 'lucide-react'
import { Testimonials } from '@/components/testimonials'
import { Stats } from '@/components/stats'
import { TrustBadges } from '@/components/trust-badges'
import { BookingModal } from '@/components/booking-modal'
import { ServiceCTALink } from '@/components/service-cta-link'
import { HeroVideo } from '@/components/hero-video'
import { ScrollAnimatedSection } from '@/components/scroll-animated-section'
import { generateRecommendation } from '@/utils/recommendation'

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
  secondary?: string
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
    icon: <Lightbulb className="w-12 h-12 text-secondary" />,
    link: '/astrology',
  },
  counselling: {
    service: 'Counselling',
    description:
      'Professional mental health support to help you navigate life challenges. Our certified counsellors provide a safe, non-judgmental space for growth.',
    icon: <Heart className="w-12 h-12 text-secondary" />,
    link: '/counselling',
  },
  yoga: {
    service: 'Yoga',
    description:
      'Strengthen your body and mind through yoga practice. Join our instructors for sessions that improve flexibility, balance, and overall wellness.',
    icon: <Leaf className="w-12 h-12 text-secondary" />,
    link: '/yoga',
  },
  meditation: {
    service: 'Meditation',
    description:
      'Find inner peace and mental clarity through guided meditation. Our meditation guides offer various techniques to calm your mind and reduce stress.',
    icon: <Zap className="w-12 h-12 text-secondary" />,
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
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingService, setBookingService] = useState('')

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.concern.trim()) {
      alert('Please describe your concern')
      return
    }

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

      // Send form data to email API (async, don't wait)
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
      }).catch((error) => console.error('[v0] Error sending form to email:', error))

      // Show recommendation without success message
      setRecommendation(rec)
      setSubmitted(true)
    } catch (error) {
      console.error('[v0] Error getting recommendation:', error)
      // Fallback to Counselling if AI fails
      const fallbackRec: RecommendationData & { secondary?: SecondaryService; reason?: string } = {
        ...recommendations.counselling,
        reason: 'Our counselling service provides compassionate support to help you navigate your challenges with clarity and confidence.',
      }
      setRecommendation(fallbackRec)
      setSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section with Background Video */}
        <HeroVideo
          title="Balance your mind, body and  soul"
          subtitle="We blend ancient wisdom with modern guidance to support your wellness journey."
        />

        {/* Form Section - Reduced Top Padding */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 -mt-12">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 border-border">
              <h2 className="text-2xl font-bold text-foreground mb-2">
               Begin Your Guidance Journey
              </h2>
              <p className="text-muted-foreground mb-6">
              Tell us what you’re facing - Career, love, stress, life direction, whatever and we’ll suggest the right path.
              </p>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        placeholder="0000000000"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Describe Your Concern or Question
                    </label>
                    <Textarea
                      name="concern"
                      placeholder="What is in your mind today? 🔒 Your information is kept confidential."
                      value={formData.concern}
                      onChange={handleChange}
                      className="w-full min-h-28"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {isLoading ? 'Analyzing Your Concern...' : 'Get Personalized Recommendation'}
                  </Button>
                </form>
              ) : (
                <div className="space-y-6">
                  {recommendation && (
                    <div className="space-y-4">
                      {/* Primary Recommendation - AI Powered */}
                      <Card className="p-8 border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm">
                        <div className="flex items-start gap-6">
                          <div className="flex-shrink-0 pt-1">
                            {recommendation.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <h3 className="text-3xl font-bold text-primary">
                                {recommendation.service}
                              </h3>
                              <Badge className="bg-primary text-primary-foreground">
                                Recommended
                              </Badge>
                            </div>
                            
                            {/* AI-Generated Reasoning - Prominent */}
                            <div className="bg-white/50 rounded-lg p-4 mb-4 border-l-4 border-primary">
                              <p className="text-base text-foreground font-medium leading-relaxed">
                                {recommendation.reason}
                              </p>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-6">
                              {recommendation.description}
                            </p>
                            
                            <ServiceCTALink 
                              serviceName={recommendation.service}
                              serviceHref={recommendation.link}
                            />
                          </div>
                        </div>
                      </Card>

                      {/* Secondary Recommendation */}
                      {recommendation.secondary && (
                        <Card className="p-6 border border-secondary/40 bg-secondary/5 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground mb-2 text-lg">
                                {recommendation.secondary.service}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                {recommendation.secondary.reason}
                              </p>
                              <ServiceCTALink 
                                serviceName={recommendation.secondary.service}
                                serviceHref={recommendations[recommendation.secondary.service.toLowerCase() as keyof typeof recommendations]?.link || '/'}
                              />
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      setSubmitted(false)
                      setRecommendation(null)
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        concern: '',
                      })
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Submit Another Concern
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Stats Section */}
        <Stats />

        {/* Services Overview */}
        <ScrollAnimatedSection className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Our Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.values(recommendations).map((service, index) => (
                <div key={service.service} className={`animate-scroll-fade-in scroll-animate-stagger-${Math.min(index + 1, 4)}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                    <div className="flex justify-center mb-4">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-center text-foreground mb-3">
                      {service.service}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      {service.description.substring(0, 80)}...
                    </p>
                    <a href={service.link} className="block">
                      <Button
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent"
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

        {/* Testimonials Section */}
        <Testimonials />
      </main>

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        service={bookingService}
        experts={['Priya Sharma', 'Raj Patel', 'Meera Gupta', 'Arjun Reddy']}
      />
    </div>
  )
}
