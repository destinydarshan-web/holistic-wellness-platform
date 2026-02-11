'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, Phone, Clock, Calendar } from 'lucide-react'
import { Testimonials } from '@/components/testimonials'
import { TrustBadges } from '@/components/trust-badges'
import { BookingModal } from '@/components/booking-modal'
import { ServiceCTALink } from '@/components/service-cta-link'
import { ServiceHero } from '@/components/service-hero'

const events = [
  {
    name: 'Guided Mindfulness Meditation',
    date: '2024-02-15',
    time: '7:00 AM',
    description: 'Start your day with mindfulness. Learn to observe thoughts without judgment.',
  },
  {
    name: 'Mantra Meditation for Peace',
    date: '2024-02-16',
    time: '6:00 PM',
    description: 'Use sacred mantras to calm your mind and elevate your consciousness.',
  },
  {
    name: 'Body Scan Relaxation',
    date: '2024-02-17',
    time: '5:30 PM',
    description: 'Progressive relaxation technique to release tension from your entire body.',
  },
  {
    name: 'Chakra Balancing Meditation',
    date: '2024-02-18',
    time: '7:00 PM',
    description: 'Harmonize your energy centers through chakra-focused meditation.',
  },
  {
    name: 'Loving-Kindness Meditation',
    date: '2024-02-19',
    time: '6:30 PM',
    description: 'Cultivate compassion and love for yourself and others.',
  },
  {
    name: 'Sleep & Deep Relaxation',
    date: '2024-02-20',
    time: '9:00 PM',
    description: 'Drift into peaceful sleep with guided relaxation and meditation.',
  },
]

const guides = [
  {
    name: 'Ravi Shankar',
    type: 'Mindfulness & Vipassana',
    image: '👨‍🧘',
  },
  {
    name: 'Ananya Das',
    type: 'Mantra & Chakra Meditation',
    image: '👩‍🧘',
  },
  {
    name: 'Thomas Wright',
    type: 'Guided Visualization & Sleep',
    image: '👨‍⚕️',
  },
]

export default function MeditationPage() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <ServiceHero
          title="Meditation & Mindfulness"
          description="Find inner peace and mental clarity through guided meditation practices."
          backgroundImage="/images/hero-meditation.png"
        />

        {/* Meditation Overview
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto mb-12">
            <Card className="p-8 border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                The Power of Meditation
              </h2>
              <p className="text-foreground leading-relaxed mb-4">
                Meditation is a transformative practice that helps you calm your mind, reduce stress, and connect with your inner self. Our guided meditation sessions are designed for all levels, whether you're a complete beginner or an experienced meditator.
              </p>
              <p className="text-foreground leading-relaxed">
                Through consistent practice, you'll experience improved mental clarity, emotional balance, better sleep, and a deeper sense of peace and well-being.
              </p>
            </Card>
          </div>
        </section> */}

        {/* Upcoming Events */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12">
              Upcoming Meditation Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.name} className="p-6 border-border">
                  <h3 className="text-lg font-bold text-primary mb-3">
                    {event.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-4 text-sm text-foreground">
                    <Clock size={16} />
                    <span>{event.time}</span>
                  </div>
                  <p className="text-foreground text-sm mb-4 leading-relaxed">
                    {event.description}
                  </p>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Register
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Meditation Guides */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12">
              Our Meditation Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <Card key={guide.name} className="p-6 text-center">
                  <div className="text-6xl mb-4 flex justify-center">
                    {guide.image}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {guide.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {guide.type}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      onClick={() => {
                        const bookingOpen = true
                      }}
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

        {/* Trust Badges */}
        <TrustBadges />

        {/* Testimonials */}
        <Testimonials
          title="What Our Meditation Students Say"
          description="Hear from people who have transformed their lives through our meditation guidance."
        />

        {/* Benefits Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Benefits of Regular Meditation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-border">
                <h3 className="text-lg font-bold text-primary mb-3">
                  Stress Relief
                </h3>
                <p className="text-foreground text-sm">
                  Reduce anxiety and stress through proven mindfulness techniques.
                </p>
              </Card>
              <Card className="p-6 border-border">
                <h3 className="text-lg font-bold text-primary mb-3">
                  Mental Clarity
                </h3>
                <p className="text-foreground text-sm">
                  Improve focus, concentration, and decision-making abilities.
                </p>
              </Card>
              <Card className="p-6 border-border">
                <h3 className="text-lg font-bold text-primary mb-3">
                  Better Sleep
                </h3>
                <p className="text-foreground text-sm">
                  Fall asleep faster and experience deeper, more restful sleep.
                </p>
              </Card>
              <Card className="p-6 border-border">
                <h3 className="text-lg font-bold text-primary mb-3">
                  Emotional Balance
                </h3>
                <p className="text-foreground text-sm">
                  Develop emotional resilience and inner peace.
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
        service="Meditation"
        experts={['Ravi Shankar', 'Ananya Das', 'Thomas Wright']}
      />
    </div>
  )
}
