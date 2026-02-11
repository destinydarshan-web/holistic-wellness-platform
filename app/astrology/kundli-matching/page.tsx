'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, Phone, Calendar, Heart, Scale } from 'lucide-react'
import { Testimonials } from '@/components/testimonials'
import { TrustBadges } from '@/components/trust-badges'
import { BookingModal } from '@/components/booking-modal'
import { ServiceCTALink } from '@/components/service-cta-link'
import { PageHeader } from '@/components/PageHeader'

const astrologers = [
  {
    name: 'Priya Sharma',
    expertise: 'Vedic Astrology and Kundli Analysis',
    image: '👩‍🔬',
  },
  {
    name: 'Raj Patel',
    expertise: 'Compatibility & Relationship Astrology',
    image: '👨‍🔬',
  },
  {
    name: 'Meera Gupta',
    expertise: 'Traditional Kundli Matching',
    image: '👩‍💼',
  },
  {
    name: 'Arjun Reddy',
    expertise: 'Modern Relationship Compatibility',
    image: '👨‍💼',
  },
]

export default function KundliMatchingPage() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <PageHeader title="Kundli Matching" />

        {/* About Kundli Matching */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Find Your Perfect Match
              </h2>
              <p className="text-foreground leading-relaxed mb-4">
                Kundli Matching is a sacred Vedic astrology practice that helps determine the compatibility between two individuals for marriage or long-term relationships. Our expert astrologers analyze birth charts to assess compatibility across multiple dimensions.
              </p>
              <p className="text-foreground leading-relaxed">
                We examine 36 different aspects (Gunas) to provide comprehensive insights into your relationship potential, helping you make informed decisions about your future together.
              </p>
            </Card>
          </div>
        </section>

        {/* Matching Process */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Our Matching Process
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scale className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Birth Chart Analysis
                </h3>
                <p className="text-sm text-muted-foreground">
                  Detailed analysis of both individuals' birth charts
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  36 Gunas Matching
                </h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive compatibility assessment across all aspects
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Muhurat Analysis
                </h3>
                <p className="text-sm text-muted-foreground">
                  Auspicious timing for marriage and relationship milestones
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Personalized Guidance
                </h3>
                <p className="text-sm text-muted-foreground">
                  Expert consultation for relationship success
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Experts */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12">
              Kundli Matching Experts
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
          title="What Our Kundli Matching Clients Say"
          description="Hear from couples who found their perfect match through our astrology services."
        />
      </main>

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        service="Kundli Matching"
        experts={['Priya Sharma', 'Raj Patel', 'Meera Gupta', 'Arjun Reddy']}
      />
    </div>
  )
}
