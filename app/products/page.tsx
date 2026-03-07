'use client'

import React, { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Mail, Clock, Sparkles, Star, Package, Bell, ArrowRight, Check } from 'lucide-react'

export default function ProductsPage() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Set launch date to 30 days from now
    const launchDate = new Date()
    launchDate.setDate(launchDate.getDate() + 30)

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = launchDate.getTime() - now

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      } else {
        clearInterval(timer)
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setTimeout(() => setIsSubscribed(false), 3000)
    }
  }

  const features = [
    {
      icon: <Package className="w-6 h-6" />,
      title: "Curated Spiritual Products",
      description: "Hand-selected items from authentic sources"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Quality Assured",
      description: "Every product tested for authenticity and effectiveness"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Expert Recommendations",
      description: "Products approved by our team of spiritual experts"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Launch Notifications",
      description: "Be the first to know when we go live"
    }
  ]

  const categories = [
    { name: "Rudraksha & Malas", color: "from-orange-400 to-red-500" },
    { name: "Healing Crystals", color: "from-purple-400 to-pink-500" },
    { name: "Meditation Essentials", color: "from-blue-400 to-cyan-500" },
    { name: "Spiritual Books", color: "from-green-400 to-emerald-500" },
    { name: "Incense & Aromatherapy", color: "from-yellow-400 to-orange-500" },
    { name: "Yoga Accessories", color: "from-indigo-400 to-purple-500" }
  ]

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#fdce20]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-[#d8b4fe]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-[#fdce20]/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#fdce20]/20 backdrop-blur-sm border border-[#fdce20]/30 rounded-full mb-8">
              <Sparkles className="w-5 h-5 text-[#fdce20]" />
              <span className="text-[#d8b4fe] font-medium">Coming Soon</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              <span className="text-[#fdce20]">
                Spiritual Marketplace
              </span>
            </h1>
            
            
            
            {/* Countdown Timer */}
            <div className="mb-16">
              <h3 className="text-lg text-white/60 mb-6">Launching in</h3>
              <div className="grid grid-cols-4 gap-4 sm:gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="bg-[#fdce20]/20 backdrop-blur-sm border border-[#fdce20]/30 rounded-2xl p-4 sm:p-6">
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{countdown.days}</div>
                    <div className="text-sm text-[#d8b4fe]">Days</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-[#fdce20]/20 backdrop-blur-sm border border-[#fdce20]/30 rounded-2xl p-4 sm:p-6">
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{countdown.hours}</div>
                    <div className="text-sm text-[#d8b4fe]">Hours</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-[#fdce20]/20 backdrop-blur-sm border border-[#fdce20]/30 rounded-2xl p-4 sm:p-6">
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{countdown.minutes}</div>
                    <div className="text-sm text-[#d8b4fe]">Minutes</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-[#fdce20]/20 backdrop-blur-sm border border-[#fdce20]/30 rounded-2xl p-4 sm:p-6">
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{countdown.seconds}</div>
                    <div className="text-sm text-[#d8b4fe]">Seconds</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Email Signup */}
            <div className="max-w-md mx-auto" id="email-form">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#fdce20] focus:ring-2 focus:ring-[#fdce20]/20"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#fdce20] text-black font-semibold rounded-xl hover:bg-[#d8b4fe] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  {isSubscribed ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Subscribed!</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Notify Me</span>
                    </>
                  )}
                </button>
              </form>
              <p className="text-sm text-white/60 mt-3">Get notified when we launch. No spam, ever.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">What to Expect</h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              We're carefully curating the best spiritual products from around the world
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#fdce20]/20 rounded-xl flex items-center justify-center text-[#fdce20] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Categories Preview */}
      <div className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Product Categories</h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Explore our carefully selected spiritual and wellness products
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl group cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80`}></div>
                <div className="relative z-10 p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
                  <div className="flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
                    <span className="text-sm">Coming Soon</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Visual Product Showcase */}
      <div className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Featured Products</h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              A glimpse of what's coming to our spiritual marketplace
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Product Cards */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden group">
              <div className="h-48 bg-[#fdce20]/20 flex items-center justify-center">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Package className="w-12 h-12 text-[#fdce20]" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Rudraksha Malas</h3>
                <p className="text-white/60 text-sm mb-4">Authentic, energized rudraksha beads for meditation and spiritual protection</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#fdce20] font-semibold">Coming Soon</span>
                  <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden group">
              <div className="h-48 bg-[#d8b4fe]/20 flex items-center justify-center">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Star className="w-12 h-12 text-[#d8b4fe]" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Healing Crystals</h3>
                <p className="text-white/60 text-sm mb-4">Hand-selected crystals for energy healing, chakra balancing, and meditation</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#d8b4fe] font-semibold">Coming Soon</span>
                  <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden group">
              <div className="h-48 bg-[#fdce20]/20 flex items-center justify-center">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-[#fdce20]" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Meditation Essentials</h3>
                <p className="text-white/60 text-sm mb-4">Cushions, incense, and accessories for your daily meditation practice</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#fdce20] font-semibold">Coming Soon</span>
                  <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-[#fdce20]/20 backdrop-blur-sm border border-[#fdce20]/30 rounded-3xl p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Be the First to Know
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join our waitlist and get exclusive early access to our launch collection
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => document.getElementById('email-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-[#fdce20] text-black font-semibold rounded-xl hover:bg-[#d8b4fe] transition-all duration-300 transform hover:scale-105"
              >
                Get Early Access
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
