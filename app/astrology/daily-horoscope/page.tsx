'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { MessageCircle, Phone, Calendar, Star, Moon, Sparkles, Clock, RefreshCw } from 'lucide-react'
import { Testimonials } from '@/components/testimonials'
import { TrustBadges } from '@/components/trust-badges'
import { horoscopes as fallbackHoroscopes } from '@/data/horoscopes'
import AstrologerCard from '@/components/AstrologerCard'

interface HoroscopeData {
  sign: string
  dates: string
  symbol: string
  horoscope: string
}

interface Expert {
  id: string
  display_name: string
  avatar_url: string
  bio: string
  experience_years: number
  price_per_minute: number
  specialties: string[]
  is_profile_complete: boolean
  is_online: boolean
  created_at?: string
  updated_at?: string
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
  aries: 'Mar 21 - Apr 19',
  taurus: 'Apr 20 - May 20',
  gemini: 'May 21 - Jun 20',
  cancer: 'Jun 21 - Jul 22',
  leo: 'Jul 23 - Aug 22',
  virgo: 'Aug 23 - Sep 22',
  libra: 'Sep 23 - Oct 22',
  scorpio: 'Oct 23 - Nov 21',
  sagittarius: 'Nov 22 - Dec 21',
  capricorn: 'Dec 22 - Jan 19',
  aquarius: 'Jan 20 - Feb 18',
  pisces: 'Feb 19 - Mar 20',
}

