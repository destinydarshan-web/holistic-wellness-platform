'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, Filter, Star, Clock, Users, CheckCircle, ChevronDown, MessageCircle, Phone, Video, Shield, Lock, Heart, Sparkles, X, HelpCircle } from 'lucide-react'
import CounsellorCard from '@/components/CounsellorCard'
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

export default function CounsellingPage() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [isOnlineOnly, setIsOnlineOnly] = useState(false)
  const [selectedMode, setSelectedMode] = useState('all')
  const [selectedSpecialization, setSelectedSpecialization] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [sortBy, setSortBy] = useState('recommended')
  const [showFilters, setShowFilters] = useState(false)
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [isModeOpen, setIsModeOpen] = useState(false)
  const [isSpecializationOpen, setIsSpecializationOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isPriceOpen, setIsPriceOpen] = useState(false)
  const modeRef = useRef<HTMLDivElement>(null)
  const specializationRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)
  const priceRef = useRef<HTMLDivElement>(null)

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeRef.current && !modeRef.current.contains(event.target as Node)) {
        setIsModeOpen(false)
      }
      if (specializationRef.current && !specializationRef.current.contains(event.target as Node)) {
        setIsSpecializationOpen(false)
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false)
      }
      if (priceRef.current && !priceRef.current.contains(event.target as Node)) {
        setIsPriceOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch counsellors
  useEffect(() => {
    fetchCounsellors()
  }, [onlineOnly, isOnlineOnly, selectedMode, priceRange, sortBy])

  const fetchCounsellors = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        onlineOnly: onlineOnly.toString(),
        mode: selectedMode,
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        sortBy: sortBy,
        service: 'counselling' // Add service filter for counsellors
      })
      
      console.log('=== DEBUG: Frontend Fetch Counsellors ===')
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
        throw new Error(`Failed to fetch counsellors: ${response.status} ${errorText}`)
      }
      
      const result = await response.json()
      
      console.log('=== DEBUG: Counselling API Response ===')
      console.log('Full response:', result)
      console.log('Success:', result.success)
      console.log('Data:', result.data)
      console.log('Data length:', result.data?.length || 0)
      console.log('Error:', result.error)
      
      // Log approved counsellors only
      if (result.success && result.data) {
        console.log('=== DEBUG: Approved Counsellors Only ===')
        console.log('Approved counsellors:', result.data)
        console.log('Specializations:', result.data.map((e: any) => e.specialization))
        console.log('Statuses:', result.data.map((e: any) => e.status))
        console.log('Roles:', result.data.map((e: any) => e.role))
      }
      
      if (result.success) {
        console.log('=== DEBUG: Setting Counsellors State ===')
        console.log('Counsellors fetched:', result.data)
        setExperts(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to fetch counsellors')
      }
    } catch (err) {
      console.log('=== DEBUG: Fetch Error ===')
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Display experts directly (API handles filtering)
  const displayExperts = experts

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#0b1220]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 to-[#0b1220]/50 backdrop-blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-12">
           
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center gap-2 text-white/80">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Verified Professionals</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Lock className="w-5 h-5 text-blue-400" />
                <span>100% Confidential</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Heart className="w-5 h-5 text-red-400" />
                <span>Compassionate Care</span>
              </div>
            </div>
          </div>

          {/* Topic Cards Section */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Explore Counselling Topics</h2>
            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 md:scrollbar-visible">
              <div className="flex gap-6 min-w-max">
                <Link 
                  href="/counselling/topics/depression"
                  className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group min-w-[56px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                    </div>
                    <h3 className="text-base font-semibold text-white">Depression</h3>
                  </div>
                  <div className="flex items-center text-green-400 group-hover:text-green-300">
                    <span className="text-xs font-medium">Learn More</span>
                  </div>
                </Link>

                <Link 
                  href="/counselling/topics/anxiety"
                  className="bg-gradient-to-br from-green-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group min-w-[70px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                    </div>
                    <h3 className="text-base font-semibold text-white">Anxiety</h3>
                  </div>
                </Link>

                <Link 
                  href="/counselling/topics/relationships"
                  className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group min-w-[70px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                    </div>
                    <h3 className="text-base font-semibold text-white">Relationships</h3>
                  </div>
                  <div className="flex items-center text-purple-400 group-hover:text-purple-300">
                    <span className="text-xs font-medium">Learn More</span>
                  </div>
                </Link>

                <Link 
                  href="/counselling/topics/pregnancy"
                  className="bg-gradient-to-br from-pink-600/20 to-red-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group min-w-[70px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                    </div>
                    <h3 className="text-base font-semibold text-white">Pregnancy</h3>
                  </div>
                  <div className="flex items-center text-pink-400 group-hover:text-pink-300">
                    <span className="text-xs font-medium">Learn More</span>
                  </div>
                </Link>

                <Link 
                  href="/counselling/topics/examinations"
                  className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group min-w-[70px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                    </div>
                    <h3 className="text-base font-semibold text-white">Examinations</h3>
                  </div>
                  <div className="flex items-center text-yellow-400 group-hover:text-yellow-300">
                    <span className="text-xs font-medium">Learn More</span>
                  </div>
                </Link>

                <Link 
                  href="/counselling/topics/stress-management"
                  className="bg-gradient-to-br from-red-600/20 to-orange-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group min-w-[70px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                    </div>
                    <h3 className="text-base font-semibold text-white">Stress Management</h3>
                  </div>
                  <div className="flex items-center text-red-400 group-hover:text-red-300">
                    <span className="text-xs font-medium">Learn More</span>
                  </div>
                </Link>

                <Link 
                  href="/counselling/topics/trauma"
                  className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group min-w-[70px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                    </div>
                    <h3 className="text-base font-semibold text-white">Trauma & PTSD</h3>
                  </div>
                  <div className="flex items-center text-indigo-400 group-hover:text-indigo-300">
                    <span className="text-xs font-medium">Learn More</span>
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>

                <Link 
                  href="/counselling/topics/self-esteem"
                  className="bg-gradient-to-br from-teal-600/20 to-green-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group min-w-[56px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                    </div>
                    <h3 className="text-base font-semibold text-white">Self-Esteem</h3>
                  </div>
                  <div className="flex items-center text-teal-400 group-hover:text-teal-300">
                    <span className="text-xs font-medium">Learn More</span>
                  </div>
                </Link>

                <Link 
                  href="/counselling/topics/addiction"
                  className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group min-w-[70px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                    </div>
                    <h3 className="text-base font-semibold text-white">Addiction Recovery</h3>
                  </div>
                  <p className="text-gray-300 mb-3 text-xs">Support for overcoming substance abuse and dependencies.</p>
                  <div className="flex items-center text-orange-400 group-hover:text-orange-300">
                    <span className="text-xs font-medium">Learn More</span>
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>

                <Link 
                  href="/counselling/topics/grief"
                  className="bg-gradient-to-br from-gray-600/20 to-slate-600/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group min-w-[56px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-sm"></div>
                    </div>
                    <h3 className="text-base font-semibold text-white">Grief & Loss</h3>
                  </div>
                  <div className="flex items-center text-gray-400 group-hover:text-gray-300">
                    <span className="text-xs font-medium">Learn More</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Counsellor Cards Section */}
          {/* Title Section - Left Aligned */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <h1 className="text-3xl md:text-4xl font-serif text-white mb-3">
              Meet Our Counsellors
            </h1>
            <p className="text-lg text-gray-300">
              Professional guidance, real support.
            </p>
          </div>

          {/* Filters Section */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sticky top-0 z-40 w-full bg-gradient-to-b from-[#0f172a]/95 via-[#0f172a]/90 to-[#0b1220]/95 backdrop-blur-lg border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-all duration-300 mb-8">
          {/* Top Soft Highlight Line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 md:p-4">
            <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-300"></div>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Search counsellors by name, specialty, or expertise..."
                  className="relative w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex gap-4">
              {/* Online Only Toggle */}
              <button
                onClick={() => setIsOnlineOnly(!isOnlineOnly)}
                className={`relative px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                  isOnlineOnly 
                    ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/25' 
                    : 'bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isOnlineOnly ? 'bg-white' : 'bg-gray-400'}`}></div>
                  <span>Online Only</span>
                </div>
              </button>

              {/* Specialization Dropdown */}
              <div className="relative" ref={specializationRef}>
                <button
                  onClick={() => setIsSpecializationOpen(!isSpecializationOpen)}
                  className="px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                >
                  <span>Specialization: {selectedSpecialization === 'all' ? 'All' : selectedSpecialization}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isSpecializationOpen && (
                  <div className="absolute top-full mt-2 w-56 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50">
                    <button
                      onClick={() => {
                        setSelectedSpecialization('all')
                        setIsSpecializationOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      All Specializations
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSpecialization('Anxiety Counselling')
                        setIsSpecializationOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Anxiety Counselling
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSpecialization('Depression Counselling')
                        setIsSpecializationOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Depression Counselling
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSpecialization('Relationship Counselling')
                        setIsSpecializationOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Relationship Counselling
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSpecialization('Career Counselling')
                        setIsSpecializationOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Career Counselling
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSpecialization('Family Counselling')
                        setIsSpecializationOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Family Counselling
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSpecialization('Trauma & PTSD Counselling')
                        setIsSpecializationOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Trauma & PTSD
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSpecialization('Addiction Counselling')
                        setIsSpecializationOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Addiction Counselling
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSpecialization('Self-Esteem Counselling')
                        setIsSpecializationOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Self-Esteem Counselling
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSpecialization('Grief Counselling')
                        setIsSpecializationOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Grief Counselling
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSpecialization('Life Coaching')
                        setIsSpecializationOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Life Coaching
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSpecialization('Substance Abuse Counselling')
                        setIsSpecializationOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Substance Abuse
                    </button>
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                >
                  <span>Sort: {sortBy === 'recommended' ? 'Recommended' : sortBy === 'price_low' ? 'Price: Low to High' : sortBy === 'price_high' ? 'Price: High to Low' : sortBy === 'experience' ? 'Experience' : 'Rating'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isSortOpen && (
                  <div className="absolute top-full mt-2 w-56 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50">
                    <button
                      onClick={() => {
                        setSortBy('recommended')
                        setIsSortOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Recommended
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('price_low')
                        setIsSortOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Price: Low to High
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('price_high')
                        setIsSortOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Price: High to Low
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('experience')
                        setIsSortOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Experience
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('rating')
                        setIsSortOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Rating
                    </button>
                  </div>
                )}
              </div>

              {/* Price Range Dropdown */}
              <div className="relative" ref={priceRef}>
                <button
                  onClick={() => setIsPriceOpen(!isPriceOpen)}
                  className="px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                >
                  <span>Price Range</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isPriceOpen && (
                  <div className="absolute top-full mt-2 w-64 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 p-4">
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Min: ₹{priceRange[0]}</span>
                        <span>Max: ₹{priceRange[1]}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                    <button
                      onClick={() => setIsPriceOpen(false)}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] to-[#0b1220] rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-full">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              </div>
            </div>
            <p className="mt-6 text-lg text-gray-300">Loading expert counsellors...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-20">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Unable to Load Counsellors</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={fetchCounsellors}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Counsellor Cards */}
      {!loading && !error && (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {displayExperts.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Counsellors Found</h3>
                <p className="text-gray-300">
                  Try adjusting your filters or search terms to find available counsellors.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayExperts.map((expert: Expert) => (
                <CounsellorCard 
                  key={expert.id} 
                  counsellor={expert} 
                />
              ))}
            </div>
          )}
        </div>
      )}

      
      {/* Why Counselling is Essential Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Why Counselling is Essential</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3">Mental Clarity</h3>
            <p className="text-gray-300">Gain insights into your thoughts and emotions with professional guidance.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3">Emotional Support</h3>
            <p className="text-gray-300">Find a safe space to express feelings without judgment.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-3">Personal Growth</h3>
            <p className="text-gray-300">Develop coping strategies and build resilience for life challenges.</p>
          </div>
        </div>
      </div>

      </div>
  )
}
