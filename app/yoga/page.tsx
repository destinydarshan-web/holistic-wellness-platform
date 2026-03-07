'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, Filter, Star, Clock, Users, CheckCircle, ChevronDown, MessageCircle, Phone, Video, Shield, Lock, Heart, Sparkles, X, HelpCircle, Leaf, Brain, Zap } from 'lucide-react'
import YogaTrainerCard from '@/components/YogaTrainerCard'
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

export default function YogaPage() {
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
    fetchYogaInstructors()
  }, [isOnlineOnly, selectedMode, priceRange, sortBy])

  const fetchYogaInstructors = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        onlineOnly: isOnlineOnly.toString(),
        mode: selectedMode,
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        sortBy: sortBy,
        service: 'yoga'
      })
      
      const response = await fetch(`/api/experts?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch yoga instructors: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setExperts(result.data || [])
      } else {
        throw new Error(result.details || 'Failed to fetch yoga instructors')
      }
    } catch (err) {
      console.error('Error fetching yoga instructors:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch yoga instructors')
    } finally {
      setLoading(false)
    }
  }

  const displayExperts = experts

  const SkeletonCard = () => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      <div className="animate-pulse">
        <div className="h-48 bg-white/10"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-3 bg-white/10 rounded w-1/2"></div>
          <div className="h-3 bg-white/10 rounded w-full"></div>
        </div>
      </div>
    </div>
  )

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-xl font-semibold font-serif text-white mb-2">No Yoga Instructors Found</h3>
      <p className="text-gray-300">
        Try adjusting your filters or search terms to find available yoga instructors.
      </p>
    </div>
  )

  return (
    <div className="pt-20">
      {/* SECTION 2 - Yoga Instructor Listing */}
      <section id="instructors" className="px-6 py-15">
        <div className="max-w-[1200px] mx-auto">
          {/* Title Section - Left Aligned */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-white mb-3">
              Meet Our <span className="text-[#fdce20]">Yoga Instructors</span>
            </h1>
            <p className="text-lg text-gray-300">
              Certified instructors guiding your wellness journey.
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
                        ? 'bg-[#fdce20] text-black shadow-md'
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
                      {selectedMode === 'all' ? 'Styles' : selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}
                      <ChevronDown size={12} className={`text-white/60 transition-transform duration-200 ${isModeOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Compact Dropdown */}
                    {isModeOpen && (
                      <div className="absolute left-0 mt-2 min-w-full w-max rounded-xl bg-gradient-to-b from-[#111827] to-[#0b1220] border border-white/10 shadow-xl shadow-black/40 backdrop-blur-sm z-50 py-2">
                        <div className="flex flex-col gap-1">
                          {[
                            { value: 'all', label: 'All Styles' },
                            { value: 'hatha', label: 'Hatha Yoga' },
                            { value: 'vinyasa', label: 'Vinyasa Flow' },
                            { value: 'ashtanga', label: 'Ashtanga' },
                            { value: 'yin', label: 'Yin Yoga' },
                            { value: 'restorative', label: 'Restorative' },
                            { value: 'power', label: 'Power Yoga' },
                            { value: 'meditation', label: 'Meditation' },
                            { value: 'prenatal', label: 'Prenatal Yoga' },
                            { value: 'kids', label: 'Kids Yoga' }
                          ].map((specialty) => (
                            <button
                              key={specialty.value}
                              onClick={() => {
                                setSelectedMode(specialty.value)
                                setIsModeOpen(false)
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs leading-5 transition-colors duration-150 ${
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
                          className="w-full accent-[#fdce20]"
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

              {/* Desktop: Full Filters */}
              <div className="hidden md:flex items-center justify-between gap-4">
                {/* Online Now Toggle */}
                <button
                  onClick={() => setIsOnlineOnly(prev => !prev)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isOnlineOnly
                      ? 'bg-[#fdce20] text-black'
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
                  <span className="text-sm text-gray-300">Styles:</span>
                  <div ref={modeRef} className="relative">
                    <button
                      onClick={() => setIsModeOpen(!isModeOpen)}
                      className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 text-sm flex items-center gap-2 hover:bg-white/15 transition-colors"
                    >
                      {selectedMode === 'all' ? 'All Styles' : selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1).replace('-', ' ')}
                      <ChevronDown size={14} className={`text-white/60 transition-transform duration-200 ${isModeOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {isModeOpen && (
                      <div className="absolute left-0 mt-2 w-64 rounded-xl bg-gradient-to-b from-[#111827] to-[#0b1220] border border-white/10 shadow-xl shadow-black/40 backdrop-blur-sm z-50 py-2">
                        <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                          {[
                            { value: 'all', label: 'All Styles' },
                            { value: 'hatha', label: 'Hatha Yoga' },
                            { value: 'vinyasa', label: 'Vinyasa Flow' },
                            { value: 'ashtanga', label: 'Ashtanga' },
                            { value: 'yin', label: 'Yin Yoga' },
                            { value: 'restorative', label: 'Restorative' },
                            { value: 'power', label: 'Power Yoga' },
                            { value: 'meditation', label: 'Meditation' },
                            { value: 'prenatal', label: 'Prenatal Yoga' },
                            { value: 'kids', label: 'Kids Yoga' }
                          ].map((specialty) => (
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
                    className="px-3 py-1 rounded-lg bg-[#1a1a1a] text-white text-sm border border-white/20 focus:ring-2 focus:ring-[#fdce20]/50 appearance-none cursor-pointer"
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
                  {experts.length} instructors found
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
                Error Loading Instructors
              </h2>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={fetchYogaInstructors}
                className="mt-4 px-6 py-2 bg-[#fdce20] text-black font-medium rounded-lg hover:bg-[#fdce20]/80 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : experts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {experts.map((expert) => (
                <YogaTrainerCard key={expert.id} trainer={expert} />
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
              Why Choose <span className="text-[#fdce20]">Our Yoga</span> Platform
            </h2>
            <p className="text-base text-gray-300 max-w-2xl mx-auto">
              Experience authentic yoga practice with our premium features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: <Star className="w-6 h-6" />, 
                title: 'Expert Instructors', 
                description: 'Certified yoga teachers with years of teaching experience'
              },
              { 
                icon: <Shield className="w-6 h-6" />, 
                title: 'Safe Practice', 
                description: 'Proper guidance and modifications for all fitness levels'
              },
              { 
                icon: <Heart className="w-6 h-6" />, 
                title: 'Holistic Approach', 
                description: 'Mind, body, and spirit wellness through integrated practice'
              },
              { 
                icon: <CheckCircle className="w-6 h-6" />, 
                title: 'Flexible Scheduling', 
                description: 'Practice anytime, anywhere with our expert guidance'
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
  )
}
