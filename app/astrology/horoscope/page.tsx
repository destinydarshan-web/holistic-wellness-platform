'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, Phone, Calendar } from 'lucide-react'
import { Testimonials } from '@/components/testimonials'
import { TrustBadges } from '@/components/trust-badges'
import { BookingModal } from '@/components/booking-modal'
import { ServiceCTALink } from '@/components/service-cta-link'
import { horoscopes as fallbackHoroscopes } from '@/data/horoscopes'

interface HoroscopeData {
  sign: string
  dates: string
  symbol: string
  horoscope: string
}

const zodiacSymbols: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
}

const zodiacDates: Record<string, string> = {
  aries: '',
  taurus: '',
  gemini: '',
  cancer: '',
  leo: '',
  virgo: '',
  libra: '',
  scorpio: '',
  sagittarius: '',
  capricorn: '',
  aquarius: '',
  pisces: '',
}

const getCurrentDate = () => {
  const date = new Date()

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

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

const horoscopes = fallbackHoroscopes;

export default function DailyHoroscopePage() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingService, setBookingService] = useState('')
  const [horoscopeData, setHoroscopeData] = useState<HoroscopeData[]>(fallbackHoroscopes)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchHoroscopes = async () => {
      try {
        setLoading(true)
        setError(false)
        const response = await fetch('/api/horoscope')
        
        if (!response.ok) {
          throw new Error('Failed to fetch horoscopes')
        }

        const data = await response.json()
        console.log('[v0] Horoscope data fetched:', data.cached ? '(cached)' : '(fresh)')

        const transformed: HoroscopeData[] = Object.entries(data.horoscopes).map(
          ([sign, horoscope]) => {
            const capitalizedSign =
              sign.charAt(0).toUpperCase() + sign.slice(1)
            return {
              sign: capitalizedSign,
              dates: zodiacDates[sign] || '',
              symbol: zodiacSymbols[sign] || '☆',
              horoscope: String(horoscope),
            }
          }
        )

        setHoroscopeData(transformed)
      } catch (err) {
        console.error('[v0] Error fetching horoscopes:', err)
        setError(true)
        setHoroscopeData(fallbackHoroscopes)
      } finally {
        setLoading(false)
      }
    }

    fetchHoroscopes()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <section className="py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-4">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Daily Horoscope
              </h2>
              <p className="text-lg text-foreground font-semibold">
                Horoscope for {getCurrentDate()}
              </p>
              {error && (
                <p className="text-sm text-muted-foreground mt-2">
                  ℹ Using local horoscope data
                </p>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-20 bg-muted rounded-md"></div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {horoscopeData.map((horoscope) => (
                  <Card
                    key={horoscope.sign}
                    className="p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-primary">
                          {horoscope.sign}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {horoscope.dates}
                        </p>
                      </div>
                      <span className="text-4xl">{horoscope.symbol}</span>
                    </div>
                    <p className="text-foreground leading-relaxed">
                      {horoscope.horoscope}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Our Astrologers */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12">
              Meet Our Astrologers
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
                      onClick={() => {
                        setBookingService('Astrology')
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
          title="What Our Astrology Clients Say"
          description="Read testimonials from people whose lives have been transformed through our astrology services."
        />
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
