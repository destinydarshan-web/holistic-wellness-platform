'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, Phone, MapPin, Clock, Calendar, Users, Award } from 'lucide-react'
import Link from 'next/link'
import { Testimonials } from '@/components/testimonials'
import { TrustBadges } from '@/components/trust-badges'
import { BookingModal } from '@/components/booking-modal'
import { ServiceCTALink } from '@/components/service-cta-link'
import { PageHeader } from '@/components/PageHeader'
import { meditationEvents } from '@/lib/meditationEvents'

export default function MeditationPage() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        {/* Page Header */}
        <PageHeader title="Meditation" />

        {/* Upcoming Events */}
        <section className="py-4 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Upcoming Meditation Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meditationEvents.map((event) => (
                <Card key={event.title} className="p-6 border-border">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-primary">
                      {event.title}
                    </h3>
                    {event.level && (
                      <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                        {event.level}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 mb-4 text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span className="px-2 py-1 bg-secondary/20 text-secondary rounded">
                        {event.venue}
                      </span>
                    </div>
                    {event.trainer && (
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>{event.trainer}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-foreground text-sm mb-4 leading-relaxed">
                    {event.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    {event.price && (
                      <span className="text-lg font-semibold text-primary">
                        {event.price}
                      </span>
                    )}
                    <Link href={`/meditation/${event.slug}`}>
                      <Button 
                        className="text-accent hover:underline hover:translate-x-1 bg-transparent border border-border hover:bg-transparent text-accent shadow-none transition-all duration-200"
                      >
                        Details &gt;
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Instructors */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12">
              Our Meditation Instructors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {meditationEvents.map((event, index) => (
                <Card key={`${event.trainer}-${index}`} className="p-6 text-center">
                  <div className="text-6xl mb-4 flex justify-center">
                    {event.trainer}
                  </div>
                  <p className="text-muted-foreground">
                    {event.level} Meditation Instructor
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      onClick={() => setBookingOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Book Session
                    </Button>
                    <Button
                      size="sm"
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    >
                      <MessageCircle size={16} className="mr-2" />
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
          title="What Our Meditation Clients Say"
          description="Read testimonials from people whose lives have been transformed through our meditation services."
        />
      </main>

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        service="Meditation"
        experts={meditationEvents.map(e => e.trainer)}
      />
    </div>
  )
}