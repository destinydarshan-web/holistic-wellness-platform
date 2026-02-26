import { NextRequest, NextResponse } from 'next/server'

interface CachedData {
  data: Record<string, string>
  date: string
  timestamp: number
}

// In-memory cache
let horoscopeCache: CachedData | null = null
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Fallback horoscopes if API fails
const fallbackHoroscopes: Record<string, string> = {
  aries: 'A day full of energy and new opportunities awaits. Trust your instincts and take bold action.',
  taurus: 'Focus on stability and self-care today. Financial prospects look promising.',
  gemini: 'Communication is your strength. New connections bring exciting possibilities.',
  cancer: 'Trust your emotions and intuition. Family matters need your attention.',
  leo: 'Your confidence shines bright today. Leadership opportunities are coming.',
  virgo: 'Attention to detail serves you well. Health and wellness are favored.',
  libra: 'Balance and harmony guide your day. Relationships deepen and flourish.',
  scorpio: 'Deep transformations are underway. Trust the process and embrace change.',
  sagittarius: 'Adventure calls to you. Expand your horizons and explore new paths.',
  capricorn: 'Hard work pays off today. Career advancements are within reach.',
  aquarius: 'Innovation and creativity flow freely. Your unique ideas are valued.',
  pisces: 'Spiritual growth is emphasized. Listen to your inner voice and dreams.',
}

const zodiacSigns = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
]

function getTodayDate(): string {
  const today = new Date(2026, 1, 10) // February 10, 2026
  return today.toISOString().split('T')[0]
}

async function fetchHoroscopesFromAPI(): Promise<Record<string, string>> {
  const today = getTodayDate()
  const horoscopes: Record<string, string> = {}

  try {
    // Fetch from zodiac-api.com for each sign
    const promises = zodiacSigns.map(async (sign) => {
      try {
        const response = await fetch(
          `https://api.api-ninjas.com/v1/horoscope?sign=${sign}`,
          {
            headers: {
              'X-Api-Key': process.env.HOROSCOPE_API_KEY || '',
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          horoscopes[sign] = data.horoscope || fallbackHoroscopes[sign]
        } else {
          horoscopes[sign] = fallbackHoroscopes[sign]
        }
      } catch {
        console.error(`[v0] Error fetching horoscope for ${sign}:`, Error)
        horoscopes[sign] = fallbackHoroscopes[sign]
      }
    })

    await Promise.all(promises)
    return horoscopes
  } catch (error) {
    console.error('[v0] Error fetching horoscopes:', error)
    // Return all fallback horoscopes on error
    const allFallback: Record<string, string> = {}
    zodiacSigns.forEach((sign) => {
      allFallback[sign] = fallbackHoroscopes[sign]
    })
    return allFallback
  }
}

export async function GET(request: NextRequest) {
  try {
    const today = getTodayDate()

    // Check if cache is valid
    if (horoscopeCache && horoscopeCache.date === today) {
      const now = Date.now()
      if (now - horoscopeCache.timestamp < CACHE_DURATION) {
        console.log('[v0] Returning cached horoscope data')
        return NextResponse.json(
          {
            horoscopes: horoscopeCache.data,
            date: today,
            cached: true,
          },
          { headers: { 'Cache-Control': 'public, max-age=3600' } }
        )
      }
    }

    // Fetch fresh data
    console.log('[v0] Fetching fresh horoscope data from API')
    const horoscopes = await fetchHoroscopesFromAPI()

    // Update cache
    horoscopeCache = {
      data: horoscopes,
      date: today,
      timestamp: Date.now(),
    }

    return NextResponse.json(
      {
        horoscopes,
        date: today,
        cached: false,
      },
      { headers: { 'Cache-Control': 'public, max-age=3600' } }
    )
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch horoscopes' },
      { status: 500 }
    )
  }
}