const getCurrentDate = () => {
  const date = new Date()
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const getTodayKey = () => {
  const date = new Date()
  return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

const horoscopes = fallbackHoroscopes;

export default function DailyHoroscopePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedAstrologer, setSelectedAstrologer] = useState<Expert | null>(null)
  const [horoscopeData, setHoroscopeData] = useState<HoroscopeData[]>(fallbackHoroscopes)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [experts, setExperts] = useState<Expert[]>([])
  const [expertsLoading, setExpertsLoading] = useState(true)
  const [expertsError, setExpertsError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHoroscopes = async () => {
      try {
        setLoading(true)
        setError(false)
        
        const todayKey = getTodayKey()
        const cacheKey = `horoscope_${todayKey}`
        
        // Check if we have cached data for today
        const cachedData = localStorage.getItem(cacheKey)
        if (cachedData) {
          const { data: cachedHoroscopes, timestamp } = JSON.parse(cachedData)
          const cacheDate = new Date(timestamp).toDateString()
          const today = new Date().toDateString()
          
          if (cacheDate === today) {
            console.log('[DailyHoroscope] Using cached data for', todayKey)
            setHoroscopeData(cachedHoroscopes)
            setLastUpdated(timestamp)
            setLoading(false)
            return
          }
        }

        // Fetch fresh data
        console.log('[DailyHoroscope] Fetching fresh horoscope data for', todayKey)
        const response = await fetch('/api/horoscope')
        
        if (!response.ok) {
          throw new Error('Failed to fetch horoscopes')
        }

        const data = await response.json()
        console.log('[DailyHoroscope] Horoscope data fetched:', data.cached ? '(cached)' : '(fresh)')

        const transformed: HoroscopeData[] = Object.entries(data.horoscopes).map(
          ([sign, horoscope]) => {
            const capitalizedSign = sign.charAt(0).toUpperCase() + sign.slice(1)
            return {
              sign: capitalizedSign,
              dates: zodiacDates[sign] || '',
              symbol: zodiacSymbols[sign] || '☆',
              horoscope: String(horoscope),
            }
          }
        )

        // Cache the data for today
        const now = new Date().toISOString()
        localStorage.setItem(cacheKey, JSON.stringify({
          data: transformed,
          timestamp: now
        }))

        setHoroscopeData(transformed)
        setLastUpdated(now)
        
      } catch (err) {
        console.error('[DailyHoroscope] Error fetching horoscopes:', err)
        setError(true)
        
        // Try to use yesterday's cached data if available
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayKey = yesterday.toISOString().split('T')[0]
        const yesterdayCache = localStorage.getItem(`horoscope_${yesterdayKey}`)
        
        if (yesterdayCache) {
          console.log('[DailyHoroscope] Using yesterday\'s cached data as fallback')
          const { data: yesterdayData } = JSON.parse(yesterdayCache)
          setHoroscopeData(yesterdayData)
        } else {
          setHoroscopeData(fallbackHoroscopes)
        }
      } finally {
        setLoading(false)
      }
    }

    const fetchExperts = async () => {
      try {
        setExpertsLoading(true)
        setExpertsError(null)
        
        console.log('[DailyHoroscope] Fetching experts...')
        const response = await fetch('/api/experts')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch experts: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('[DailyHoroscope] Experts fetched:', result)
        
        if (result.success && result.data) {
          setExperts(result.data)
        } else {
          throw new Error(result.error || 'Failed to fetch experts')
        }
      } catch (err) {
        console.error('[DailyHoroscope] Error fetching experts:', err)
        setExpertsError(err instanceof Error ? err.message : 'Failed to load experts')
      } finally {
        setExpertsLoading(false)
      }
    }

    fetchHoroscopes()
    fetchExperts()
    
    // Set up auto-refresh at midnight
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime()
    
    const midnightTimer = setTimeout(() => {
      console.log('[DailyHoroscope] Auto-refreshing at midnight')
      fetchHoroscopes()
    }, msUntilMidnight)

    return () => clearTimeout(midnightTimer)
  }, [])

  const handleBookConsultation = (astrologer: Expert) => {
    setSelectedAstrologer(astrologer)
    setIsBookingOpen(true)
  }

  const handleRefresh = () => {
    // Clear today's cache and force refresh
    const todayKey = getTodayKey()
    localStorage.removeItem(`horoscope_${todayKey}`)
    
    // Trigger a fresh fetch
    window.location.reload()
  }

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navigation />
      
      {/* Date/Time Header */}
      <section className="pt-20 lg:pt-24 pb-6 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white/80 text-sm font-medium mb-6">
              <Moon className="w-4 h-4" />
              Daily Cosmic Guidance
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-3 text-white">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold">{getCurrentDate()}</span>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2 rounded-full"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Today's Horoscope
            </h1>
            
            {lastUpdated && (
              <div className="flex items-center justify-center gap-2 text-white/60 text-sm mb-2">
                <Clock className="w-3 h-3" />
                <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
              </div>
            )}
            
            {error && (
              <p className="text-sm text-yellow-400/80">
                ℹ Using local horoscope data
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Horoscope Cards Section */}
      <section className="pb-8 lg:pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl shadow-black/40 p-6 animate-pulse">
                  <div className="h-20 bg-white/10 rounded-md"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {horoscopeData.map((horoscope) => (
                <div
                  key={horoscope.sign}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl shadow-black/40 p-6 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {horoscope.sign}
                      </h3>
                      <p className="text-xs text-white/60">
                        {horoscope.dates}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black text-2xl group-hover:scale-110 transition-transform duration-300">
                      {horoscope.symbol}
                    </div>
                  </div>
                  <p className="text-white/80 leading-relaxed text-sm mb-4">
                    {horoscope.horoscope}
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Star className="w-4 h-4" />
                      <span className="text-xs font-medium">Cosmic Energy Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Expert Astrologers Section */}
      <section className="py-16 lg:py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Expert Astrologers
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Connect with our experienced astrologers for personalized guidance
            </p>
          </div>

          {expertsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl shadow-black/40 p-6 animate-pulse">
                  <div className="h-32 bg-white/10 rounded-md"></div>
                </div>
              ))}
            </div>
          ) : expertsError ? (
            <div className="text-center py-12">
              <p className="text-white/70 mb-4">{expertsError}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:from-yellow-500 hover:to-amber-600"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experts.map((expert) => (
                <AstrologerCard key={expert.id} astrologer={expert} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-yellow-400/10 to-amber-500/10 rounded-3xl p-8 lg:p-12 border border-yellow-400/20">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Get Your Personalized Reading
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Connect with our expert astrologers for detailed insights into your life's journey and future possibilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => experts.length > 0 && handleBookConsultation(experts[0])}
                disabled={experts.length === 0}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-8 py-4 rounded-full text-lg font-semibold shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Personalized Reading
              </Button>
              <Link
                href="/astrology"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/20 text-white rounded-full text-lg font-semibold backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                Back to Astrology
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Footer */}
      <Footer />

      {/* Simple Booking Modal */}
      {isBookingOpen && selectedAstrologer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f172a] rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Book Astrology Consultation</h3>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-2xl mx-auto mb-2">
                {selectedAstrologer.avatar_url ? (
                  <img src={selectedAstrologer.avatar_url} alt={selectedAstrologer.display_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <h4 className="text-lg font-semibold text-white">{selectedAstrologer.display_name}</h4>
              <p className="text-white/70 text-sm">{selectedAstrologer.specialties.join(', ')}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsBookingOpen(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Link href="/astrology" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:from-yellow-500 hover:to-amber-600">
                  Proceed to Booking
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
