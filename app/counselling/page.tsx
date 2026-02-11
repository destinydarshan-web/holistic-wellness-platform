'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, Phone, Calendar } from 'lucide-react'
import { Testimonials } from '@/components/testimonials'
import { TrustBadges } from '@/components/trust-badges'
import { BookingModal } from '@/components/booking-modal'
import { ServiceCTALink } from '@/components/service-cta-link'
import { ServiceHero } from '@/components/service-hero'

const counsellors = [
  {
    name: 'Dr. Sarah Mitchell',
    specialization: 'Relationship & Family Counselling',
    image: '👩‍⚕️',
  },
  {
    name: 'Dr. James Chen',
    specialization: 'Career & Stress Management',
    image: '👨‍⚕️',
  },
  {
    name: 'Emily Rodriguez',
    specialization: 'Anxiety & Depression Support',
    image: '👩‍💻',
  },
  {
    name: 'Michael Thompson',
    specialization: 'Life Coach & Personal Growth',
    image: '👨‍💼',
  },
  {
    name: 'Dr. Priya Nair',
    specialization: 'Trauma & PTSD Specialist',
    image: '👩‍🏫',
  },
  {
    name: 'David Kumar',
    specialization: 'Mindfulness & Well-being Coach',
    image: '👨‍🏫',
  },
]

export default function CounsellingPage() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <ServiceHero
          title="Professional Counselling"
          description="Get support from certified counsellors in a safe, non-judgmental space."
          backgroundImage="/images/hero-counselling.png"
        />

        {/* About Counselling
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Card className="p-8 border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                About Our Counselling Services
              </h2>
              <p className="text-foreground leading-relaxed mb-4">
                Our team of experienced and certified counsellors provides professional mental health support for a wide range of challenges. Whether you're dealing with relationship issues, career stress, anxiety, depression, or life transitions, we're here to help you navigate your journey.
              </p>
              <p className="text-foreground leading-relaxed">
                Each session is confidential, personalized, and tailored to your specific needs. We believe in creating a safe space where you can openly discuss your concerns and work towards meaningful change and growth.
              </p>
            </Card>
          </div>
        </section> */}

        {/* Our Counsellors */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12">
              Our Counsellors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {counsellors.map((counsellor) => (
                <Card key={counsellor.name} className="p-6 text-center">
                  <div className="text-6xl mb-4 flex justify-center">
                    {counsellor.image}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {counsellor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {counsellor.specialization}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      onClick={() => {
                        setBookingOpen(true)
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
                      Chat
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Why Choose Our Counselling
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6 border-border">
                <h3 className="text-xl font-bold text-primary mb-3">
                  Certified Professionals
                </h3>
                <p className="text-foreground">
                  All our counsellors are certified and trained in evidence-based therapeutic approaches.
                </p>
              </Card>
              <Card className="p-6 border-border">
                <h3 className="text-xl font-bold text-primary mb-3">
                  Complete Confidentiality
                </h3>
                <p className="text-foreground">
                  Your privacy is our priority. All sessions are completely confidential and secure.
                </p>
              </Card>
              <Card className="p-6 border-border">
                <h3 className="text-xl font-bold text-primary mb-3">
                  Flexible Scheduling
                </h3>
                <p className="text-foreground">
                  Book sessions at times that work for you, with online and offline options available.
                </p>
              </Card>
              <Card className="p-6 border-border">
                <h3 className="text-xl font-bold text-primary mb-3">
                  Personalized Approach
                </h3>
                <p className="text-foreground">
                  Each counsellor tailors their approach to your unique situation and goals.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Testimonials */}
        <Testimonials
          title="What Our Counselling Clients Say"
          description="Hear from people who have found support and healing through our counselling services."
        />
      </main>

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        service="Counselling"
        experts={['Dr. Sarah Mitchell', 'Dr. James Chen', 'Emily Rodriguez', 'Michael Thompson']}
      />
    </div>
  )
}
