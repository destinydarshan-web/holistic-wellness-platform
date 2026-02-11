'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, Phone, Calendar, CalendarDays, Sun, Moon, Clock } from 'lucide-react'
import { Testimonials } from '@/components/testimonials'
import { TrustBadges } from '@/components/trust-badges'
import { BookingModal } from '@/components/booking-modal'
import { ServiceCTALink } from '@/components/service-cta-link'
import { PageHeader } from '@/components/PageHeader'

const astrologers = [
  {
    name: 'Priya Sharma',
    expertise: 'Vedic Panchang and Muhurat',
    image: '👩‍🔬',
  },
  {
    name: 'Raj Patel',
    expertise: 'Traditional Calendar Systems',
    image: '👨‍🔬',
  },
  {
    name: 'Meera Gupta',
    expertise: 'Auspicious Timing Analysis',
    image: '👩‍💼',
  },
  {
    name: 'Arjun Reddy',
    expertise: 'Planetary Positions and Effects',
    image: '👨‍💼',
  },
]

export default function PanchangPage() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <PageHeader title="Panchang" />

        {/* About Panchang */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Ancient Vedic Calendar System
              </h2>
              <p className="text-foreground leading-relaxed mb-4">
                Panchang is a traditional Hindu calendar and almanac that provides important astronomical and astrological information. It helps determine auspicious times (Muhurat) for various activities and ceremonies.
              </p>
              <p className="text-foreground leading-relaxed">
                Our expert astrologers provide accurate Panchang calculations and guidance to help you plan important life events at the most favorable times, ensuring success and prosperity.
              </p>
            </Card>
          </div>
        </section>

        {/* Panchang Elements */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Five Elements of Panchang
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Tithi
                </h3>
                <p className="text-sm text-muted-foreground">
                  Lunar day and phase
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sun className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Vara
                </h3>
                <p className="text-sm text-muted-foreground">
                  Day of the week
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Moon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Nakshatra
                </h3>
                <p className="text-sm text-muted-foreground">
                  Lunar mansion or constellation
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Yoga
                </h3>
                <p className="text-sm text-muted-foreground">
                  Luni-solar conjunction
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Karana
                </h3>
                <p className="text-sm text-muted-foreground">
                  Half lunar period
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Panchang Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 border-border">
                <h3 className="text-xl font-bold text-primary mb-3">
                  Daily Panchang
                </h3>
                <p className="text-foreground mb-4">
                  Get accurate daily Panchang information including auspicious times, planetary positions, and important astrological events.
                </p>
                <Button
                  size="sm"
                  onClick={() => setBookingOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  View Today's Panchang
                </Button>
              </Card>
              <Card className="p-6 border-border">
                <h3 className="text-xl font-bold text-primary mb-3">
                  Muhurat Calculation
                </h3>
                <p className="text-foreground mb-4">
                  Find the most auspicious timing for important events like weddings, business ventures, and religious ceremonies.
                </p>
                <Button
                  size="sm"
                  onClick={() => setBookingOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Calculate Muhurat
                </Button>
              </Card>
              <Card className="p-6 border-border">
                <h3 className="text-xl font-bold text-primary mb-3">
                  Personalized Guidance
                </h3>
                <p className="text-foreground mb-4">
                  Consult with our expert astrologers for personalized Panchang-based guidance for your specific needs and concerns.
                </p>
                <Button
                  size="sm"
                  onClick={() => setBookingOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Book Consultation
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Experts */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12">
              Panchang Experts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      Consult
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
          title="What Our Panchang Clients Say"
          description="Read testimonials from people who have benefited from our Panchang and Muhurat services."
        />
      </main>

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        service="Panchang"
        experts={['Priya Sharma', 'Raj Patel', 'Meera Gupta', 'Arjun Reddy']}
      />
    </div>
  )
}
