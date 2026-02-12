'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { PageHeader } from '@/components/PageHeader'
import { Sparkles, Scale, CalendarDays, Shield, Award, Heart, Lock, MessageCircle, Calendar, Phone, MessageSquare, Video, Clock, Star, CheckCircle, TrendingUp, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookingModal } from '@/components/booking-modal'
import { TrustSection } from '@/components/trust-section'
import { Testimonials } from '@/components/testimonials'
import { Stats } from '@/components/stats'
import { FilterSortBar } from '@/components/filter-sort-bar'
import { TopicFilter } from '@/components/topic-filter'

function AvailabilityBadge({ availability }: { availability: 'online' | 'today' | 'appointment' }) {
  const getBadgeStyles = () => {
    switch (availability) {
      case 'online':
        return 'bg-green-100 text-green-700'
      case 'today':
        return 'bg-yellow-100 text-yellow-800'
      case 'appointment':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getBadgeText = () => {
    switch (availability) {
      case 'online':
        return 'Online Now'
      case 'today':
        return 'Available Today'
      case 'appointment':
        return 'Available by Appointment'
      default:
        return 'Available by Appointment'
    }
  }

  return (
    <div className={`text-xs font-medium px-3 py-1 rounded-full ${getBadgeStyles()}`}>
      {availability === 'online' && (
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 animate-ping opacity-75"></span>
      )}
      {getBadgeText()}
    </div>
  )
}

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}

function FeatureCard({ title, description, icon, href }: FeatureCardProps) {
  return (
    <Link href={href}>
      <Card className="p-4 bg-card border border-border rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer group">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <h3 className="text-sm md:text-base font-medium text-foreground text-center">
          {title}
        </h3>
      </Card>
    </Link>
  )
}

const features = [
  {
    title: 'Horoscope',
    description: '',
    icon: <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-accent" />,
    href: '/astrology/daily-horoscope'
  },
  {
    title: 'Kundli',
    description: '',
    icon: <Scale className="w-5 h-5 md:w-6 md:h-6 text-accent" />,
    href: '/astrology/kundli-matching'
  },
  {
    title: 'Panchang',
    description: '',
    icon: <CalendarDays className="w-5 h-5 md:w-6 md:h-6 text-accent" />,
    href: '/astrology/panchang'
  }
]

const astrologers = [
  {
    name: 'Priya Sharma',
    expertise: 'Vedic Astrology and Birth Chart Analysis',
    image: '👩‍🔬',
    availability: 'online' as const,
    price: 999,
    responseTime: '10 minutes',
    rating: 4.9,
    reviews: 342,
    experience: '12 years',
    clients: 1250,
    verified: true,
    specializations: ['Vedic', 'Birth Chart', 'Remedies']
  },
  {
    name: 'Raj Patel',
    expertise: 'Western Astrology & Tarot Reading',
    image: '👨‍🔬',
    availability: 'today' as const,
    price: 1299,
    responseTime: '1 hour',
    rating: 4.8,
    reviews: 289,
    experience: '8 years',
    clients: 980,
    verified: true,
    specializations: ['Western', 'Tarot', 'Relationships']
  },
  {
    name: 'Meera Gupta',
    expertise: 'Numerology & Palmistry',
    image: '👩‍💼',
    availability: 'appointment' as const,
    price: 799,
    responseTime: '2 hours',
    rating: 4.7,
    reviews: 156,
    experience: '6 years',
    clients: 620,
    verified: false,
    specializations: ['Numerology', 'Palmistry', 'Vastu']
  },
  {
    name: 'Arjun Reddy',
    expertise: 'Predictive Astrology & Life Coaching',
    image: '👨‍💼',
    availability: 'online' as const,
    price: 1599,
    responseTime: '30 minutes',
    rating: 5.0,
    reviews: 478,
    experience: '15 years',
    clients: 2100,
    verified: true,
    specializations: ['Predictive', 'Life Coaching', 'Career']
  },
]

export default function AstrologyPage() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f3] bg-[radial-gradient(circle_at_20%_30%,rgba(251,204,30,0.08),transparent_40%)]">
      <Navigation />

      <main className="flex-1">
        {/* Compact Service Introduction */}
        <section className="relative pt-8 md:pt-12 pb-10 md:pb-14 px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-6xl mx-auto">
            <div className="text-left">
              <h1 className="text-lg md:text-xl font-bold text-foreground mb-4 leading-tight md:whitespace-nowrap">
                Expert Vedic Astrology Services
              </h1>
              
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mb-8 leading-relaxed">
                Get clarity in love, career, finances and life decisions with trusted astrology guidance.
              </p>
            </div>

            {/* Service Cards - Single Responsive Grid */}
            <div className="grid grid-cols-3 gap-3 px-4 mb-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center"
                >
                  <div className="w-6 h-6 mx-auto mb-2 text-primary transition-transform duration-300 group-hover:scale-110 hover:text-accent">
                    {feature.icon}
                  </div>
                  <span className="text-base font-semibold">
                    {feature.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Connect with our expert astrologers - Header */}
        <section className="pt-4 md:pt-6 pb-3 md:pb-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 leading-tight md:whitespace-nowrap">
              Connect with our expert astrologers
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-3">
              Browse verified astrologers and filter by availability, rating, and consultation mode.
            </p>
          </div>
        </section>

        {/* Quick Topic Filter */}
        <TopicFilter 
          resultCount={astrologers.length}
          onTopicChange={(topic) => {
            // Filter astrologers by specialization based on topic
            console.log('Topic selected:', topic)
          }}
        />

        {/* Filter and Sort Bar */}
        <FilterSortBar resultCount={astrologers.length} />

        {/* Astrologer Cards */}
        <section id="astrologer-grid" className="pb-12 md:pb-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {astrologers.map((astrologer) => (
                <Card key={astrologer.name} className="p-5 text-center relative">
                  {/* Availability Badge - Top Right */}
                  <div className="absolute top-4 right-4">
                    <AvailabilityBadge availability={astrologer.availability} />
                  </div>
                  
                  {/* Profile Image */}
                  <div className="text-6xl mb-4 flex justify-center relative">
                    {astrologer.image}
                    {astrologer.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Name and Verification */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {astrologer.name}
                    </h3>
                    {astrologer.verified && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <CheckCircle size={12} />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Expertise */}
                  <p className="text-sm text-muted-foreground mb-3">
                    {astrologer.expertise}
                  </p>
                  
                  {/* Specializations */}
                  <div className="flex flex-wrap gap-1 justify-center mb-3">
                    {astrologer.specializations.slice(0, 2).map((spec, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {spec}
                      </span>
                    ))}
                  </div>
                  
                  {/* Credibility Metrics */}
                  <div className="flex items-center justify-center gap-3 mb-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{astrologer.rating}</span>
                      <span>({astrologer.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>{astrologer.clients}+</span>
                    </div>
                  </div>
                  
                  {/* Experience */}
                  <div className="text-xs text-gray-500 mb-3">
                    {astrologer.experience} experience
                  </div>
                  
                  {/* Pricing */}
                  <div className="text-sm font-medium text-gray-800 mb-2">
                    Starting from ₹{astrologer.price} / session
                  </div>
                  
                  {/* Response Time */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <Clock size={14} />
                    <span>Responds within {astrologer.responseTime}</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-4">
                    <Button
                      size="sm"
                      onClick={() => setBookingOpen(true)}
                      className="bg-[#fbcc1e] hover:bg-yellow-500 text-black font-medium px-6 py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      Book Appointment
                    </Button>
                    
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs text-muted-foreground">Available for:</p>
                      <div className="flex gap-4">
                        <button
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#fbcc1e] transition-all duration-200 flex items-center justify-center"
                          title="Chat"
                        >
                          <MessageSquare size={18} className="text-gray-600 hover:text-black" />
                        </button>
                        <button
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#fbcc1e] transition-all duration-200 flex items-center justify-center"
                          title="Voice Call"
                        >
                          <Phone size={18} className="text-gray-600 hover:text-black" />
                        </button>
                        <button
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#fbcc1e] transition-all duration-200 flex items-center justify-center"
                          title="Video Call"
                        >
                          <Video size={18} className="text-gray-600 hover:text-black" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Astrology Statistics */}
        <Stats 
          stats={[
            {
              icon: <Users className="w-8 h-8 text-secondary" />,
              value: '25,000+',
              label: 'Consultations Delivered',
              targetNumber: 25000,
            },
            {
              icon: <Award className="w-8 h-8 text-secondary" />,
              value: '15+',
              label: 'Years Combined Astrological Experience',
              targetNumber: 15,
            },
            {
              icon: <TrendingUp className="w-8 h-8 text-secondary" />,
              value: '98%',
              label: 'Client Satisfaction Rate',
              targetNumber: 98,
            },
            {
              icon: <Users className="w-8 h-8 text-secondary" />,
              value: '5,000+',
              label: 'Happy Clients Worldwide',
              targetNumber: 5000,
            },
          ]}
        />

        {/* Reviews */}
        <Testimonials
          title="What Our Astrology Clients Say"
          description="Read testimonials from people whose lives have been transformed through our astrology services."
        />

        {/* Trust Section */}
        <TrustSection />
      </main>

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        service="Astrology"
        experts={['Priya Sharma', 'Raj Patel', 'Meera Gupta', 'Arjun Reddy']}
      />
    </div>
  )
}
