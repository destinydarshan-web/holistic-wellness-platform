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
    timezone: 'UTC'
  })
  const [kundliResult, setKundliResult] = useState<KundliResult | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState('')

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

    // Generate mock Kundli results (in production, this would call a real API)
    const mockKundliResult: KundliResult = {
      basicInfo: {
        name: formData.name,
        gender: formData.gender,
        birthDate: formData.dateOfBirth,
        birthTime: formData.timeOfBirth,
        birthPlace: formData.placeOfBirth
      },
      planets: [
        { name: 'Sun', sign: 'Leo', degree: 15.5, house: 1, retrograde: false },
        { name: 'Moon', sign: 'Cancer', degree: 23.2, house: 12, retrograde: false },
        { name: 'Mars', sign: 'Aries', degree: 8.7, house: 1, retrograde: false },
        { name: 'Mercury', sign: 'Virgo', degree: 12.3, house: 2, retrograde: true },
        { name: 'Jupiter', sign: 'Sagittarius', degree: 5.8, house: 9, retrograde: false },
        { name: 'Venus', sign: 'Libra', degree: 18.9, house: 7, retrograde: false },
        { name: 'Saturn', sign: 'Capricorn', degree: 25.4, house: 10, retrograde: true },
        { name: 'Rahu', sign: 'Gemini', degree: 14.2, house: 3, retrograde: false },
        { name: 'Ketu', sign: 'Sagittarius', degree: 14.2, house: 9, retrograde: false }
      ],
      houses: [
        { number: 1, sign: 'Aries', degree: 8.7 },
        { number: 2, sign: 'Taurus', degree: 25.4 },
        { number: 3, sign: 'Gemini', degree: 14.2 },
        { number: 4, sign: 'Cancer', degree: 23.2 },
        { number: 5, sign: 'Leo', degree: 15.5 },
        { number: 6, sign: 'Virgo', degree: 12.3 },
        { number: 7, sign: 'Libra', degree: 18.9 },
        { number: 8, sign: 'Scorpio', degree: 7.8 },
        { number: 9, sign: 'Sagittarius', degree: 5.8 },
        { number: 10, sign: 'Capricorn', degree: 25.4 },
        { number: 11, sign: 'Aquarius', degree: 19.6 },
        { number: 12, sign: 'Pisces', degree: 11.3 }
      ],
      ascendant: 'Aries',
      moonSign: 'Cancer',
      sunSign: 'Leo',
      compatibility: {
        score: 34,
        description: 'Very Good Match - Strong cosmic alignment with harmonious planetary positions. Your relationship shows great potential for long-term happiness and mutual understanding.'
      }
    }

    setKundliResult(mockKundliResult)
    setCurrentStep('results')
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
      timezone: 'UTC'
    })
    setKundliResult(null)
    setLoadingProgress(0)
    setLoadingMessage('')
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
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    name="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all duration-300 text-base"
                    placeholder="City, Country"
                  />
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
                <div className="w-16 lg:w-20 h-16 lg:h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black text-2xl lg:text-3xl mx-auto mb-6 lg:mb-8 animate-spin">
                  <Loader2 className="w-8 h-8 lg:w-10 lg:h-10" />
                </div>
                
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-4">
                  Calculating Your Cosmic Blueprint
                </h3>
                
                <p className="text-white/70 text-base lg:text-lg mb-6 lg:mb-8">
                  {loadingMessage}
                </p>

                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto mb-6 lg:mb-8">
                  <div className="bg-white/10 rounded-full h-2 lg:h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-white/60 text-xs lg:text-sm mt-2">{loadingProgress}% Complete</p>
                </div>

                {/* Animated Planets */}
                <div className="flex justify-center space-x-3 lg:space-x-4 mb-6 lg:mb-8">
                  {['☀️', '🌙', '♃', '♀️'].map((planet, index) => (
                    <div 
                      key={index}
                      className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 flex items-center justify-center text-lg lg:text-2xl animate-bounce"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {planet}
                    </div>
                  ))}
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

            {/* Planetary Positions */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Planetary Positions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {kundliResult.planets.map((planet, index) => (
                  <div 
                    key={index}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl lg:text-2xl">{planetEmojis[planet.name]}</span>
                        <span className="text-white font-semibold text-sm lg:text-base">{planet.name}</span>
                      </div>
                      {planet.retrograde && (
                        <span className="text-xs text-red-400 bg-red-400/20 px-2 py-1 rounded-full">Retrograde</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-white/70 text-xs lg:text-sm">Sign:</p>
                        <p className="text-white font-medium text-xs lg:text-sm">
                          {zodiacEmojis[planet.sign]} {planet.sign}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-white/70 text-xs lg:text-sm">Degree:</p>
                        <p className="text-white font-medium text-xs lg:text-sm">{planet.degree.toFixed(1)}°</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-white/70 text-xs lg:text-sm">House:</p>
                        <p className="text-white font-medium text-xs lg:text-sm">{planet.house}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* House Positions */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">House Positions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                {kundliResult.houses.map((house, index) => (
                  <div 
                    key={index}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 text-center"
                  >
                    <div className="text-lg lg:text-xl font-bold text-yellow-400 mb-1">
                      {house.number}
                    </div>
                    <div className="text-xl lg:text-2xl mb-1">
                      {zodiacEmojis[house.sign]}
                    </div>
                    <p className="text-white font-medium text-xs lg:text-sm">{house.sign}</p>
                    <p className="text-white/60 text-xs">{house.degree.toFixed(1)}°</p>
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
                      <p className="text-white font-medium text-sm">Ashwini</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Pada:</p>
                      <p className="text-white font-medium text-sm">2nd Pada</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Lord:</p>
                      <p className="text-white font-medium text-sm">Ketu</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-3">Guna Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Varna:</p>
                      <p className="text-white font-medium text-sm">Kshatriya</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Yoni:</p>
                      <p className="text-white font-medium text-sm">Ashwa</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Nadi:</p>
                      <p className="text-white font-medium text-sm">Adi</p>
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
                  <p className="text-white/70 text-sm mb-2">Status: Partial</p>
                  <p className="text-white/60 text-xs">Minor Kaal Sarp influence present, remedies recommended.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="text-green-400">🟢</span> Pitra Dosha
                  </h4>
                  <p className="text-white/70 text-sm mb-2">Status: Absent</p>
                  <p className="text-white/60 text-xs">No Pitra Dosha detected in your birth chart.</p>
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

            {/* Remedies and Recommendations */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/10 shadow-xl shadow-black/40 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Personalized Remedies</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-white font-semibold text-lg">General Remedies</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-white/80 text-sm">Recite Om Namah Shivaya daily 108 times</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-white/80 text-sm">Wear yellow sapphire on Thursday morning</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-white/80 text-sm">Donate wheat on Sundays</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-white font-semibold text-lg">Lucky Elements</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Lucky Number:</p>
                      <p className="text-white font-medium text-sm">3, 9, 12</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Lucky Color:</p>
                      <p className="text-white font-medium text-sm">Yellow, Gold</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Lucky Day:</p>
                      <p className="text-white font-medium text-sm">Thursday</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-white/70 text-sm">Favoured God:</p>
                      <p className="text-white font-medium text-sm">Lord Vishnu</p>
                    </div>
                  </div>
                </div>
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
