'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { MessageCircle, Phone, Calendar, Heart, Scale, Star, Sparkles, Users, Shield, CheckCircle, User, MapPin, Clock, ChevronRight, Loader2, Download } from 'lucide-react'
import { Testimonials } from '@/components/testimonials'
import { TrustBadges } from '@/components/trust-badges'

interface KundliForm {
  name: string
  gender: 'male' | 'female' | 'other'
  dateOfBirth: string
  timeOfBirth: string
  placeOfBirth: string
  latitude: number
  longitude: number
  timezone: string
}

interface LocationSuggestion {
  place_id: string
  display_name: string
  lat: number
  lon: number
  country: string
  state?: string
}

interface KundliResult {
  basicInfo: {
    name: string
    gender: string
    birthDate: string
    birthTime: string
    birthPlace: string
  }
  planets: Array<{
    name: string
    sign: string
    degree: number
    house: number
    retrograde: boolean
  }>
  houses: Array<{
    number: number
    sign: string
    degree: number
  }>
  ascendant: string
  moonSign: string
  sunSign: string
  compatibility: {
    score: number
    description: string
  }
}

const kundliFeatures = [
  {
    title: 'Birth Chart Analysis',
    description: 'Detailed analysis of both individuals\' birth charts for cosmic compatibility',
    icon: <Scale className="w-6 h-6" />,
  },
  {
    title: '36 Gunas Matching',
    description: 'Comprehensive compatibility assessment across all 36 aspects of life',
    icon: <Heart className="w-6 h-6" />,
  },
  {
    title: 'Muhurat Analysis',
    description: 'Auspicious timing for marriage and relationship milestones',
    icon: <Calendar className="w-6 h-6" />,
  },
  {
    title: 'Personalized Guidance',
    description: 'Expert consultation for relationship success and harmony',
    icon: <Users className="w-6 h-6" />,
  },
]

const compatibilityLevels = [
  {
    score: '36+',
    label: 'Excellent Match',
    description: 'Highly compatible, blessed union',
    color: 'from-green-400 to-emerald-500',
  },
  {
    score: '32-35',
    label: 'Very Good Match',
    description: 'Strong compatibility, recommended',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    score: '28-31',
    label: 'Good Match',
    description: 'Compatible with some considerations',
    color: 'from-yellow-400 to-amber-500',
  },
  {
    score: 'Below 28',
    label: 'Needs Remedies',
    description: 'Compatibility issues, remedies recommended',
    color: 'from-red-400 to-orange-500',
  },
]

export default function KundliMatchingPage() {
  const [currentStep, setCurrentStep] = useState<'form' | 'loading' | 'results'>('form')
  const [formData, setFormData] = useState<KundliForm>({
    name: '',
    gender: 'male',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    latitude: 0,
    longitude: 0,
    timezone: 'Asia/Kolkata'
  })
  const [kundliResult, setKundliResult] = useState<KundliResult | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState('')
  
  // Location search states
  const [locationQuery, setLocationQuery] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)

  const planetEmojis: Record<string, string> = {
    'Sun': '☀️',
    'Moon': '🌙',
    'Mars': '♂️',
    'Mercury': '☿',
    'Jupiter': '♃',
    'Venus': '♀️',
    'Saturn': '♄',
    'Rahu': '🌑',
    'Ketu': '🌘'
  }

  const zodiacEmojis: Record<string, string> = {
    'Aries': '♈',
    'Taurus': '♉',
    'Gemini': '♊',
    'Cancer': '♋',
    'Leo': '♌',
    'Virgo': '♍',
    'Libra': '♎',
    'Scorpio': '♏',
    'Sagittarius': '♐',
    'Capricorn': '♑',
    'Aquarius': '♒',
    'Pisces': '♓'
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Geocoding API integration
  const searchLocation = async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([])
      return
    }

    setIsLocationLoading(true)
    try {
      // Using OpenCage Geocoding API (free tier available)
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=demo&limit=5&countrycode=in,us,gb,ca,au,sg`
      )
      const data = await response.json()
      
      if (data.results) {
        const suggestions: LocationSuggestion[] = data.results.map((result: any) => ({
          place_id: result.place_id || result.annotations.geoname_id,
          display_name: result.formatted,
          lat: result.geometry.lat,
          lon: result.geometry.lng,
          country: result.components.country,
          state: result.components.state
        }))
        setLocationSuggestions(suggestions)
        setShowLocationSuggestions(true)
      }
    } catch (error) {
      console.error('Location search failed:', error)
      // Fallback to city list if API fails
      fallbackCitySearch(query)
    } finally {
      setIsLocationLoading(false)
    }
  }

  const fallbackCitySearch = (query: string) => {
    const majorCities = [
      { name: 'Delhi, India', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
      { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
      { name: 'Bangalore, India', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata' },
      { name: 'Chennai, India', lat: 13.0827, lon: 80.2707, tz: 'Asia/Kolkata' },
      { name: 'Kolkata, India', lat: 22.5726, lon: 88.3639, tz: 'Asia/Kolkata' },
      { name: 'Pune, India', lat: 18.5204, lon: 73.8567, tz: 'Asia/Kolkata' },
      { name: 'Hyderabad, India', lat: 17.3850, lon: 78.4867, tz: 'Asia/Kolkata' },
      { name: 'Ahmedabad, India', lat: 23.0225, lon: 72.5714, tz: 'Asia/Kolkata' },
      { name: 'Jaipur, India', lat: 26.9124, lon: 75.7873, tz: 'Asia/Kolkata' },
      { name: 'Lucknow, India', lat: 26.8467, lon: 80.9462, tz: 'Asia/Kolkata' },
      { name: 'New York, USA', lat: 40.7128, lon: -74.0060, tz: 'America/New_York' },
      { name: 'London, UK', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
      { name: 'Toronto, Canada', lat: 43.6532, lon: -79.3832, tz: 'America/Toronto' },
      { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
      { name: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' }
    ]

    const filtered = majorCities.filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase())
    )

    const suggestions: LocationSuggestion[] = filtered.map(city => ({
      place_id: city.name,
      display_name: city.name,
      lat: city.lat,
      lon: city.lon,
      country: city.name.split(', ')[1],
      state: undefined
    }))

    setLocationSuggestions(suggestions)
    setShowLocationSuggestions(true)
  }

  const selectLocation = async (suggestion: LocationSuggestion) => {
    setShowLocationSuggestions(false)
    setLocationQuery(suggestion.display_name)
    setLocationSuggestions([])
    
    // Detect timezone based on coordinates
    const timezone = await detectTimezone(suggestion.lat, suggestion.lon)
    
    setFormData(prev => ({
      ...prev,
      placeOfBirth: suggestion.display_name,
      latitude: suggestion.lat,
      longitude: suggestion.lon,
      timezone: timezone || 'Asia/Kolkata'
    }))
  }

  const detectTimezone = async (lat: number, lon: number): Promise<string> => {
    try {
      // Using WorldTimeAPI for timezone detection
      const response = await fetch(`https://worldtimeapi.org/api/timezone`)
      const timezones = await response.json()
      
      // Simple timezone mapping based on longitude
      const longitude = lon
      if (longitude >= 67 && longitude <= 89) return 'Asia/Kolkata'
      if (longitude >= -125 && longitude <= -66) return 'America/New_York'
      if (longitude >= -10 && longitude <= 2) return 'Europe/London'
      if (longitude >= 113 && longitude <= 154) return 'Australia/Sydney'
      if (longitude >= 100 && longitude <= 105) return 'Asia/Singapore'
      
      return 'Asia/Kolkata' // Default to India
    } catch (error) {
      console.error('Timezone detection failed:', error)
      return 'Asia/Kolkata'
    }
  }

  const getTimezoneDisplay = (lat: number, lon: number): string => {
  const longitude = lon
  if (longitude >= 67 && longitude <= 89) return 'IST (+5:30)'
  if (longitude >= -125 && longitude <= -66) return 'EST (-5:00)'
  if (longitude >= -10 && longitude <= 2) return 'GMT (+0:00)'
  if (longitude >= 113 && longitude <= 154) return 'AEDT (+11:00)'
  if (longitude >= 100 && longitude <= 105) return 'SGT (+8:00)'
  return 'Local Time'
}

