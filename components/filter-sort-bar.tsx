'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, Star, MessageCircle, Phone, Video, Users } from 'lucide-react'

interface FilterSortBarProps {
  onFilterChange?: (filters: string[]) => void
  onSortChange?: (sort: string) => void
  resultCount?: number
}

export function FilterSortBar({ onFilterChange, onSortChange, resultCount = 12 }: FilterSortBarProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [sortOption, setSortOption] = useState('Most Popular')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [showBottomCTA, setShowBottomCTA] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsSticky(scrollY > 200) // Become sticky after scrolling 200px
      setShowBottomCTA(scrollY > 400) // Show bottom CTA after scrolling 400px
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const filterOptions = [
    { id: 'online', label: 'Online Now', icon: null },
    { id: 'chat', label: 'Chat', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'voice', label: 'Voice', icon: <Phone className="w-4 h-4" /> },
    { id: 'video', label: 'Video', icon: <Video className="w-4 h-4" /> },
    { id: 'rating', label: '4.5+ Rating', icon: <Star className="w-4 h-4" /> },
  ]

  const sortOptions = [
    'Most Popular',
    'Highest Rated',
    'Price: Low to High',
    'Price: High to Low',
  ]

  const toggleFilter = (filterId: string) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId]
    
    setActiveFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleSortChange = (option: string) => {
    setSortOption(option)
    setIsDropdownOpen(false)
    onSortChange?.(option)
  }

  const handleBottomCTAClick = () => {
    // Activate "Online Now" filter
    if (!activeFilters.includes('online')) {
      const newFilters = [...activeFilters, 'online']
      setActiveFilters(newFilters)
      onFilterChange?.(newFilters)
    }
    
    // Scroll to astrologer grid
    const astrologerSection = document.getElementById('astrologer-grid')
    if (astrologerSection) {
      astrologerSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    
    // Add vibration feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(50) // 50ms vibration
    }
  }

  return (
    <>
      {/* Sticky Filter Bar */}
      {isSticky && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-neutral-600">
                  Showing {resultCount} astrologers
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeFilters.map((filterId) => {
                    const filter = filterOptions.find(f => f.id === filterId)
                    return filter ? (
                      <span key={filterId} className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5c14b] text-black text-xs rounded-full">
                        {filter.icon}
                        {filter.label}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-200 justify-between"
                >
                  <span>Sort: {sortOption}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-300 rounded-lg shadow-lg z-50">
                    {sortOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSortChange(option)}
                        className={`w-full text-left px-4 py-2 text-xs hover:bg-neutral-50 transition-colors ${
                          sortOption === option ? 'bg-neutral-50 font-medium text-black' : 'text-neutral-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom CTA - Mobile Only */}
      {showBottomCTA && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#fbcc1e] shadow-lg transition-all duration-300 ease-out">
          <div className="max-w-full mx-auto">
            <button
              onClick={handleBottomCTAClick}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 text-black font-bold text-base transition-all duration-200 active:scale-95"
              style={{ minHeight: '52px' }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Talk to Available Astrologers Now
            </button>
          </div>
        </div>
      )}

      {/* Main Filter Bar */}
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${isSticky ? 'mb-4' : 'mb-5'}`}>
        <div className="p-3 md:p-6">
          
          {/* Mobile Layout - Single Horizontal Row */}
          <div className="md:hidden">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => toggleFilter('online')}
                className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 h-8 whitespace-nowrap flex-shrink-0 ${
                  activeFilters.includes('online')
                    ? 'bg-[#f5c14b] text-black border-[#f5c14b]'
                    : 'bg-transparent border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
                }`}
              >
                Online Now
              </button>
              <button
                onClick={() => toggleFilter('chat')}
                className={`inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-full text-xs font-medium transition-all duration-200 h-8 whitespace-nowrap flex-shrink-0 ${
                  activeFilters.includes('chat')
                    ? 'bg-[#f5c14b] text-black border-[#f5c14b]'
                    : 'bg-transparent border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
                }`}
              >
                <MessageCircle className="w-3 h-3" />
                Chat
              </button>
              <button
                onClick={() => toggleFilter('voice')}
                className={`inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-full text-xs font-medium transition-all duration-200 h-8 whitespace-nowrap flex-shrink-0 ${
                  activeFilters.includes('voice')
                    ? 'bg-[#f5c14b] text-black border-[#f5c14b]'
                    : 'bg-transparent border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
                }`}
              >
                <Phone className="w-3 h-3" />
                Voice
              </button>
              <button
                onClick={() => toggleFilter('video')}
                className={`inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-full text-xs font-medium transition-all duration-200 h-8 whitespace-nowrap flex-shrink-0 ${
                  activeFilters.includes('video')
                    ? 'bg-[#f5c14b] text-black border-[#f5c14b]'
                    : 'bg-transparent border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
                }`}
              >
                <Video className="w-3 h-3" />
                Video
              </button>
              <button
                onClick={() => toggleFilter('rating')}
                className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 h-8 whitespace-nowrap flex-shrink-0 ${
                  activeFilters.includes('rating')
                    ? 'bg-[#f5c14b] text-black border-[#f5c14b]'
                    : 'bg-transparent border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-400 hover:bg-neutral-50'
                }`}
              >
                <Star className="w-3 h-3" />
                4.5+ Rating
              </button>
            </div>
          </div>

          {/* Desktop Layout - Unchanged */}
          <div className="hidden md:flex md:flex-row md:items-center md:justify-between md:gap-4">
            
            {/* Filters - Left Side */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeFilters.includes(filter.id)
                      ? 'bg-[#f5c14b] text-black border-[#f5c14b]'
                      : 'bg-transparent border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
                  }`}
                >
                  {filter.icon}
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown - Right Side */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-200 min-w-[160px] justify-between"
              >
                <span>Sort by</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-300 rounded-lg shadow-lg z-50">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSortChange(option)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors ${
                        sortOption === option ? 'bg-neutral-50 font-medium text-black' : 'text-neutral-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
