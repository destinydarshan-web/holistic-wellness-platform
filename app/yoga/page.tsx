'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, Phone, MapPin, Clock, Calendar } from 'lucide-react'
import { Testimonials } from '@/components/testimonials'
import { TrustBadges } from '@/components/trust-badges'
import { BookingModal } from '@/components/booking-modal'
import { ServiceCTALink } from '@/components/service-cta-link'
import { ServiceHero } from '@/components/service-hero'

const events = [
  {
    name: 'Morning Vinyasa Flow',
    date: '2024-02-15',
    time: '6:00 AM',
    mode: 'Online',
    description: 'Dynamic flow practice to energize your morning and build strength.',
  },
  {
    name: 'Hatha Yoga Basics',
    date: '2024-02-16',
    time: '10:00 AM',
    mode: 'Offline',
    description: 'Perfect for beginners. Learn fundamental yoga poses and breathing techniques.',
  },
  {
    name: 'Evening Yin Yoga',
    date: '2024-02-17',
    time: '5:30 PM',
    mode: 'Online',
    description: 'Slow-paced practice to relax and restore. Great for flexibility and deep stretching.',
  },
  {
    name: 'Power Yoga for Strength',
    date: '2024-02-18',
    time: '7:00 AM',
    mode: 'Offline',
    description: 'Build strength and endurance with this challenging power yoga session.',
  },
  {
    name: 'Restorative Yoga & Meditation',
    date: '2024-02-19',
    time: '6:00 PM',
    mode: 'Online',
    description: 'Combine gentle yoga with meditation for deep relaxation and stress relief.',
  },
  {
    name: 'Yoga for Back Pain Relief',
    date: '2024-02-20',
    time: '4:00 PM',
    mode: 'Offline',
    description: 'Specialized session targeting back flexibility and pain relief through gentle poses.',
  },
]

const instructors = [
  {
    name: 'Lisa Anderson',
    type: 'Vinyasa & Power Yoga Specialist',
    image: '👩‍🏫',
  },
  {
    name: 'Amit Sharma',
    type: 'Hatha & Traditional Yoga',
    image: '👨‍🏫',
  },
  {
    name: 'Sophie Laurent',
    type: 'Yin & Restorative Yoga',
    image: '👩‍⚕️',
  },
]

export default function YogaPage() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <ServiceHero
          title="Yoga Classes"
          description="Strengthen your body and calm your mind through yoga practice."
          backgroundImage="/images/hero-yoga.png"
        />

        {/* Yoga Overview
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto mb-12">
            <Card className="p-8 border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Discover the Benefits of Yoga
              </h2>
              <p className="text-foreground leading-relaxed">
                Our yoga programs are designed for all levels, from beginners to advanced practitioners. Whether you're looking to build strength, improve flexibility, reduce stress, or find inner peace, we have a class for you. Join our experienced instructors for sessions that will transform both your body and mind.
              </p>
            </Card>
          </div>
        </section> */}

        {/* Upcoming Events */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12">
              Upcoming Yoga Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.name} className="p-6 border-border">
                  <h3 className="text-lg font-bold text-primary mb-3">
                    {event.name}
                  </h3>
                  <div className="space-y-2 mb-4 text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span className="px-2 py-1 bg-secondary/20 text-secondary rounded">
                        {event.mode}
                      </span>
                    </div>
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

        {/* Instructors */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12">
              Our Yoga Instructors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {instructors.map((instructor) => (
                <Card key={instructor.name} className="p-6 text-center">
                  <div className="text-6xl mb-4 flex justify-center">
                    {instructor.image}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {instructor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {instructor.type}
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
          title="What Our Yoga Students Say"
          description="Discover how our yoga classes have transformed the lives of our community."
        />
      </main>

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        service="Yoga"
        experts={['Lisa Anderson', 'Amit Sharma', 'Sophie Laurent']}
      />
    </div>
  )
}