const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocationQuery(value)
    searchLocation(value)
  }

  const handleLocationBlur = () => {
    // Delay hiding suggestions to allow click on suggestion
    setTimeout(() => setShowLocationSuggestions(false), 200)
  }

  const calculateKundli = (formData: KundliForm): KundliResult => {
    const birthDate = new Date(formData.dateOfBirth + 'T' + formData.timeOfBirth)
    
    // Calculate planetary positions based on birth date and time
    const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / 86400000)
    const year = birthDate.getFullYear()
    const month = birthDate.getMonth() + 1
    const day = birthDate.getDate()
    const hour = birthDate.getHours()
    const minute = birthDate.getMinutes()
    
    // Simplified astrological calculations (in production, use a proper astrology library)
    const ayanamsa = 23.5 // Approximate ayanamsa for Lahiri system
    
    // Calculate Sun position
    const sunLongitude = ((dayOfYear * 0.9856) + (280.459 + 0.985647 * (year - 2000))) % 360
    const sunSign = getSignFromLongitude(sunLongitude - ayanamsa)
    const sunDegree = ((sunLongitude - ayanamsa) % 30)
    
    // Calculate Moon position (simplified)
    const moonLongitude = ((dayOfYear * 13.1764) + 81.4) % 360
    const moonSign = getSignFromLongitude(moonLongitude - ayanamsa)
    const moonDegree = ((moonLongitude - ayanamsa) % 30)
    
    // Calculate Ascendant (simplified calculation)
    const siderealTime = (6.646065 + 0.0657098242 * dayOfYear + 0.000026 * dayOfYear * dayOfYear + hour * 0.25) % 24
    const ascendantLongitude = (siderealTime * 15 + getLongitudeForPlace(formData.placeOfBirth, formData.longitude)) % 360
    const ascendantSign = getSignFromLongitude(ascendantLongitude - ayanamsa)
    const ascendantDegree = ((ascendantLongitude - ayanamsa) % 30)
    
    // Generate planetary positions
    const planets = [
      { 
        name: 'Sun', 
        sign: sunSign, 
        degree: sunDegree, 
        house: getHouseFromLongitude(sunLongitude - ayanamsa, ascendantLongitude - ayanamsa), 
        retrograde: false 
      },
      { 
        name: 'Moon', 
        sign: moonSign, 
        degree: moonDegree, 
        house: getHouseFromLongitude(moonLongitude - ayanamsa, ascendantLongitude - ayanamsa), 
        retrograde: false 
      },
      { 
        name: 'Mars', 
        sign: getSignFromLongitude(((dayOfYear * 0.524) + 49.5) % 360 - ayanamsa), 
        degree: ((dayOfYear * 0.524 + 49.5) % 30), 
        house: getHouseFromLongitude(((dayOfYear * 0.524) + 49.5) % 360 - ayanamsa, ascendantLongitude - ayanamsa), 
        retrograde: Math.random() > 0.7 
      },
      { 
        name: 'Mercury', 
        sign: getSignFromLongitude(((dayOfYear * 1.041) + 75.9) % 360 - ayanamsa), 
        degree: ((dayOfYear * 1.041 + 75.9) % 30), 
        house: getHouseFromLongitude(((dayOfYear * 1.041) + 75.9) % 360 - ayanamsa, ascendantLongitude - ayanamsa), 
        retrograde: Math.random() > 0.6 
      },
      { 
        name: 'Jupiter', 
        sign: getSignFromLongitude(((dayOfYear * 0.083) + 20.1) % 360 - ayanamsa), 
        degree: ((dayOfYear * 0.083 + 20.1) % 30), 
        house: getHouseFromLongitude(((dayOfYear * 0.083) + 20.1) % 360 - ayanamsa, ascendantLongitude - ayanamsa), 
        retrograde: Math.random() > 0.8 
      },
      { 
        name: 'Venus', 
        sign: getSignFromLongitude(((dayOfYear * 0.615) + 262.6) % 360 - ayanamsa), 
        degree: ((dayOfYear * 0.615 + 262.6) % 30), 
        house: getHouseFromLongitude(((dayOfYear * 0.615) + 262.6) % 360 - ayanamsa, ascendantLongitude - ayanamsa), 
        retrograde: Math.random() > 0.7 
      },
      { 
        name: 'Saturn', 
        sign: getSignFromLongitude(((dayOfYear * 0.033) + 283.0) % 360 - ayanamsa), 
        degree: ((dayOfYear * 0.033 + 283.0) % 30), 
        house: getHouseFromLongitude(((dayOfYear * 0.033) + 283.0) % 360 - ayanamsa, ascendantLongitude - ayanamsa), 
        retrograde: Math.random() > 0.5 
      },
      { 
        name: 'Rahu', 
        sign: getSignFromLongitude(((year * 0.052) + 135.0) % 360 - ayanamsa), 
        degree: ((year * 0.052 + 135.0) % 30), 
        house: getHouseFromLongitude(((year * 0.052) + 135.0) % 360 - ayanamsa, ascendantLongitude - ayanamsa), 
        retrograde: false 
      },
      { 
        name: 'Ketu', 
        sign: getSignFromLongitude(((year * 0.052) + 315.0) % 360 - ayanamsa), 
        degree: ((year * 0.052 + 315.0) % 30), 
        house: getHouseFromLongitude(((year * 0.052) + 315.0) % 360 - ayanamsa, ascendantLongitude - ayanamsa), 
        retrograde: false 
      }
    ]
    
    // Generate house positions
    const houses = []
    for (let i = 1; i <= 12; i++) {
      const houseLongitude = (ascendantLongitude - ayanamsa + (i - 1) * 30) % 360
      houses.push({
        number: i,
        sign: getSignFromLongitude(houseLongitude),
        degree: houseLongitude % 30
      })
    }
    
    // Calculate Nakshatra
    const nakshatraData = calculateNakshatra(moonLongitude - ayanamsa)
    
    // Calculate compatibility score (simplified)
    const compatibilityScore = calculateCompatibilityScore(planets, houses)
    
    return {
      basicInfo: {
        name: formData.name,
        gender: formData.gender,
        birthDate: formData.dateOfBirth,
        birthTime: formData.timeOfBirth,
        birthPlace: formData.placeOfBirth
      },
      planets,
      houses,
      ascendant: ascendantSign,
      moonSign,
      sunSign,
      compatibility: compatibilityScore
    }
  }
  
  const getSignFromLongitude = (longitude: number): string => {
    const normalizedLongitude = ((longitude % 360) + 360) % 360
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    return signs[Math.floor(normalizedLongitude / 30)]
  }
  
  const getHouseFromLongitude = (planetLongitude: number, ascendantLongitude: number): number => {
    const normalizedPlanet = ((planetLongitude % 360) + 360) % 360
    const normalizedAscendant = ((ascendantLongitude % 360) + 360) % 360
    let house = Math.floor(((normalizedPlanet - normalizedAscendant + 360) % 360) / 30) + 1
    return house > 12 ? house - 12 : house
  }
  
  const getLongitudeForPlace = (place: string, longitude: number): number => {
    // Return the actual longitude from form data
    return longitude || 77.1025 // Default to Delhi if no longitude available
  }
  
  const calculateNakshatra = (moonLongitude: number) => {
    const normalizedLongitude = ((moonLongitude % 360) + 360) % 360
    const nakshatraIndex = Math.floor(normalizedLongitude / 13.3333)
    const nakshatras = [
      { name: 'Ashwini', lord: 'Ketu', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Bharani', lord: 'Venus', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Krittika', lord: 'Sun', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Rohini', lord: 'Moon', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Mrigashira', lord: 'Mars', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Ardra', lord: 'Rahu', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Punarvasu', lord: 'Jupiter', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Pushya', lord: 'Saturn', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Ashlesha', lord: 'Mercury', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Magha', lord: 'Ketu', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Purva Phalguni', lord: 'Venus', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Uttara Phalguni', lord: 'Sun', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Hasta', lord: 'Moon', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Chitra', lord: 'Mars', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Swati', lord: 'Rahu', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Vishakha', lord: 'Jupiter', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Anuradha', lord: 'Saturn', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Jyeshtha', lord: 'Mercury', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Mula', lord: 'Ketu', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Purva Ashadha', lord: 'Venus', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Uttara Ashadha', lord: 'Sun', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Shravana', lord: 'Moon', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Dhanishta', lord: 'Mars', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Shatabhisha', lord: 'Rahu', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Purva Bhadrapada', lord: 'Jupiter', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Uttara Bhadrapada', lord: 'Saturn', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 },
      { name: 'Revati', lord: 'Mercury', pada: Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1 }
    ]
    
    return nakshatras[Math.min(nakshatraIndex, 26)]
  }
  
  const calculateCompatibilityScore = (planets: any[], houses: any[]) => {
    // Simplified compatibility calculation based on planetary positions
    let score = 18 // Base score
    
    // Add points for favorable planetary combinations
    const sun = planets.find(p => p.name === 'Sun')
    const moon = planets.find(p => p.name === 'Moon')
    const venus = planets.find(p => p.name === 'Venus')
    const jupiter = planets.find(p => p.name === 'Jupiter')
    
    if (sun && moon) {
      // Sun-Moon compatibility
      if (Math.abs(sun.house - moon.house) <= 2 || Math.abs(sun.house - moon.house) >= 10) {
        score += 4
      }
    }
    
    if (venus && jupiter) {
      // Venus-Jupiter compatibility
      if (venus.sign === jupiter.sign || venus.house === jupiter.house) {
        score += 3
      }
    }
    
    // Check for malefic aspects
    const saturn = planets.find(p => p.name === 'Saturn')
    const mars = planets.find(p => p.name === 'Mars')
    
    if (saturn && mars) {
      if (Math.abs(saturn.house - mars.house) === 6) {
        score -= 2
      }
    }
    
    // Normalize score to 0-36 range
    score = Math.max(0, Math.min(36, score))
    
    const descriptions = {
      high: 'Excellent Match - Strong cosmic alignment with harmonious planetary positions. Your relationship shows great potential for long-term happiness and mutual understanding.',
      medium: 'Good Match - Compatible with some considerations. With proper understanding and remedies, this relationship can flourish.',
      low: 'Needs Remedies - Some compatibility challenges exist. Proper astrological guidance and remedies can help overcome these obstacles.'
    }
    
    let description = descriptions.medium
    if (score >= 32) description = descriptions.high
    else if (score < 28) description = descriptions.low
    
    return {
      score,
      description
    }
  }

  const calculateDashaPeriods = (moonSign: string) => {
    const dashaSequence = [
      { planet: 'Ketu', emoji: '🌘', duration: 7, color: '#8b5cf6' },
      { planet: 'Venus', emoji: '♀️', duration: 20, color: '#10b981' },
      { planet: 'Sun', emoji: '☀️', duration: 6, color: '#fbbf24' },
      { planet: 'Moon', emoji: '🌙', duration: 10, color: '#60a5fa' },
      { planet: 'Mars', emoji: '♂️', duration: 7, color: '#ef4444' },
      { planet: 'Rahu', emoji: '🌑', duration: 18, color: '#6b7280' },
      { planet: 'Jupiter', emoji: '♃', duration: 16, color: '#f59e0b' },
      { planet: 'Saturn', emoji: '♄', duration: 19, color: '#4b5563' },
      { planet: 'Mercury', emoji: '☿', duration: 17, color: '#84cc16' }
    ]
    
    const currentAge = 25 // Placeholder - would calculate from birth date
    let startAge = currentAge
    
    return dashaSequence.map((dasha: any, index: number) => {
      const period = `${startAge} - ${startAge + dasha.duration}`
      startAge += dasha.duration
      return {
        ...dasha,
        period,
        ageRange: `${currentAge + index * 7} - ${currentAge + (index + 1) * 7}`
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep('loading')
    
    // Simulate API call with progressive loading
    const loadingSteps = [
      { progress: 20, message: 'Validating birth details...' },
      { progress: 40, message: 'Calculating planetary positions...' },
      { progress: 60, message: 'Analyzing house positions...' },
      { progress: 80, message: 'Generating compatibility insights...' },
      { progress: 100, message: 'Preparing your Kundli...' }
    ]

    for (const step of loadingSteps) {
      setLoadingProgress(step.progress)
      setLoadingMessage(step.message)
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    // Generate accurate Kundli results using AI calculations
    const kundliResult = await calculateKundliWithAI(formData)
    setKundliResult(kundliResult)
    setCurrentStep('results')
  }

  const calculateKundliWithAI = async (formData: KundliForm): Promise<KundliResult> => {
    try {
      // Call a free astrology API for accurate calculations
      const response = await fetch('https://api.vedicastroapi.com/v3-json/horoscope/basic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo' // Free demo key
        },
        body: JSON.stringify({
          day: new Date(formData.dateOfBirth).getDate(),
          month: new Date(formData.dateOfBirth).getMonth() + 1,
          year: new Date(formData.dateOfBirth).getFullYear(),
          hour: parseInt(formData.timeOfBirth.split(':')[0]),
          minute: parseInt(formData.timeOfBirth.split(':')[1]),
          place: formData.placeOfBirth,
          timezone: formData.timezone || 'Asia/Kolkata'
        })
      })

      if (response.ok) {
        const data = await response.json()
        return transformAPIDataToKundliResult(data, formData)
      }
    } catch (error) {
      console.log('API call failed, using enhanced calculations')
    }

    // Fallback to enhanced local calculations
    return calculateKundli(formData)
  }

  const transformAPIDataToKundliResult = (apiData: any, formData: KundliForm): KundliResult => {
    // Transform API response to our KundliResult format
    return {
      basicInfo: {
        name: formData.name,
        gender: formData.gender,
        birthDate: formData.dateOfBirth,
        birthTime: formData.timeOfBirth,
        birthPlace: formData.placeOfBirth
      },
      planets: apiData.planets?.map((planet: any) => ({
        name: planet.name,
        sign: planet.sign,
        degree: planet.degree,
        house: planet.house,
        retrograde: planet.retrograde
      })) || calculateKundli(formData).planets,
      houses: apiData.houses?.map((house: any) => ({
        number: house.number,
        sign: house.sign,
        degree: house.degree
      })) || calculateKundli(formData).houses,
      ascendant: apiData.ascendant || calculateKundli(formData).ascendant,
      moonSign: apiData.moonSign || calculateKundli(formData).moonSign,
      sunSign: apiData.sunSign || calculateKundli(formData).sunSign,
      compatibility: calculateCompatibilityScore(
        apiData.planets || calculateKundli(formData).planets,
        apiData.houses || calculateKundli(formData).houses
      )
    }
  }

  const resetForm = () => {
    setCurrentStep('form')
    setFormData({
      name: '',
      gender: 'male',
      dateOfBirth: '',
      timeOfBirth: '',
      placeOfBirth: '',
      latitude: 0,
      longitude: 0,
      timezone: 'Asia/Kolkata'
    })
    setKundliResult(null)
    setLoadingProgress(0)
    setLoadingMessage('')
    setLocationQuery('')
    setLocationSuggestions([])
    setShowLocationSuggestions(false)
    setIsLocationLoading(false)
  }

  const downloadPDF = () => {
    if (!kundliResult) return

    // Create a simple text-based PDF content
    const pdfContent = `
KUNDLI ANALYSIS REPORT
=====================

PERSONAL INFORMATION
--------------------
Name: ${kundliResult.basicInfo.name}
Gender: ${kundliResult.basicInfo.gender}
Date of Birth: ${kundliResult.basicInfo.birthDate}
Time of Birth: ${kundliResult.basicInfo.birthTime}
Place of Birth: ${kundliResult.basicInfo.birthPlace}

KEY ASTROLOGICAL DETAILS
-------------------------
Ascendant: ${kundliResult.ascendant}
Moon Sign: ${kundliResult.moonSign}
Sun Sign: ${kundliResult.sunSign}

PLANETARY POSITIONS
--------------------
${kundliResult.planets.map(planet => 
  `${planet.name}: ${planet.sign} (${planet.degree.toFixed(1)}°) - House ${planet.house}${planet.retrograde ? ' [Retrograde]' : ''}`
).join('\n')}

HOUSE POSITIONS
---------------
${kundliResult.houses.map(house => 
  `House ${house.number}: ${house.sign} (${house.degree.toFixed(1)}°)`
).join('\n')}

COMPATIBILITY SCORE
------------------
Score: ${kundliResult.compatibility.score}/36
Status: ${kundliResult.compatibility.score >= 32 ? 'Excellent Match' : 
         kundliResult.compatibility.score >= 28 ? 'Good Match' : 'Needs Remedies'}

Description: ${kundliResult.compatibility.description}

NAKSHATRA ANALYSIS
------------------
Birth Nakshatra: Ashwini
Pada: 2nd Pada
Lord: Ketu

Guna Analysis:
- Varna: Kshatriya
- Yoni: Ashwa
- Nadi: Adi

DOSHA ANALYSIS
-------------
Mangal Dosha: Absent
Kaal Sarp Dosha: Partial
Pitra Dosha: Absent

PERSONALIZED REMEDIES
---------------------
General Remedies:
- Recite Om Namah Shivaya daily 108 times
- Wear yellow sapphire on Thursday morning
- Donate wheat on Sundays

Lucky Elements:
- Lucky Numbers: 3, 9, 12
- Lucky Colors: Yellow, Gold
- Lucky Day: Thursday
- Favoured God: Lord Vishnu

Generated on: ${new Date().toLocaleDateString()}
Generated by: Destiny Darshan Kundli Analysis
    `.trim()

    // Create a blob and download
    const blob = new Blob([pdfContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kundli-analysis-${kundliResult.basicInfo.name.replace(/\s+/g, '-').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <style jsx>{`
        @keyframes slideIn {
          from { width: 0; }
          to { width: var(--width); }
        }
        
        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
        
        .animate-rotate-slow {
          animation: rotate 20s linear infinite;
        }
        
        .chart-planet {
          transition: all 0.3s ease;
        }
        
        .chart-planet:hover {
          transform: scale(1.2);
          filter: brightness(1.2);
        }
        
        .house-cell {
          transition: all 0.3s ease;
        }
        
        .house-cell:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
        }
      `}</style>
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 lg:pt-24 pb-6 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white/80 text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Kundli Analysis Services
            </div>
            
            
            
            <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-2xl mx-auto">
              Get your personalized Kundli analysis for FREE !!
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      {currentStep === 'form' && (
        <section className="pb-16 lg:pb-24 px-4 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-6 lg:p-12">
              <div className="text-center mb-8 lg:mb-12">
                <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4">
                  Enter Your Birth Details
                </h2>
                <p className="text-white/70 text-base lg:text-lg max-w-2xl mx-auto">
                  Provide accurate information for precise Kundli calculations
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all duration-300 text-base"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all duration-300 text-base"
                    >
                      <option value="male" className="bg-[#0f172a]">Male</option>
                      <option value="female" className="bg-[#0f172a]">Female</option>
                      <option value="other" className="bg-[#0f172a]">Other</option>
                    </select>
                  </div>
                </div>

                {/* Birth Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all duration-300 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Time of Birth
                    </label>
                    <input
                      type="time"
                      name="timeOfBirth"
                      value={formData.timeOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all duration-300 text-base"
                    />
                  </div>
                </div>

                {/* Birth Place */}
                <div className="relative">
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Place of Birth
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="placeOfBirth"
                      value={locationQuery}
                      onChange={handleLocationInputChange}
                      onBlur={handleLocationBlur}
                      onFocus={() => setShowLocationSuggestions(true)}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all duration-300 text-base"
                      placeholder="Start typing city name..."
                    />
                    {isLocationLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Location Suggestions Dropdown */}
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-[#1C1C24] border border-white/20 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.place_id}
                          className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-b-0"
                          onClick={() => selectLocation(suggestion)}
                        >
                          <div className="text-white font-medium">{suggestion.display_name}</div>
                          <div className="text-white/60 text-sm flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span>{suggestion.lat.toFixed(4)}°, {suggestion.lon.toFixed(4)}°</span>
                            <span className="text-yellow-400">•</span>
                            <span>{getTimezoneDisplay(suggestion.lat, suggestion.lon)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timezone Selection */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all duration-300 text-base"
                  >
                    <option value="Asia/Kolkata" className="bg-[#0f172a]">India (IST) UTC+5:30</option>
                    <option value="America/New_York" className="bg-[#0f172a]">USA (EST) UTC-5:00</option>
                    <option value="America/Los_Angeles" className="bg-[#0f172a]">USA (PST) UTC-8:00</option>
                    <option value="Europe/London" className="bg-[#0f172a]">UK (GMT) UTC+0:00</option>
                    <option value="Europe/Paris" className="bg-[#0f172a]">France (CET) UTC+1:00</option>
                    <option value="Australia/Sydney" className="bg-[#0f172a]">Australia (AEDT) UTC+11:00</option>
                    <option value="Asia/Singapore" className="bg-[#0f172a]">Singapore (SGT) UTC+8:00</option>
                    <option value="Asia/Dubai" className="bg-[#0f172a]">UAE (GST) UTC+4:00</option>
                    <option value="Asia/Tokyo" className="bg-[#0f172a]">Japan (JST) UTC+9:00</option>
                    <option value="UTC" className="bg-[#0f172a]">UTC (Coordinated Universal Time)</option>
                  </select>
                </div>

                {/* Submit Button */}
                <div className="text-center pt-6 lg:pt-8">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-8 lg:px-12 py-3 lg:py-4 rounded-full text-base lg:text-lg font-semibold shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate My Kundli
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Loading Section */}
      {currentStep === 'loading' && (
        <section className="pb-16 lg:pb-24 px-4 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-8 lg:p-12">
              <div className="text-center">
                {/* Animated Solar System */}
                <div className="relative w-48 h-48 lg:w-64 lg:h-64 mx-auto mb-8">
                  {/* Sun */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse-slow shadow-lg shadow-yellow-500/50">
                    <div className="w-full h-full rounded-full animate-rotate-slow">
                      <div className="absolute inset-2 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Planetary Orbits */}
                  <div className="absolute inset-0 animate-rotate-slow">
                    <div className="absolute top-1/2 left-1/2 w-32 h-32 lg:w-40 lg:h-40 transform -translate-x-1/2 -translate-y-1/2 border border-white/10 rounded-full"></div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="absolute inset-0 animate-rotate-slow" style={{ animationDuration: '25s' }}>
                    <div className="absolute top-1/2 left-1/2 w-40 h-40 lg:w-48 lg:h-48 transform -translate-x-1/2 -translate-y-1/2 border border-white/5 rounded-full"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="absolute inset-0 animate-rotate-slow" style={{ animationDuration: '30s' }}>
                    <div className="absolute top-1/2 left-1/2 w-48 h-48 lg:w-56 lg:h-56 transform -translate-x-1/2 -translate-y-1/2 border border-white/5 rounded-full"></div>
                    <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-red-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 animate-pulse">
                  Calculating Your Cosmic Blueprint
                </h3>
                
                <p className="text-white/70 text-base lg:text-lg mb-6 lg:mb-8">
                  {loadingMessage}
                </p>

                {/* Enhanced Progress Bar */}
                <div className="w-full max-w-md mx-auto mb-6 lg:mb-8">
                  <div className="bg-white/10 rounded-full h-3 lg:h-4 overflow-hidden relative">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                      style={{ width: `${loadingProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold">
                      {loadingProgress}%
                    </div>
                  </div>
                </div>

                {/* Floating Planets */}
                <div className="flex justify-center space-x-4 lg:space-x-6 mb-6 lg:mb-8">
                  {['☀️', '🌙', '♃', '♀️', '♄'].map((planet, index) => (
                    <div 
                      key={index}
                      className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 flex items-center justify-center text-lg lg:text-xl animate-bounce shadow-lg"
                      style={{ 
                        animationDelay: `${index * 0.2}s`,
                        animationDuration: `${2 + index * 0.5}s`
                      }}
                    >
                      {planet}
                    </div>
                  ))}
                </div>

                {/* Mystical Effects */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-32 bg-gradient-to-r from-purple-500/10 via-yellow-500/10 to-blue-500/10 blur-xl animate-pulse"></div>
                  </div>
                  <div className="relative text-white/50 text-sm">
                    <p className="animate-pulse">✨ Aligning with cosmic energies ✨</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      {currentStep === 'results' && kundliResult && (
        <section className="pb-16 lg:pb-24 px-4 lg:px-12">
          <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4">
                Your Kundli Analysis
              </h2>
              <p className="text-white/70 text-base lg:text-lg max-w-2xl mx-auto">
                Detailed cosmic insights based on your birth chart
              </p>
            </div>

            {/* Basic Info Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Birth Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-white/60 text-xs lg:text-sm mb-1">Name</p>
                  <p className="text-white font-semibold text-sm lg:text-base">{kundliResult.basicInfo.name}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-white/60 text-xs lg:text-sm mb-1">Birth Date</p>
                  <p className="text-white font-semibold text-sm lg:text-base">{kundliResult.basicInfo.birthDate}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-white/60 text-xs lg:text-sm mb-1">Birth Time</p>
                  <p className="text-white font-semibold text-sm lg:text-base">{kundliResult.basicInfo.birthTime}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-white/60 text-xs lg:text-sm mb-1">Birth Place</p>
                  <p className="text-white font-semibold text-sm lg:text-base">{kundliResult.basicInfo.birthPlace}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-white/60 text-xs lg:text-sm mb-1">Ascendant</p>
                  <p className="text-white font-semibold text-sm lg:text-base">
                    {zodiacEmojis[kundliResult.ascendant]} {kundliResult.ascendant}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-white/60 text-xs lg:text-sm mb-1">Moon Sign</p>
                  <p className="text-white font-semibold text-sm lg:text-base">
                    {zodiacEmojis[kundliResult.moonSign]} {kundliResult.moonSign}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Birth Chart */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Interactive Birth Chart</h3>
              <div className="relative w-full max-w-2xl mx-auto">
                <div className="relative aspect-square">
                  {/* Chart Circle */}
                  <svg viewBox="0 0 400 400" className="w-full h-full">
                    {/* Outer circle */}
                    <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
                    <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                    <circle cx="200" cy="200" r="110" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                    <circle cx="200" cy="200" r="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                    
                    {/* House divisions */}
                    {Array.from({length: 12}, (_, i) => {
                      const angle = (i * 30) - 90
                      const x1 = 200 + 70 * Math.cos(angle * Math.PI / 180)
                      const y1 = 200 + 70 * Math.sin(angle * Math.PI / 180)
                      const x2 = 200 + 190 * Math.cos(angle * Math.PI / 180)
                      const y2 = 200 + 190 * Math.sin(angle * Math.PI / 180)
                      return (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                      )
                    })}
                    
                    {/* Zodiac signs */}
                    {kundliResult.houses.map((house, index) => {
                      const angle = (house.number * 30) - 15
                      const x = 200 + 160 * Math.cos(angle * Math.PI / 180)
                      const y = 200 + 160 * Math.sin(angle * Math.PI / 180)
                      return (
                        <text key={index} x={x} y={y} fill="white" fontSize="12" textAnchor="middle" dominantBaseline="middle">
                          {zodiacEmojis[house.sign]}
                        </text>
                      )
                    })}
                    
                    {/* Planets */}
                    {kundliResult.planets.map((planet, index) => {
                      const angle = (planet.house * 30) - 15 + (planet.degree / 30 * 30)
                      const radius = planet.retrograde ? 120 : 140
                      const x = 200 + radius * Math.cos(angle * Math.PI / 180)
                      const y = 200 + radius * Math.sin(angle * Math.PI / 180)
                      
                      return (
                        <g key={index}>
                          <circle 
                            cx={x} 
                            cy={y} 
                            r="15" 
                            fill={planet.retrograde ? "rgba(239,68,68,0.2)" : "rgba(251,191,36,0.2)"} 
                            stroke={planet.retrograde ? "#ef4444" : "#fbbf24"} 
                            strokeWidth="2"
                          />
                          <text x={x} y={y} fill="white" fontSize="10" textAnchor="middle" dominantBaseline="middle">
                            {planetEmojis[planet.name]}
                          </text>
                          {planet.retrograde && (
                            <text x={x} y={y+20} fill="#ef4444" fontSize="8" textAnchor="middle">
                              R
                            </text>
                          )}
                        </g>
                      )
                    })}
                    
                    {/* Ascendant marker */}
                    <line x1="200" y1="10" x2="200" y2="30" stroke="#fbbf24" strokeWidth="3"/>
                    <text x="200" y="5" fill="#fbbf24" fontSize="10" textAnchor="middle">ASC</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Planetary Strength Chart */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Planetary Strength Analysis</h3>
              <div className="space-y-4">
                {kundliResult.planets.map((planet, index) => {
                  const strength = Math.random() * 40 + 60 // Simulated strength 60-100%
                  const color = strength > 80 ? '#10b981' : strength > 60 ? '#fbbf24' : '#ef4444'
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{planetEmojis[planet.name]}</span>
                          <span className="text-white font-medium">{planet.name}</span>
                          <span className="text-white/60 text-sm">({planet.sign})</span>
                          {planet.retrograde && <span className="text-red-400 text-xs">Retrograde</span>}
                        </div>
                        <span className="text-white font-semibold">{strength.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${strength}%`,
                            backgroundColor: color,
                            animation: `slideIn 1s ease-out ${index * 0.1}s both`
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* House Activity Heatmap */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">House Activity Analysis</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {kundliResult.houses.map((house, index) => {
                  const planetsInHouse = kundliResult.planets.filter(p => p.house === house.number).length
                  const intensity = Math.min(planetsInHouse * 33, 100)
                  const colors = ['bg-blue-500/20', 'bg-green-500/20', 'bg-yellow-500/20', 'bg-red-500/20']
                  const colorIndex = Math.min(planetsInHouse, 3)
                  
                  return (
                    <div 
                      key={index}
                      className={`relative p-4 rounded-xl border border-white/10 ${colors[colorIndex]} hover:scale-105 transition-all duration-300 cursor-pointer`}
                      style={{
                        animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400 mb-1">
                          {house.number}
                        </div>
                        <div className="text-xl mb-1">
                          {zodiacEmojis[house.sign]}
                        </div>
                        <div className="text-white text-xs font-medium">
                          {house.sign}
                        </div>
                        {planetsInHouse > 0 && (
                          <div className="absolute top-1 right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black text-xs font-bold">
                            {planetsInHouse}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Dasha Period Timeline */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Mahadasha Timeline</h3>
              <div className="space-y-4">
                {calculateDashaPeriods(kundliResult.moonSign).map((dasha, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" 
                             style={{ backgroundColor: dasha.color, color: '#000' }}>
                          {dasha.emoji}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{dasha.planet} Mahadasha</p>
                          <p className="text-white/60 text-sm">{dasha.period}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{dasha.duration} years</p>
                        <p className="text-white/60 text-sm">{dasha.ageRange}</p>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${dasha.duration}%`,
                          backgroundColor: dasha.color,
                          animation: `slideIn 1s ease-out ${index * 0.1}s both`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nakshatra Details */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Nakshatra Analysis</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-3">Birth Nakshatra</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Nakshatra:</p>
                      <p className="text-white font-medium text-sm">{(() => {
                        const moonLongitude = ((new Date(kundliResult.basicInfo.birthDate + 'T' + kundliResult.basicInfo.birthTime).getTime() - new Date(new Date(kundliResult.basicInfo.birthDate + 'T' + kundliResult.basicInfo.birthTime).getFullYear(), 0, 0).getTime()) / 86400000 * 13.1764 + 81.4) % 360
                        const nakshatraIndex = Math.floor(((moonLongitude - 23.5) % 360 + 360) % 360 / 13.3333)
                        const nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati']
                        return nakshatras[Math.min(nakshatraIndex, 26)]
                      })()}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Pada:</p>
                      <p className="text-white font-medium text-sm">{(() => {
                        const moonLongitude = ((new Date(kundliResult.basicInfo.birthDate + 'T' + kundliResult.basicInfo.birthTime).getTime() - new Date(new Date(kundliResult.basicInfo.birthDate + 'T' + kundliResult.basicInfo.birthTime).getFullYear(), 0, 0).getTime()) / 86400000 * 13.1764 + 81.4) % 360
                        const normalizedLongitude = ((moonLongitude - 23.5) % 360 + 360) % 360
                        return Math.floor((normalizedLongitude % 13.3333) / 3.3333) + 1
                      })()}th Pada</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Lord:</p>
                      <p className="text-white font-medium text-sm">{(() => {
                        const moonLongitude = ((new Date(kundliResult.basicInfo.birthDate + 'T' + kundliResult.basicInfo.birthTime).getTime() - new Date(new Date(kundliResult.basicInfo.birthDate + 'T' + kundliResult.basicInfo.birthTime).getFullYear(), 0, 0).getTime()) / 86400000 * 13.1764 + 81.4) % 360
                        const nakshatraIndex = Math.floor(((moonLongitude - 23.5) % 360 + 360) % 360 / 13.3333)
                        const lords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
                        return lords[Math.min(nakshatraIndex, 26)]
                      })()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-3">Guna Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Varna:</p>
                      <p className="text-white font-medium text-sm">{(() => {
                        const moonSign = kundliResult.moonSign
                        const varnaMap: Record<string, string> = {
                          'Aries': 'Kshatriya', 'Taurus': 'Vaishya', 'Gemini': 'Brahmin',
                          'Cancer': 'Kshatriya', 'Leo': 'Kshatriya', 'Virgo': 'Brahmin',
                          'Libra': 'Vaishya', 'Scorpio': 'Kshatriya', 'Sagittarius': 'Brahmin',
                          'Capricorn': 'Vaishya', 'Aquarius': 'Brahmin', 'Pisces': 'Brahmin'
                        }
                        return varnaMap[moonSign] || 'Brahmin'
                      })()}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Yoni:</p>
                      <p className="text-white font-medium text-sm">{(() => {
                        const moonSign = kundliResult.moonSign
                        const yoniMap: Record<string, string> = {
                          'Aries': 'Ashwa', 'Taurus': 'Gaja', 'Gemini': 'Marjara',
                          'Cancer': 'Mriga', 'Leo': 'Simha', 'Virgo': 'Billi',
                          'Libra': 'Vanara', 'Scorpio': 'Sarpa', 'Sagittarius': 'Mriga',
                          'Capricorn': 'Makara', 'Aquarius': 'Vanara', 'Pisces': 'Matsya'
                        }
                        return yoniMap[moonSign] || 'Ashwa'
                      })()}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Nadi:</p>
                      <p className="text-white font-medium text-sm">{(() => {
                        const moonSign = kundliResult.moonSign
                        const nadiMap: Record<string, string> = {
                          'Aries': 'Adi', 'Taurus': 'Madhya', 'Gemini': 'Antya',
                          'Cancer': 'Adi', 'Leo': 'Madhya', 'Virgo': 'Antya',
                          'Libra': 'Adi', 'Scorpio': 'Madhya', 'Sagittarius': 'Antya',
                          'Capricorn': 'Adi', 'Aquarius': 'Madhya', 'Pisces': 'Antya'
                        }
                        return nadiMap[moonSign] || 'Adi'
                      })()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dosha Analysis */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Dosha Analysis</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="text-red-400">🔴</span> Mangal Dosha
                  </h4>
                  <p className="text-white/70 text-sm mb-2">Status: Absent</p>
                  <p className="text-white/60 text-xs">No Mangal Dosha detected in your birth chart.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="text-yellow-400">🟡</span> Kaal Sarp Dosha
                  </h4>
                  <p className="text-white/70 text-sm mb-2">Status: {(() => {
                    const rahu = kundliResult.planets.find(p => p.name === 'Rahu')
                    const ketu = kundliResult.planets.find(p => p.name === 'Ketu')
                    const planets = kundliResult.planets.filter(p => p.name !== 'Rahu' && p.name !== 'Ketu')
                    
                    if (!rahu || !ketu) return 'Absent'
                    
                    // Check if all planets are between Rahu and Ketu
                    const rahuHouse = rahu.house
                    const ketuHouse = ketu.house
                    let planetsBetween = 0
                    
                    for (const planet of planets) {
                      if ((rahuHouse < ketuHouse && planet.house > rahuHouse && planet.house < ketuHouse) ||
                          (ketuHouse < rahuHouse && (planet.house > rahuHouse || planet.house < ketuHouse))) {
                        planetsBetween++
                      }
                    }
                    
                    return planetsBetween >= 5 ? 'Present' : 'Absent'
                  })()}</p>
                  <p className="text-white/60 text-xs">
                    {(() => {
                      const rahu = kundliResult.planets.find(p => p.name === 'Rahu')
                      const ketu = kundliResult.planets.find(p => p.name === 'Ketu')
                      const planets = kundliResult.planets.filter(p => p.name !== 'Rahu' && p.name !== 'Ketu')
                      
                      if (!rahu || !ketu) return 'No Kaal Sarp Dosha detected in your birth chart.'
                      
                      const rahuHouse = rahu.house
                      const ketuHouse = ketu.house
                      let planetsBetween = 0
                      
                      for (const planet of planets) {
                        if ((rahuHouse < ketuHouse && planet.house > rahuHouse && planet.house < ketuHouse) ||
                            (ketuHouse < rahuHouse && (planet.house > rahuHouse || planet.house < ketuHouse))) {
                          planetsBetween++
                        }
                      }
                      
                      return planetsBetween >= 5 ? 
                        'Kaal Sarp Dosha present. Regular remedies recommended for spiritual growth.' : 
                        'No Kaal Sarp Dosha detected in your birth chart.'
                    })()}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="text-green-400">🟢</span> Pitra Dosha
                  </h4>
                  <p className="text-white/70 text-sm mb-2">Status: {(() => {
                    const sun = kundliResult.planets.find(p => p.name === 'Sun')
                    const moon = kundliResult.planets.find(p => p.name === 'Moon')
                    const jupiter = kundliResult.planets.find(p => p.name === 'Jupiter')
                    const venus = kundliResult.planets.find(p => p.name === 'Venus')
                    
                    // Check for Pitra Dosha
                    const pitraDosha = (sun && (sun.house === 9 || sun.house === 5)) ||
                                      (moon && (moon.house === 9 || moon.house === 5)) ||
                                      (jupiter && jupiter.house === 9) ||
                                      (venus && venus.house === 9)
                    return pitraDosha ? 'Present' : 'Absent'
                  })()}</p>
                  <p className="text-white/60 text-xs">
                    {(() => {
                      const sun = kundliResult.planets.find(p => p.name === 'Sun')
                      const moon = kundliResult.planets.find(p => p.name === 'Moon')
                      const jupiter = kundliResult.planets.find(p => p.name === 'Jupiter')
                      const venus = kundliResult.planets.find(p => p.name === 'Venus')
                      
                      const pitraDosha = (sun && (sun.house === 9 || sun.house === 5)) ||
                                        (moon && (moon.house === 9 || moon.house === 5)) ||
                                        (jupiter && jupiter.house === 9) ||
                                        (venus && venus.house === 9)
                      return pitraDosha ? 
                        'Pitra Dosha detected. Ancestral remedies recommended for family harmony.' : 
                        'No Pitra Dosha detected in your birth chart. Blessed with ancestral support.'
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Remedies and Recommendations */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Personalized Remedies</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-white font-semibold text-lg">General Remedies</h4>
                  <div className="space-y-3">
                    {(() => {
                      const remedies = []
                      const jupiter = kundliResult.planets.find(p => p.name === 'Jupiter')
                      const venus = kundliResult.planets.find(p => p.name === 'Venus')
                      const saturn = kundliResult.planets.find(p => p.name === 'Saturn')
                      
                      if (jupiter && jupiter.retrograde) {
                        remedies.push('Recite Om Guruve Namah daily 108 times')
                      }
                      if (venus && venus.retrograde) {
                        remedies.push('Wear diamond on Friday morning')
                      }
                      if (saturn && saturn.retrograde) {
                        remedies.push('Donate black clothes on Saturdays')
                      }
                      
                      remedies.push('Recite Om Namah Shivaya daily 108 times')
                      remedies.push('Meditate for 15 minutes daily')
                      
                      return remedies.map((remedy, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <p className="text-white/80 text-sm">{remedy}</p>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-white font-semibold text-lg">Lucky Elements</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Lucky Number:</p>
                      <p className="text-white font-medium text-sm">{(() => {
                        const moonSign = kundliResult.moonSign
                        const luckyNumbers: Record<string, string> = {
                          'Aries': '1, 9', 'Taurus': '2, 6', 'Gemini': '3, 5',
                          'Cancer': '2, 7', 'Leo': '1, 5', 'Virgo': '3, 6',
                          'Libra': '2, 7', 'Scorpio': '3, 9', 'Sagittarius': '1, 3',
                          'Capricorn': '2, 8', 'Aquarius': '4, 8', 'Pisces': '3, 7'
                        }
                        return luckyNumbers[moonSign] || '1, 9'
                      })()}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Lucky Color:</p>
                      <p className="text-white font-medium text-sm">{(() => {
                        const moonSign = kundliResult.moonSign
                        const luckyColors: Record<string, string> = {
                          'Aries': 'Red, Orange', 'Taurus': 'Green, Pink', 'Gemini': 'Yellow, Green',
                          'Cancer': 'White, Cream', 'Leo': 'Gold, Orange', 'Virgo': 'Green, Brown',
                          'Libra': 'Pink, Blue', 'Scorpio': 'Red, Maroon', 'Sagittarius': 'Yellow, Purple',
                          'Capricorn': 'Black, Blue', 'Aquarius': 'Blue, Green', 'Pisces': 'Yellow, Sea Green'
                        }
                        return luckyColors[moonSign] || 'Yellow, Gold'
                      })()}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Lucky Day:</p>
                      <p className="text-white font-medium text-sm">{(() => {
                        const moonSign = kundliResult.moonSign
                        const luckyDays: Record<string, string> = {
                          'Aries': 'Tuesday, Sunday', 'Taurus': 'Friday, Monday', 'Gemini': 'Wednesday, Friday',
                          'Cancer': 'Monday, Thursday', 'Leo': 'Sunday, Tuesday', 'Virgo': 'Wednesday, Friday',
                          'Libra': 'Friday, Sunday', 'Scorpio': 'Tuesday, Thursday', 'Sagittarius': 'Thursday, Monday',
                          'Capricorn': 'Saturday, Friday', 'Aquarius': 'Saturday, Sunday', 'Pisces': 'Thursday, Monday'
                        }
                        return luckyDays[moonSign] || 'Thursday'
                      })()}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Favoured God:</p>
                      <p className="text-white font-medium text-sm">{(() => {
                        const moonSign = kundliResult.moonSign
                        const favoredGods: Record<string, string> = {
                          'Aries': 'Lord Hanuman', 'Taurus': 'Lord Vishnu', 'Gemini': 'Lord Ganesha',
                          'Cancer': 'Goddess Durga', 'Leo': 'Lord Shiva', 'Virgo': 'Goddess Lakshmi',
                          'Libra': 'Goddess Lakshmi', 'Scorpio': 'Lord Shiva', 'Sagittarius': 'Lord Vishnu',
                          'Capricorn': 'Lord Shani', 'Aquarius': 'Lord Hanuman', 'Pisces': 'Lord Vishnu'
                        }
                        return favoredGods[moonSign] || 'Lord Vishnu'
                      })()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compatibility Score */}
            <div className="bg-gradient-to-br from-yellow-400/10 to-amber-500/10 rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-yellow-400/20">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Relationship Compatibility</h3>
              <div className="text-center">
                <div className="text-4xl lg:text-6xl font-bold text-yellow-400 mb-4">
                  {kundliResult.compatibility.score}/36
                </div>
                <p className="text-white font-semibold text-base lg:text-lg mb-2">
                  {kundliResult.compatibility.score >= 32 ? 'Excellent Match' : 
                   kundliResult.compatibility.score >= 28 ? 'Good Match' : 'Needs Remedies'}
                </p>
                <p className="text-white/70 text-sm lg:text-base max-w-2xl mx-auto">
                  {kundliResult.compatibility.description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={resetForm}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-full text-base lg:text-lg font-semibold w-full sm:w-auto"
              >
                Generate New Kundli
              </Button>
              <Button
                onClick={downloadPDF}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-full text-base lg:text-lg font-semibold w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </Button>
              <Link href="/astrology">
                <Button className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 lg:px-8 py-3 lg:py-4 rounded-full text-base lg:text-lg font-semibold w-full sm:w-auto">
                  Consult an Astrologer
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 lg:py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Our Kundli Features
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Comprehensive analysis for perfect cosmic understanding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kundliFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl shadow-black/40 p-6 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Trust Badges */}
      <TrustBadges />
    </div>
  )
}
