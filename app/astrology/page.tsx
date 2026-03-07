'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, Filter, Star, Clock, Users, CheckCircle, ChevronDown, MessageCircle, Phone, Video, Shield, Lock, Heart, Sparkles, X, HelpCircle } from 'lucide-react'
import AstrologerCard from '@/components/AstrologerCard'
import Link from 'next/link'

interface Expert {
  id: string
  display_name: string
  avatar_url: string
  bio: string
  experience_years: number
  price_per_minute: number
  hourly_rate: number
  specialties: string[]
  is_profile_complete: boolean
  is_online: boolean
  modes: string[]
  created_at?: string
  updated_at?: string
}

export default function AstrologyPage() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnlineOnly, setIsOnlineOnly] = useState(false)
  const [selectedMode, setSelectedMode] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [sortBy, setSortBy] = useState('recommended')
  const [showFilters, setShowFilters] = useState(false)
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [isModeOpen, setIsModeOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isPriceOpen, setIsPriceOpen] = useState(false)

  // All astrology specialties from expert profile
  const astrologySpecialties = [
    { value: 'all', label: 'All Specialties' },
    { value: 'Face Reading', label: 'Face Reading' },
    { value: 'Horoscope Reading', label: 'Horoscope Reading' },
    { value: 'Kundli Matching', label: 'Kundli Matching' },
    { value: 'Numerology', label: 'Numerology' },
    { value: 'Palmistry', label: 'Palmistry' },
    { value: 'Remedial Astrology', label: 'Remedial Astrology' },
    { value: 'Tarot Reading', label: 'Tarot Reading' },
    { value: 'Vastu Shastra', label: 'Vastu Shastra' },
    { value: 'Vedic Astrology', label: 'Vedic Astrology' },
    { value: 'Western Astrology', label: 'Western Astrology' }
  ]

  const modeRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)
  const priceRef = useRef<HTMLDivElement>(null)

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeRef.current && !modeRef.current.contains(event.target as Node)) {
        setIsModeOpen(false)
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false)
      }
      if (priceRef.current && !priceRef.current.contains(event.target as Node)) {
        setIsPriceOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    fetchExperts()
  }, [isOnlineOnly, selectedMode, priceRange, sortBy])

  const fetchExperts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        onlineOnly: isOnlineOnly.toString(),
        mode: selectedMode,
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        sortBy: sortBy
      })
      
      console.log('=== DEBUG: Frontend Fetch ===')
      console.log('Fetching URL:', `/api/experts?${params}`)
      
      const response = await fetch(`/api/experts?${params}`)
      
      console.log('=== DEBUG: API Response Status ===')
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log('=== DEBUG: API Error Response ===')
        console.log('Error text:', errorText)
        throw new Error(`Failed to fetch experts: ${response.status} ${errorText}`)
      }
      
      const result = await response.json()
      
      console.log('=== DEBUG: Frontend Response ===')
      console.log('Full response:', result)
      console.log('Success:', result.success)
      console.log('Data:', result.data)
      console.log('Data length:', result.data?.length || 0)
      console.log('Error:', result.error)
      
      // Log approved astrologers only
      if (result.success && result.data) {
        console.log('=== DEBUG: Approved Astrologers Only ===')
        console.log('Approved astrologers:', result.data)
        console.log('Specializations:', result.data.map((e: any) => e.specialization))
        console.log('Statuses:', result.data.map((e: any) => e.status))
      }
      
      if (result.success) {
        console.log('=== DEBUG: Setting Experts State ===')
        console.log('Experts fetched:', result.data)
        setExperts(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to fetch experts')
      }
    } catch (err) {
      console.log('=== DEBUG: Fetch Error ===')
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
      <div className="mb-6">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-16 bg-gray-200 rounded mb-3"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  )

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
        <Users className="w-12 h-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        No Astrologers Available Yet
      </h2>
      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        We're onboarding new experts. Please check back soon.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/#quick-tools"
          className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black font-semibold rounded-xl hover:bg-yellow-600 transition-colors"
        >
          <Sparkles className="w-5 h-5" />
          Daily Horoscope
        </Link>
        <Link
          href="/#quick-tools"
          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors"
        >
          <Shield className="w-5 h-5" />
          Create Kundli
        </Link>
      </div>
    </div>
  )

  return (
    <div>
      {/* Main Content Wrapper - Compensate for navbar height */}
      <div className="pt-20">
        {/* SECTION 1 - Free ASTROLOGY TOOLS */}
        <section className="px-6 py-4 mb-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-sm tracking-widest uppercase text-gray-400 font-medium mb-4">
              <span className="text-[#fdce20] font-bold">FREE</span> ASTROLOGY TOOLS
            </div>
            <div className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide">
              {/* Daily Horoscope */}
              <Link href="/astrology/daily-horoscope" className="group flex-shrink-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 shadow-md shadow-black/20 transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] cursor-pointer min-w-[160px] h-12">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-all duration-200">
                    <span className="text-sm">🌙</span>
                  </div>
                  <span className="text-sm font-normal text-gray-300 group-hover:text-white transition-colors duration-200">Daily Horoscope</span>
                </div>
              </Link>

              {/* Create Kundli */}
              <Link href="/astrology/kundli" className="group flex-shrink-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 shadow-md shadow-black/20 transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] cursor-pointer min-w-[160px] h-12">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-all duration-200">
                    <span className="text-sm">🔮</span>
                  </div>
                  <span className="text-sm font-normal text-gray-300 group-hover:text-white transition-colors duration-200">Create Kundli</span>
                </div>
              </Link>

              {/* Vastu */}
              <Link href="/astrology/vastu" className="group flex-shrink-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 shadow-md shadow-black/20 transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] cursor-pointer min-w-[160px] h-12">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-all duration-200">
                    <span className="text-sm">🏠</span>
                  </div>
                  <span className="text-sm font-normal text-gray-300 group-hover:text-white transition-colors duration-200">Vastu</span>
                </div>
              </Link>

              {/* Panchang */}
              <Link href="/astrology/panchang" className="group flex-shrink-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 shadow-md shadow-black/20 transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] cursor-pointer min-w-[160px] h-12">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-all duration-200">
                    <span className="text-sm">📜</span>
                  </div>
                  <span className="text-sm font-normal text-gray-300 group-hover:text-white transition-colors duration-200">Panchang</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 2 - Astrologer Listing */}
        <section className="px-6 py-15">
          <div className="max-w-[1200px] mx-auto">
            {/* Title Section - Left Aligned */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold font-serif text-white mb-3">
                Meet Our <span className="text-[#fdce20]">Astrologers</span>
              </h1>
              <p className="text-lg text-gray-300">
                Authentic guidance, real answers.
              </p>
            </div>

            {/* Integrated Filter Bar */}
            <div className="sticky top-0 z-40 w-full bg-gradient-to-b from-[#0f172a]/95 via-[#0f172a]/90 to-[#0b1220]/95 backdrop-blur-lg border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-all duration-300 mb-8">
              {/* Top Soft Highlight Line */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 md:p-4">
                {/* Mobile: Compact Single Row */}
                <div className="flex items-center justify-center gap-2 flex-nowrap w-full py-3 px-4 md:hidden">
                  {/* Online Toggle (Mobile) */}
                  <button
                    onClick={() => setIsOnlineOnly(prev => !prev)}
                    className={`flex items-center justify-center gap-2 h-8 px-3 rounded-full text-xs font-medium transition-all duration-200 flex-1 ${
                      isOnlineOnly
                        ? 'bg-yellow-500 text-black shadow-md'
                        : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {isOnlineOnly && (
                      <span className="h-2 w-2 rounded-full bg-green-400"></span>
                    )}
                    <span>Online</span>
                  </button>

                  {/* Specialties Dropdown (Mobile) */}
                  <div ref={modeRef} className="relative inline-block flex-1">
                    <button
                      onClick={() => setIsModeOpen(!isModeOpen)}
                      className="h-8 px-3 rounded-full bg-white/5 border border-white/10 text-xs text-white flex items-center justify-center gap-2 hover:bg-white/10 transition-colors w-full"
                    >
                      {selectedMode === 'all' ? 'Specialties' : selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}
                      <ChevronDown size={12} className={`text-white/60 transition-transform duration-200 ${isModeOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Compact Dropdown */}
                    {isModeOpen && (
                      <div className="absolute left-0 mt-2 min-w-full w-max rounded-xl bg-gradient-to-b from-[#111827] to-[#0b1220] border border-white/10 shadow-xl shadow-black/40 backdrop-blur-sm z-50 py-2">
                        <div className="flex flex-col gap-1">
                          {astrologySpecialties.map((specialty) => (
                            <button
                              key={specialty.value}
                              onClick={() => {
                                setSelectedMode(specialty.value)
                                setIsModeOpen(false)
                              }}
                              className={`px-3 py-2 text-left text-sm transition-colors ${
                                selectedMode === specialty.value
                                  ? 'bg-[#fdce20] text-black'
                                  : 'text-white hover:bg-white/10'
                              }`}
                            >
                              {specialty.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price Button (Mobile) */}
                  <div ref={priceRef} className="relative inline-block flex-1">
                    <button
                      onClick={() => setIsPriceOpen(!isPriceOpen)}
                      className="h-8 px-3 rounded-full bg-white/5 text-white border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors w-full text-center"
                    >
                      ₹{priceRange[1]}
                    </button>

                    {/* Compact Price Panel */}
                    {isPriceOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-xl bg-gradient-to-b from-[#111827] to-[#0b1220] border border-white/10 shadow-xl shadow-black/40 backdrop-blur-sm p-4 z-50">
                        <div className="text-sm text-white mb-3">
                          Max Price: ₹{priceRange[1]}
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="w-full accent-yellow-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                          <span>₹0</span>
                          <span>₹5000</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sort Dropdown (Mobile) */}
                  <div ref={sortRef} className="relative inline-block flex-1">
                    <button
                      onClick={() => setIsSortOpen(!isSortOpen)}
                      className="h-8 px-3 rounded-full bg-white/5 text-white border border-white/10 text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-colors w-full"
                    >
                      {sortBy === 'recommended' ? 'Sort' : sortBy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()).split(' ')[0]}
                      <ChevronDown size={12} className={`text-white/60 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Compact Dropdown */}
                    {isSortOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-xl bg-gradient-to-b from-[#111827] to-[#0b1220] border border-white/10 shadow-xl shadow-black/40 backdrop-blur-sm z-50 py-2">
                        <div className="flex flex-col gap-1">
                          {[
                            { value: 'recommended', label: 'Recommended' },
                            { value: 'online', label: 'Online Now' },
                            { value: 'rating', label: 'Highest Rated' },
                            { value: 'experience', label: 'Most Experienced' },
                            { value: 'price-low', label: 'Lowest Price' },
                            { value: 'price-high', label: 'Highest Price' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSortBy(option.value)
                                setIsSortOpen(false)
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs leading-5 transition-colors duration-150 ${
                                sortBy === option.value
                                  ? 'bg-white/10 text-white font-medium'
                                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop: Full Layout */}
                <div className="hidden md:flex flex-wrap items-center gap-4">
                  {/* Online Now Toggle */}
                  <button
                    onClick={() => setIsOnlineOnly(prev => !prev)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isOnlineOnly
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/15'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      isOnlineOnly ? 'bg-green-400' : 'bg-gray-400'
                    }`}>
                      <div className={`w-1 h-1 rounded-full bg-white transition-transform ${
                        isOnlineOnly ? 'translate-x-0.5' : 'translate-x-1'
                      }`}></div>
                    </div>
                    <span>Online</span>
                  </button>

                  {/* Specialties Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Specialties:</span>
                    <div ref={modeRef} className="relative">
                      <button
                        onClick={() => setIsModeOpen(!isModeOpen)}
                        className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 text-sm flex items-center gap-2 hover:bg-white/15 transition-colors"
                      >
                        {selectedMode === 'all' ? 'All Specialties' : selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1).replace('-', ' ')}
                        <ChevronDown size={14} className={`text-white/60 transition-transform duration-200 ${isModeOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown */}
                      {isModeOpen && (
                        <div className="absolute left-0 mt-2 w-64 rounded-xl bg-gradient-to-b from-[#111827] to-[#0b1220] border border-white/10 shadow-xl shadow-black/40 backdrop-blur-sm z-50 py-2">
                          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                            {astrologySpecialties.map((specialty) => (
                              <button
                                key={specialty.value}
                                onClick={() => {
                                  setSelectedMode(specialty.value)
                                  setIsModeOpen(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm leading-5 transition-colors duration-150 ${
                                  selectedMode === specialty.value
                                    ? 'bg-white/10 text-white font-medium'
                                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                {specialty.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Price:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">₹{priceRange[0]}</span>
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-24"
                      />
                      <span className="text-sm text-white">₹{priceRange[1]}</span>
                    </div>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Sort By:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1 rounded-lg bg-[#1a1a1a] text-white text-sm border border-white/20 focus:ring-2 focus:ring-yellow-400/50 appearance-none cursor-pointer"
                    >
                      <option value="recommended" className="bg-[#1a1a1a] text-white">Recommended</option>
                      <option value="online" className="bg-[#1a1a1a] text-white">Online Now</option>
                      <option value="rating" className="bg-[#1a1a1a] text-white">Highest Rated</option>
                      <option value="experience" className="bg-[#1a1a1a] text-white">Most Experienced</option>
                      <option value="price-low" className="bg-[#1a1a1a] text-white">Lowest Price</option>
                      <option value="price-high" className="bg-[#1a1a1a] text-white">Highest Price</option>
                    </select>
                  </div>

                  {/* Results Count */}
                  <div className="ml-auto text-sm text-gray-600">
                    {experts.length} experts found
                  </div>
                </div>
              </div>
            </div>

            {/* Expert Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Error Loading Astrologers
                </h2>
                <p className="text-gray-600">{error}</p>
                <button
                  onClick={fetchExperts}
                  className="mt-4 px-6 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : experts.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {experts.map((expert) => (
                  <AstrologerCard key={expert.id} astrologer={expert} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3 - Trust Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold font-serif text-white mb-4">
                Why Choose <span className="text-[#fdce20]">Our Astrology</span> Platform
              </h2>
              <p className="text-base text-gray-300 max-w-2xl mx-auto">
                Experience most trusted and authentic astrology guidance with our premium features
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  icon: <Star className="w-6 h-6" />, 
                  title: 'Expert Astrologers', 
                  description: 'Vedic and Western astrology experts with decades of experience'
                },
                { 
                  icon: <Sparkles className="w-6 h-6" />, 
                  title: 'Cosmic Accuracy', 
                  description: 'Precise birth chart analysis and planetary predictions'
                },
                { 
                  icon: <Lock className="w-6 h-6" />, 
                  title: 'Sacred Privacy', 
                  description: 'Your spiritual journey remains completely confidential'
                },
                { 
                  icon: <Heart className="w-6 h-6" />, 
                  title: 'Karmic Satisfaction', 
                  description: 'Find peace and clarity with our satisfaction guarantee'
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-[#fdce20]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#fdce20]/20 transition-colors duration-300">
                    <div className="text-[#fdce20]">{feature.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold font-serif text-white mb-2 group-hover:text-[#fdce20] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
