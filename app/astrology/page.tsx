'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Star, Clock, Users, CheckCircle, ChevronDown, MessageCircle, Phone, Video, Shield, Lock, Heart, Sparkles, X, HelpCircle } from 'lucide-react'
import AstrologerCard from '@/components/AstrologerCard'
import Link from 'next/link'

interface Expert {
  id: string
  name: string
  specialization: string
  bio: string
  rating: number
  reviews: number
  experience: string
  responseTime: string
  price: number
  image: string
  online: boolean
  verified: boolean
  modes: string[]
}

export default function AstrologyPage() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [selectedMode, setSelectedMode] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [sortBy, setSortBy] = useState('recommended')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchExperts()
  }, [onlineOnly, selectedMode, priceRange, sortBy])

  const fetchExperts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        onlineOnly: onlineOnly.toString(),
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f172a]">
      {/* Main Content Wrapper - Compensate for navbar height */}
      <div className="pt-20">
        {/* SECTION 1 - Quick Astrology Tools */}
        <section className="px-6 pt-10 pb-12 bg-gradient-to-b from-[#1a1f3a] to-[#0f172a]">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-sm uppercase tracking-wide text-white/60 font-medium mb-4">
              Quick Astrology Tools
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {/* Daily Horoscope */}
              <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer min-w-[200px]">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌙</span>
                  <span className="text-white font-medium">Daily Horoscope</span>
                </div>
              </div>

              {/* Create Kundli */}
              <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer min-w-[200px]">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔮</span>
                  <span className="text-white font-medium">Create Kundli</span>
                </div>
              </div>

              {/* Match Making */}
              <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer min-w-[200px]">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💑</span>
                  <span className="text-white font-medium">Match Making</span>
                </div>
              </div>

              {/* Palm Reading */}
              <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer min-w-[200px]">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🤚</span>
                  <span className="text-white font-medium">Palm Reading</span>
                </div>
              </div>

              {/* Numerology */}
              <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer min-w-[200px]">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔢</span>
                  <span className="text-white font-medium">Numerology</span>
                </div>
              </div>

              {/* Vastu */}
              <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer min-w-[200px]">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🏠</span>
                  <span className="text-white font-medium">Vastu</span>
                </div>
              </div>

              {/* Tarot Reading */}
              <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer min-w-[200px]">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎴</span>
                  <span className="text-white font-medium">Tarot Reading</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 - Astrologer Listing */}
        <section className="px-6 py-15 bg-[#f8f9fc]">
          <div className="max-w-[1200px] mx-auto">
            {/* Title Section - Left Aligned */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-3">
                Meet Our Astrologers
              </h1>
              <p className="text-lg text-gray-600">
                Choose an expert and start your session instantly.
              </p>
            </div>

            {/* Integrated Filter Bar */}
            <div className="sticky top-0 z-40 mb-8">
              <div className="bg-[#f3f4f6] border border-gray-200 rounded-lg p-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Online Now Toggle */}
                  <button
                    onClick={() => setOnlineOnly(!onlineOnly)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      onlineOnly
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      onlineOnly ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <div className={`w-1 h-1 rounded-full bg-white transition-transform ${
                        onlineOnly ? 'translate-x-0.5' : 'translate-x-1'
                      }`}></div>
                    </div>
                    <span>{onlineOnly ? 'Online Only' : 'All Experts'}</span>
                  </button>

                  {/* Mode Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Mode:</span>
                    <div className="flex gap-1">
                      {['all', 'chat', 'call', 'video'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setSelectedMode(mode)}
                          className={`px-3 py-1 rounded-lg text-sm capitalize transition-all duration-300 ${
                            selectedMode === mode
                              ? 'bg-gray-800 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          {mode === 'all' ? 'All' : mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Price:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">₹{priceRange[0]}</span>
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-24"
                      />
                      <span className="text-sm">₹{priceRange[1]}</span>
                    </div>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1 rounded-lg bg-white text-gray-700 text-sm border border-gray-300 focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="recommended">Recommended</option>
                      <option value="online">Online Now</option>
                      <option value="rating">Highest Rated</option>
                      <option value="experience">Most Experienced</option>
                      <option value="price-low">Lowest Price</option>
                      <option value="price-high">Highest Price</option>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {experts.map((expert) => (
                  <AstrologerCard key={expert.id} astrologer={expert} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3 - Trust Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: <Shield className="w-7 h-7" />, title: 'Verified Experts', description: 'All our astrologers are verified and background checked' },
                { icon: <Lock className="w-7 h-7" />, title: 'Privacy Protected', description: 'Your conversations are 100% private and secure' },
                { icon: <Heart className="w-7 h-7" />, title: 'Satisfaction Guaranteed', description: 'Get a refund if you\'re not satisfied with session' },
                { icon: <HelpCircle className="w-7 h-7" />, title: '24/7 Support', description: 'Our support team is always here to help you' }
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-yellow-400/10 rounded-full flex items-center justify-center text-yellow-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Floating Conversion Button */}
        <button 
          onClick={() => {
            const element = document.querySelector('.grid')
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }}
          className="fixed bottom-8 right-8 px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        >
          Talk to an Astrologer Now
        </button>

        {/* Mobile Floating Action Button (larger for easy tapping) */}
        <button 
          onClick={() => {
            const element = document.querySelector('.grid')
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }}
          className="lg:hidden fixed bottom-6 right-6 px-8 py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 text-lg"
        >
          Talk to an Astrologer Now
        </button>
      </div>
    </div>
  )
}
