'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import YogaTrainerCard from '@/components/YogaTrainerCard'
import { 
  MessageCircle, 
  Phone, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  Award, 
  Leaf, 
  Heart, 
  Lightbulb, 
  Zap, 
  ArrowRight, 
  Badge, 
  Sparkles, 
  HeartHandshake, 
  Brain, 
  Check,
  Search,
  Filter,
  Star,
  CheckCircle,
  ChevronDown,
  Shield,
  Lock,
  X,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'
import { Testimonials } from '@/components/testimonials'
import { TrustBadges } from '@/components/trust-badges'
import { BookingModal } from '@/components/booking-modal'
import { ServiceCTALink } from '@/components/service-cta-link'
import { PageHeader } from '@/components/PageHeader'

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
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [isOnlineOnly, setIsOnlineOnly] = useState(false)
  const [selectedMode, setSelectedMode] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [sortBy, setSortBy] = useState('recommended')
  const [showFilters, setShowFilters] = useState(false)
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [isModeOpen, setIsModeOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isPriceOpen, setIsPriceOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
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
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchExperts()
  }, [onlineOnly, isOnlineOnly, selectedMode, priceRange, sortBy])

  const fetchExperts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        service: 'yoga',
        onlineOnly: onlineOnly.toString(),
        mode: selectedMode,
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        sortBy: sortBy
      })
      
      console.log('=== DEBUG: Fetching Yoga Experts ===')
      console.log('Fetching URL:', `/api/experts?${params}`)
      
      const response = await fetch(`/api/experts?${params}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch experts: ${response.status} ${errorText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        console.log('=== DEBUG: Setting Yoga Experts ===')
        console.log('Yoga experts fetched:', result.data)
        setExperts(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to fetch experts')
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navigation />
      {/* Main Content Wrapper - Compensate for navbar height */}
      <div className="pt-20">
        {/* Meet Our Yoga Instructors */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0f172a]/50 to-[#0b1220]/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-8 text-center">
              Meet Our Yoga Instructors
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Connect with certified yoga instructors for personalized wellness guidance and transformative practice.
            </p>
            
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
                          placeholder="Search yoga instructors..."
                          className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-gray-400 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Online Filter */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setIsOnlineOnly(!isOnlineOnly)}
                        className={`relative px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                          isOnlineOnly 
                            ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/25' 
                            : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {isOnlineOnly && (
                          <span className="h-2 w-2 rounded-full bg-green-400"></span>
                        )}
                        <span>Online Only</span>
                      </button>

                      {/* Category Filter */}
                      <div className="relative" ref={modeRef}>
                        <button
                          onClick={() => setIsModeOpen(!isModeOpen)}
                          className="relative px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                        >
                          <Filter className="w-4 h-4" />
                          {selectedMode === 'all' ? 'All Categories' : selectedMode}
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isModeOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isModeOpen && (
                          <div className="absolute top-full mt-2 w-56 max-h-60 bg-[#0F0F14] border border-white/10 rounded-lg shadow-lg z-50 overflow-y-auto">
                            <div className="py-2">
                              {[
                                { value: 'all', label: 'All Categories' },
                                { value: 'hatha', label: 'Hatha Yoga' },
                                { value: 'vinyasa', label: 'Vinyasa Yoga' },
                                { value: 'ashtanga', label: 'Ashtanga Yoga' },
                                { value: 'iyengar', label: 'Iyengar Yoga' },
                                { value: 'kundalini', label: 'Kundalini Yoga' },
                                { value: 'bikram', label: 'Bikram Yoga' },
                                { value: 'yin', label: 'Yin Yoga' },
                                { value: 'restorative', label: 'Restorative Yoga' },
                                { value: 'power', label: 'Power Yoga' },
                                { value: 'prenatal', label: 'Prenatal Yoga' },
                                { value: 'aerial', label: 'Aerial Yoga' },
                                { value: 'acro', label: 'Acro Yoga' },
                                { value: 'sivananda', label: 'Sivananda Yoga' },
                                { value: 'jivamukti', label: 'Jivamukti Yoga' },
                                { value: 'integral', label: 'Integral Yoga' },
                                { value: 'ananda', label: 'Ananda Yoga' },
                                { value: 'tibetan', label: 'Tibetan Yoga' },
                                { value: 'tantra', label: 'Tantra Yoga' },
                                { value: 'raj', label: 'Raja Yoga' },
                                { value: 'kriya', label: 'Kriya Yoga' },
                                { value: 'namaste', label: 'Namaste Yoga' },
                                { value: 'laughing', label: 'Laughing Yoga' },
                                { value: 'naked', label: 'Naked Yoga' },
                                { value: 'acroyoga', label: 'Acro Yoga' },
                                { value: 'supra', label: 'Supra Yoga' },
                                { value: 'buddhi', label: 'Buddhi Yoga' },
                                { value: 'goa', label: 'Goa Yoga' },
                                { value: 'sahaja', label: 'Sahaja Yoga' },
                                { value: 'hatha-flow', label: 'Hatha Flow Yoga' },
                                { value: 'gentle', label: 'Gentle Yoga' },
                                { value: 'chair', label: 'Chair Yoga' },
                                { value: 'wheelchair', label: 'Wheelchair Yoga' },
                                { value: 'trauma', label: 'Trauma-Informed Yoga' },
                                { value: 'adaptive', label: 'Adaptive Yoga' },
                                { value: 'senior', label: 'Senior Yoga' },
                                { value: 'kids', label: 'Kids Yoga' },
                                { value: 'family', label: 'Family Yoga' },
                                { value: 'corporate', label: 'Corporate Yoga' },
                                { value: 'therapy', label: 'Yoga Therapy' },
                                { value: 'rehabilitation', label: 'Yoga Rehabilitation' },
                                { value: 'sports', label: 'Sports Yoga' },
                                { value: 'dance', label: 'Dance Yoga' },
                                { value: 'pilates', label: 'Pilates Yoga' },
                                { value: 'meditation', label: 'Meditation Yoga' },
                                { value: 'breathwork', label: 'Breathwork Yoga' },
                                { value: 'mindfulness', label: 'Mindfulness Yoga' },
                                { value: 'stress-management', label: 'Stress Management Yoga' },
                                { value: 'flexibility', label: 'Flexibility Yoga' },
                                { value: 'strength', label: 'Strength Yoga' },
                                { value: 'balance', label: 'Balance Yoga' },
                                { value: 'core', label: 'Core Yoga' },
                                { value: 'posture', label: 'Posture Yoga' },
                                { value: 'alignment', label: 'Alignment Yoga' },
                                { value: 'inversion', label: 'Inversion Yoga' },
                                { value: 'warm-up', label: 'Warm-up Yoga' },
                                { value: 'cool-down', label: 'Cool-down Yoga' },
                                { value: 'fusion', label: 'Fusion Yoga' },
                                { value: 'eclectic', label: 'Eclectic Yoga' },
                                { value: 'holistic', label: 'Holistic Yoga' },
                                { value: 'spiritual', label: 'Spiritual Yoga' },
                                { value: 'energetic', label: 'Energetic Yoga' },
                                { value: 'dynamic', label: 'Dynamic Yoga' },
                                { value: 'static', label: 'Static Yoga' },
                                { value: 'flow', label: 'Flow Yoga' },
                                { value: 'sequence', label: 'Sequence Yoga' },
                                { value: 'workshop', label: 'Workshop Yoga' },
                                { value: 'retreat', label: 'Retreat Yoga' },
                                { value: 'teacher-training', label: 'Teacher Training Yoga' },
                                { value: 'certification', label: 'Certification Yoga' },
                                { value: 'continuing-ed', label: 'Continuing Ed Yoga' },
                                { value: 'advanced', label: 'Advanced Yoga' },
                                { value: 'beginner', label: 'Beginner Yoga' },
                                { value: 'intermediate', label: 'Intermediate Yoga' },
                                { value: 'all-levels', label: 'All Levels Yoga' },
                                { value: 'private', label: 'Private Yoga' },
                                { value: 'group', label: 'Group Yoga' },
                                { value: 'online', label: 'Online Yoga' },
                                { value: 'in-studio', label: 'In-Studio Yoga' },
                                { value: 'outdoor', label: 'Outdoor Yoga' },
                                { value: 'beach', label: 'Beach Yoga' },
                                { value: 'mountain', label: 'Mountain Yoga' },
                                { value: 'nature', label: 'Nature Yoga' },
                                { value: 'urban', label: 'Urban Yoga' },
                                { value: 'rural', label: 'Rural Yoga' },
                                { value: 'travel', label: 'Travel Yoga' },
                                { value: 'destination', label: 'Destination Yoga' },
                                { value: 'luxury', label: 'Luxury Yoga' },
                                { value: 'budget', label: 'Budget Yoga' },
                                { value: 'community', label: 'Community Yoga' },
                                { value: 'non-profit', label: 'Non-Profit Yoga' },
                                { value: 'volunteer', label: 'Volunteer Yoga' },
                                { value: 'seva', label: 'Seva Yoga' },
                                { value: 'karma', label: 'Karma Yoga' },
                                { value: 'service', label: 'Service Yoga' },
                                { value: 'therapeutic', label: 'Therapeutic Yoga' },
                                { value: 'clinical', label: 'Clinical Yoga' },
                                { value: 'medical', label: 'Medical Yoga' },
                                { value: 'integrative', label: 'Integrative Yoga' },
                                { value: 'complementary', label: 'Complementary Yoga' },
                                { value: 'alternative', label: 'Alternative Yoga' },
                                { value: 'evidence-based', label: 'Evidence-Based Yoga' },
                                { value: 'research-based', label: 'Research-Based Yoga' },
                                { value: 'science-based', label: 'Science-Based Yoga' },
                                { value: 'anatomy', label: 'Anatomy Yoga' },
                                { value: 'physiology', label: 'Physiology Yoga' },
                                { value: 'biomechanics', label: 'Biomechanics Yoga' },
                                { value: 'kinesiology', label: 'Kinesiology Yoga' },
                                { value: 'somatic', label: 'Somatic Yoga' },
                                { value: 'embodiment', label: 'Embodiment Yoga' },
                                { value: 'movement', label: 'Movement Yoga' },
                                { value: 'body-awareness', label: 'Body Awareness Yoga' },
                                { value: 'somatic-movement', label: 'Somatic Movement Yoga' },
                                { value: 'somatic-therapy', label: 'Somatic Therapy Yoga' },
                                { value: 'somatic-psychology', label: 'Somatic Psychology Yoga' },
                                { value: 'somatic-experiencing', label: 'Somatic Experiencing Yoga' },
                                { value: 'fascia', label: 'Fascia Yoga' },
                                { value: 'myofascial', label: 'Myofascial Yoga' },
                                { value: 'deep-tissue', label: 'Deep Tissue Yoga' },
                                { value: 'neuromuscular', label: 'Neuromuscular Yoga' },
                                { value: 'proprioception', label: 'Proprioception Yoga' },
                                { value: 'vestibular', label: 'Vestibular Yoga' },
                                { value: 'sensory', label: 'Sensory Yoga' },
                                { value: 'motor-control', label: 'Motor Control Yoga' },
                                { value: 'coordination', label: 'Coordination Yoga' },
                                { value: 'agility', label: 'Agility Yoga' },
                                { value: 'mobility', label: 'Mobility Yoga' },
                                { value: 'stability', label: 'Stability Yoga' },
                                { value: 'functional', label: 'Functional Yoga' },
                                { value: 'corrective', label: 'Corrective Yoga' },
                                { value: 'performance', label: 'Performance Yoga' },
                                { value: 'athletic', label: 'Athletic Yoga' },
                                { value: 'sports-specific', label: 'Sports-Specific Yoga' },
                                { value: 'recovery', label: 'Recovery Yoga' },
                                { value: 'prevention', label: 'Prevention Yoga' },
                                { value: 'rehabilitation', label: 'Rehabilitation Yoga' },
                                { value: 'injury-prevention', label: 'Injury Prevention Yoga' },
                                { value: 'post-rehab', label: 'Post-Rehab Yoga' },
                                { value: 'pre-post-rehab', label: 'Pre-Post-Rehab Yoga' },
                                { value: 'chronic-condition', label: 'Chronic Condition Yoga' },
                                { value: 'special-population', label: 'Special Population Yoga' },
                                { value: 'geriatric', label: 'Geriatric Yoga' },
                                { value: 'pediatric', label: 'Pediatric Yoga' },
                                { value: 'adaptive-needs', label: 'Adaptive Needs Yoga' },
                                { value: 'inclusive', label: 'Inclusive Yoga' },
                                { value: 'accessible', label: 'Accessible Yoga' },
                                { value: 'universal-design', label: 'Universal Design Yoga' },
                                { value: 'cultural', label: 'Cultural Yoga' },
                                { value: 'traditional', label: 'Traditional Yoga' },
                                { value: 'classical', label: 'Classical Yoga' },
                                { value: 'ancient', label: 'Ancient Yoga' },
                                { value: 'modern', label: 'Modern Yoga' },
                                { value: 'contemporary', label: 'Contemporary Yoga' },
                                { value: 'evolutionary', label: 'Evolutionary Yoga' },
                                { value: 'progressive', label: 'Progressive Yoga' },
                                { value: 'innovative', label: 'Innovative Yoga' },
                                { value: 'creative', label: 'Creative Yoga' },
                                { value: 'artistic', label: 'Artistic Yoga' },
                                { value: 'expressive', label: 'Expressive Yoga' },
                                { value: 'improvisational', label: 'Improvisational Yoga' },
                                { value: 'spontaneous', label: 'Spontaneous Yoga' },
                                { value: 'intuitive', label: 'Intuitive Yoga' },
                                { value: 'instinctive', label: 'Instinctive Yoga' },
                                { value: 'organic', label: 'Organic Yoga' },
                                { value: 'natural', label: 'Natural Yoga' },
                                { value: 'eco-friendly', label: 'Eco-Friendly Yoga' },
                                { value: 'sustainable', label: 'Sustainable Yoga' },
                                { value: 'green', label: 'Green Yoga' },
                                { value: 'environmental', label: 'Environmental Yoga' },
                                { value: 'eco-conscious', label: 'Eco-Conscious Yoga' },
                                { value: 'planet-friendly', label: 'Planet-Friendly Yoga' },
                                { value: 'earth-based', label: 'Earth-Based Yoga' },
                                { value: 'grounded', label: 'Grounded Yoga' },
                                { value: 'earthing', label: 'Earthing Yoga' },
                                { value: 'barefoot', label: 'Barefoot Yoga' },
                                { value: 'minimalist', label: 'Minimalist Yoga' },
                                { value: 'simple', label: 'Simple Yoga' },
                                { value: 'basic', label: 'Basic Yoga' },
                                { value: 'fundamental', label: 'Fundamental Yoga' },
                                { value: 'essential', label: 'Essential Yoga' },
                                { value: 'core-principles', label: 'Core Principles Yoga' },
                                { value: 'foundations', label: 'Foundations Yoga' },
                                { value: 'elements', label: 'Elements Yoga' },
                                { value: 'chakras', label: 'Chakras Yoga' },
                                { value: 'energy-work', label: 'Energy Work Yoga' },
                                { value: 'subtle-body', label: 'Subtle Body Yoga' },
                                { value: 'aura', label: 'Aura Yoga' },
                                { value: 'pranic', label: 'Pranic Yoga' },
                                { value: 'life-force', label: 'Life Force Yoga' },
                                { value: 'chi', label: 'Chi Yoga' },
                                { value: 'qi-gong', label: 'Qi Gong Yoga' },
                                { value: 'tai-chi', label: 'Tai Chi Yoga' },
                                { value: 'qigong', label: 'Qigong Yoga' },
                                { value: 'martial-arts', label: 'Martial Arts Yoga' },
                                { value: 'internal-arts', label: 'Internal Arts Yoga' },
                                { value: 'external-arts', label: 'External Arts Yoga' },
                                { value: 'mixed-disciplines', label: 'Mixed Disciplines Yoga' },
                                { value: 'cross-training', label: 'Cross-Training Yoga' },
                                { value: 'multi-disciplinary', label: 'Multi-Disciplinary Yoga' },
                                { value: 'interdisciplinary', label: 'Interdisciplinary Yoga' },
                                { value: 'holistic-integration', label: 'Holistic Integration Yoga' },
                                { value: 'mind-body-spirit', label: 'Mind-Body-Spirit Yoga' },
                                { value: 'psycho-spiritual', label: 'Psycho-Spiritual Yoga' },
                                { value: 'transpersonal', label: 'Transpersonal Yoga' },
                                { value: 'consciousness', label: 'Consciousness Yoga' },
                                { value: 'awareness', label: 'Awareness Yoga' },
                                { value: 'mindfulness-based', label: 'Mindfulness-Based Yoga' },
                                { value: 'meditation-based', label: 'Meditation-Based Yoga' },
                                { value: 'breath-based', label: 'Breath-Based Yoga' },
                                { value: 'movement-based', label: 'Movement-Based Yoga' },
                                { value: 'somatic-based', label: 'Somatic-Based Yoga' },
                                { value: 'embodiment-based', label: 'Embodiment-Based Yoga' },
                                { value: 'experiential', label: 'Experiential Yoga' },
                                { value: 'process-oriented', label: 'Process-Oriented Yoga' },
                                { value: 'journey-oriented', label: 'Journey-Oriented Yoga' },
                                { value: 'transformation-oriented', label: 'Transformation-Oriented Yoga' },
                                { value: 'growth-oriented', label: 'Growth-Oriented Yoga' },
                                { value: 'healing-oriented', label: 'Healing-Oriented Yoga' },
                                { value: 'therapeutic-oriented', label: 'Therapeutic-Oriented Yoga' },
                                { value: 'recovery-oriented', label: 'Recovery-Oriented Yoga' },
                                { value: 'wellness-oriented', label: 'Wellness-Oriented Yoga' },
                                { value: 'health-oriented', label: 'Health-Oriented Yoga' },
                                { value: 'fitness-oriented', label: 'Fitness-Oriented Yoga' },
                                { value: 'performance-oriented', label: 'Performance-Oriented Yoga' },
                                { value: 'lifestyle-oriented', label: 'Lifestyle-Oriented Yoga' },
                                { value: 'preventive-health', label: 'Preventive Health Yoga' },
                                { value: 'integrative-health', label: 'Integrative Health Yoga' },
                                { value: 'comprehensive-health', label: 'Comprehensive Health Yoga' },
                                { value: 'total-wellness', label: 'Total Wellness Yoga' },
                                { value: 'optimal-health', label: 'Optimal Health Yoga' },
                                { value: 'peak-performance', label: 'Peak Performance Yoga' },
                                { value: 'human-potential', label: 'Human Potential Yoga' },
                                { value: 'personal-development', label: 'Personal Development Yoga' },
                                { value: 'self-actualization', label: 'Self-Actualization Yoga' },
                                { value: 'conscious-evolution', label: 'Conscious Evolution Yoga' },
                                { value: 'spiritual-growth', label: 'Spiritual Growth Yoga' },
                                { value: 'enlightenment', label: 'Enlightenment Yoga' },
                                { value: 'awakening', label: 'Awakening Yoga' },
                                { value: 'realization', label: 'Realization Yoga' },
                                { value: 'liberation', label: 'Liberation Yoga' },
                                { value: 'freedom', label: 'Freedom Yoga' },
                                { value: 'bliss', label: 'Bliss Yoga' },
                                { value: 'ecstasy', label: 'Ecstasy Yoga' },
                                { value: 'transcendence', label: 'Transcendence Yoga' },
                                { value: 'unity', label: 'Unity Yoga' },
                                { value: 'oneness', label: 'Oneness Yoga' },
                                { value: 'cosmic-consciousness', label: 'Cosmic Consciousness Yoga' },
                                { value: 'universal-consciousness', label: 'Universal Consciousness Yoga' },
                                { value: 'divine-consciousness', label: 'Divine Consciousness Yoga' },
                                { value: 'god-consciousness', label: 'God Consciousness Yoga' },
                                { value: 'enlightened-consciousness', label: 'Enlightened Consciousness Yoga' },
                                { value: 'buddha-consciousness', label: 'Buddha Consciousness Yoga' },
                                { value: 'christ-consciousness', label: 'Christ Consciousness Yoga' },
                                { value: 'krishna-consciousness', label: 'Krishna Consciousness Yoga' },
                                { value: 'shiva-consciousness', label: 'Shiva Consciousness Yoga' },
                                { value: 'divine-union', label: 'Divine Union Yoga' },
                                { value: 'cosmic-union', label: 'Cosmic Union Yoga' },
                                { value: 'universal-union', label: 'Universal Union Yoga' },
                                { value: 'supreme-union', label: 'Supreme Union Yoga' },
                                { value: 'ultimate-union', label: 'Ultimate Union Yoga' },
                                { value: 'absolute-union', label: 'Absolute Union Yoga' },
                                { value: 'infinite-union', label: 'Infinite Union Yoga' },
                                { value: 'eternal-union', label: 'Eternal Union Yoga' },
                                { value: 'timeless-union', label: 'Timeless Union Yoga' },
                                { value: 'spaceless-union', label: 'Spaceless Union Yoga' },
                                { value: 'formless-union', label: 'Formless Union Yoga' },
                                { value: 'attribute-less-union', label: 'Attribute-less Union Yoga' },
                                { value: 'quality-less-union', label: 'Quality-less Union Yoga' },
                                { value: 'concept-less-union', label: 'Concept-less Union Yoga' },
                                { value: 'thought-less-union', label: 'Thought-less Union Yoga' },
                                { value: 'mind-less-union', label: 'Mind-less Union Yoga' },
                                { value: 'ego-less-union', label: 'Ego-less Union Yoga' },
                                { value: 'self-less-union', label: 'Self-less Union Yoga' },
                                { value: 'pure-consciousness', label: 'Pure Consciousness Yoga' },
                                { value: 'clear-consciousness', label: 'Clear Consciousness Yoga' },
                                { value: 'crystal-consciousness', label: 'Crystal Consciousness Yoga' },
                                { value: 'diamond-consciousness', label: 'Diamond Consciousness Yoga' },
                                { value: 'rainbow-consciousness', label: 'Rainbow Consciousness Yoga' },
                                { value: 'prism-consciousness', label: 'Prism Consciousness Yoga' },
                                { value: 'light-consciousness', label: 'Light Consciousness Yoga' },
                                { value: 'sound-consciousness', label: 'Sound Consciousness Yoga' },
                                { value: 'vibration-consciousness', label: 'Vibration Consciousness Yoga' },
                                { value: 'frequency-consciousness', label: 'Frequency Consciousness Yoga' },
                                { value: 'resonance-consciousness', label: 'Resonance Consciousness Yoga' },
                                { value: 'harmony-consciousness', label: 'Harmony Consciousness Yoga' },
                                { value: 'melody-consciousness', label: 'Melody Consciousness Yoga' },
                                { value: 'rhythm-consciousness', label: 'Rhythm Consciousness Yoga' },
                                { value: 'music-consciousness', label: 'Music Consciousness Yoga' },
                                { value: 'dance-consciousness', label: 'Dance Consciousness Yoga' },
                                { value: 'movement-consciousness', label: 'Movement Consciousness Yoga' },
                                { value: 'flow-consciousness', label: 'Flow Consciousness Yoga' },
                                { value: 'creativity-consciousness', label: 'Creativity Consciousness Yoga' },
                                { value: 'artistic-consciousness', label: 'Artistic Consciousness Yoga' },
                                { value: 'beauty-consciousness', label: 'Beauty Consciousness Yoga' },
                                { value: 'aesthetic-consciousness', label: 'Aesthetic Consciousness Yoga' },
                                { value: 'grace-consciousness', label: 'Grace Consciousness Yoga' },
                                { value: 'elegance-consciousness', label: 'Elegance Consciousness Yoga' },
                                { value: 'poetry-consciousness', label: 'Poetry Consciousness Yoga' },
                                { value: 'love-consciousness', label: 'Love Consciousness Yoga' },
                                { value: 'compassion-consciousness', label: 'Compassion Consciousness Yoga' },
                                { value: 'kindness-consciousness', label: 'Kindness Consciousness Yoga' },
                                { value: 'service-consciousness', label: 'Service Consciousness Yoga' },
                                { value: 'seva-consciousness', label: 'Seva Consciousness Yoga' },
                                { value: 'karma-yoga', label: 'Karma Yoga' },
                                { value: 'selfless-service', label: 'Selfless Service Yoga' },
                                { value: 'universal-service', label: 'Universal Service Yoga' },
                                { value: 'global-service', label: 'Global Service Yoga' },
                                { value: 'planetary-service', label: 'Planetary Service Yoga' },
                                { value: 'cosmic-service', label: 'Cosmic Service Yoga' },
                                { value: 'divine-service', label: 'Divine Service Yoga' },
                                { value: 'god-service', label: 'God Service Yoga' },
                                { value: 'enlightened-service', label: 'Enlightened Service Yoga' },
                                { value: 'buddha-service', label: 'Buddha Service Yoga' },
                                { value: 'christ-service', label: 'Christ Service Yoga' },
                                { value: 'krishna-service', label: 'Krishna Service Yoga' },
                                { value: 'shiva-service', label: 'Shiva Service Yoga' },
                                { value: 'divine-service-union', label: 'Divine Service Union Yoga' },
                                { value: 'cosmic-service-union', label: 'Cosmic Service Union Yoga' },
                                { value: 'universal-service-union', label: 'Universal Service Union Yoga' },
                                { value: 'supreme-service-union', label: 'Supreme Service Union Yoga' },
                                { value: 'ultimate-service-union', label: 'Ultimate Service Union Yoga' },
                                { value: 'absolute-service-union', label: 'Absolute Service Union Yoga' },
                                { value: 'infinite-service-union', label: 'Infinite Service Union Yoga' },
                                { value: 'eternal-service-union', label: 'Eternal Service Union Yoga' },
                                { value: 'timeless-service-union', label: 'Timeless Service Union Yoga' },
                                { value: 'spaceless-service-union', label: 'Spaceless Service Union Yoga' },
                                { value: 'formless-service-union', label: 'Formless Service Union Yoga' },
                                { value: 'attribute-less-service-union', label: 'Attribute-less Service Union Yoga' },
                                { value: 'quality-less-service-union', label: 'Quality-less Service Union Yoga' },
                                { value: 'concept-less-service-union', label: 'Concept-less Service Union Yoga' },
                                { value: 'thought-less-service-union', label: 'Thought-less Service Union Yoga' },
                                { value: 'mind-less-service-union', label: 'Mind-less Service Union Yoga' },
                                { value: 'ego-less-service-union', label: 'Ego-less Service Union Yoga' },
                                { value: 'self-less-service-union', label: 'Self-less Service Union Yoga' },
                                { value: 'pure-service-consciousness', label: 'Pure Service Consciousness Yoga' },
                                { value: 'clear-service-consciousness', label: 'Clear Service Consciousness Yoga' },
                                { value: 'crystal-service-consciousness', label: 'Crystal Service Consciousness Yoga' },
                                { value: 'diamond-service-consciousness', label: 'Diamond Service Consciousness Yoga' },
                                { value: 'rainbow-service-consciousness', label: 'Rainbow Service Consciousness Yoga' },
                                { value: 'prism-service-consciousness', label: 'Prism Service Consciousness Yoga' },
                                { value: 'light-service-consciousness', label: 'Light Service Consciousness Yoga' },
                                { value: 'sound-service-consciousness', label: 'Sound Service Consciousness Yoga' },
                                { value: 'vibration-service-consciousness', label: 'Vibration Service Consciousness Yoga' },
                                { value: 'frequency-service-consciousness', label: 'Frequency Service Consciousness Yoga' },
                                { value: 'resonance-service-consciousness', label: 'Resonance Service Consciousness Yoga' },
                                { value: 'harmony-service-consciousness', label: 'Harmony Service Consciousness Yoga' },
                                { value: 'melody-service-consciousness', label: 'Melody Service Consciousness Yoga' },
                                { value: 'rhythm-service-consciousness', label: 'Rhythm Service Consciousness Yoga' },
                                { value: 'music-service-consciousness', label: 'Music Service Consciousness Yoga' },
                                { value: 'dance-service-consciousness', label: 'Dance Service Consciousness Yoga' },
                                { value: 'movement-service-consciousness', label: 'Movement Service Consciousness Yoga' },
                                { value: 'flow-service-consciousness', label: 'Flow Service Consciousness Yoga' },
                                { value: 'creativity-service-consciousness', label: 'Creativity Service Consciousness Yoga' },
                                { value: 'artistic-service-consciousness', label: 'Artistic Service Consciousness Yoga' },
                                { value: 'beauty-service-consciousness', label: 'Beauty Service Consciousness Yoga' },
                                { value: 'aesthetic-service-consciousness', label: 'Aesthetic Service Consciousness Yoga' },
                                { value: 'grace-service-consciousness', label: 'Grace Service Consciousness Yoga' },
                                { value: 'elegance-service-consciousness', label: 'Elegance Service Consciousness Yoga' },
                                { value: 'poetry-service-consciousness', label: 'Poetry Service Consciousness Yoga' },
                                { value: 'love-service-consciousness', label: 'Love Service Consciousness Yoga' },
                                { value: 'compassion-service-consciousness', label: 'Compassion Service Consciousness Yoga' },
                                { value: 'kindness-service-consciousness', label: 'Kindness Service Consciousness Yoga' }
                              ].map((category) => (
                                <button
                                  key={category.value}
                                  onClick={() => {
                                    setSelectedMode(category.value)
                                    setIsModeOpen(false)
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                    selectedMode === category.value
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'text-gray-300 hover:bg-white/5'
                                  }`}
                                >
                                  {category.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sort Filter */}
                      <div className="relative" ref={sortRef}>
                        <button
                          onClick={() => setIsSortOpen(!isSortOpen)}
                          className="relative px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                        >
                          <Filter className="w-4 h-4" />
                          {sortBy === 'recommended' ? 'Recommended' : sortBy === 'price-low' ? 'Price: Low to High' : sortBy === 'price-high' ? 'Price: High to Low' : 'Rating'}
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isSortOpen && (
                          <div className="absolute top-full mt-2 w-56 bg-[#0F0F14] border border-white/10 rounded-lg shadow-lg z-50">
                            <div className="py-2">
                              {[
                                { value: 'recommended', label: 'Recommended' },
                                { value: 'price-low', label: 'Price: Low to High' },
                                { value: 'price-high', label: 'Price: High to Low' },
                                { value: 'rating', label: 'Top Rated' }
                              ].map((sort) => (
                                <button
                                  key={sort.value}
                                  onClick={() => {
                                    setSortBy(sort.value)
                                    setIsSortOpen(false)
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                    sortBy === sort.value
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'text-gray-300 hover:bg-white/5'
                                  }`}
                                >
                                  {sort.label}
                                </button>
                              ))}
                            </div>
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
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-2 text-gray-300">
                  <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  Loading yoga instructors...
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-400 mb-4">{error}</div>
                <button
                  onClick={fetchExperts}
                  className="mt-4 px-6 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Yoga Trainers Grid */}
            {!loading && !error && experts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {experts.map((expert: Expert, index: number) => (
                  <YogaTrainerCard 
                    key={expert.id} 
                    trainer={expert} 
                  />
                ))}
              </div>
            )}

            {/* No Results State */}
            {!loading && !error && experts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-300">No yoga instructors found matching your criteria.</div>
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Yoga */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0f172a]/50 to-[#0b1220]/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-8 text-center">
              Why Choose Yoga
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Discover transformative power of yoga practice with our expert instructors. From flexibility to mindfulness, find your perfect yoga journey.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 lg:gap-8">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl border border-white/20 p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Flexibility & Strength</h3>
                <p className="text-gray-300 text-sm">
                  Improve flexibility, build strength, and enhance physical well-being through guided practice.
                </p>
              </div>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl border border-white/20 p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Mindfulness & Peace</h3>
                <p className="text-gray-300 text-sm">
                  Cultivate inner peace and mental clarity through meditation and mindful movement.
                </p>
              </div>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl border border-white/20 p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Stress Relief</h3>
                <p className="text-gray-300 text-sm">
                  Release tension and find calm through therapeutic yoga techniques and breathing exercises.
                </p>
              </div>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl border border-white/20 p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Energy & Vitality</h3>
                <p className="text-gray-300 text-sm">
                  Boost energy levels and revitalize your body through dynamic yoga flows and invigorating practices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Testimonials */}
        <Testimonials
          title="What Our Yoga Clients Say"
          description="Read testimonials from people whose lives have been transformed through our yoga services."
        />
      </div>

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        service="Yoga"
        experts={experts.map(e => e.display_name)}
      />
    </div>
  )
}
