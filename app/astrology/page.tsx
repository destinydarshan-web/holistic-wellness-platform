'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { PageHeader } from '@/components/PageHeader'
import { Sparkles, Scale, CalendarDays, Shield, Award, Heart, Lock, MessageCircle, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookingModal } from '@/components/booking-modal'
import { Testimonials } from '@/components/testimonials'

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
    title: 'Daily Horoscope',
    description: '',
    icon: <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-accent" />,
    href: '/astrology/daily-horoscope'
  },
  {
    title: 'Kundli Matching',
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
  },
  {
    name: 'Raj Patel',
    expertise: 'Western Astrology & Tarot Reading',
    image: '👨‍🔬',
  },
  {
    name: 'Meera Gupta',
    expertise: 'Numerology & Palmistry',
    image: '👩‍💼',
  },
  {
    name: 'Arjun Reddy',
    expertise: 'Predictive Astrology & Life Coaching',
    image: '👨‍💼',
  },
]

export default function AstrologyPage() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <PageHeader title="Astrology" />

        {/* Feature Cards */}
        <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  href={feature.href}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Meet Our Astrologers */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12">
              Meet Our Astrologers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {astrologers.map((astrologer) => (
                <Card key={astrologer.name} className="p-6 text-center">
                  <div className="text-6xl mb-4 flex justify-center">
                    {astrologer.image}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {astrologer.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {astrologer.expertise}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      onClick={() => setBookingOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                    >
                      <Calendar size={16} />
                      Book Now
                    </Button>
                    <Button
                      size="sm"
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground flex items-center gap-2"
                    >
                      <MessageCircle size={16} />
                      WhatsApp
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <Testimonials
          title="What Our Astrology Clients Say"
          description="Read testimonials from people whose lives have been transformed through our astrology services."
        />

        {/* Trust / Value Proposition */}
        <section className="py-10 md:py-14 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card border border-border rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  100% Confidential Sessions
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your privacy is our top priority. All consultations are completely confidential and secure.
                </p>
              </Card>

              <Card className="bg-card border border-border rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Certified & Experienced Experts
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our astrologers are highly qualified with years of experience in Vedic and Western astrology.
                </p>
              </Card>

              <Card className="bg-card border border-border rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Holistic & Personalized Approach
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We provide tailored guidance that addresses your unique needs and life circumstances.
                </p>
              </Card>

              <Card className="bg-card border border-border rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Secure Communication
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  End-to-end encrypted communication channels ensure your information remains protected.
                </p>
              </Card>
            </div>
          </div>
        </section>
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
