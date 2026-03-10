'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, User, Mail, Lock, Briefcase, Star, Phone, Chrome } from 'lucide-react'

// Google SVG icon component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    countryCode: '+91',
    fullName: '',
    role: 'user' as 'user' | 'expert' | 'astrologer',
    specialization: '' as 'astrologer' | 'counsellor' | 'yoga_trainer' | 'meditation_expert' | ''
  })
  const [error, setError] = useState('')
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()

  const countries = [
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+1', name: 'USA', flag: '🇺🇸' },
    { code: '+44', name: 'UK', flag: '🇬🇧' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+39', name: 'Italy', flag: '🇮🇹' },
    { code: '+7', name: 'Russia', flag: '🇷🇺' },
    { code: '+82', name: 'South Korea', flag: '🇰🇷' },
    { code: '+65', name: 'Singapore', flag: '🇸🇬' },
    { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
    { code: '+66', name: 'Thailand', flag: '🇹🇭' },
    { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
    { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
    { code: '+63', name: 'Philippines', flag: '🇵🇭' },
    { code: '+971', name: 'UAE', flag: '🇦🇪' },
    { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+20', name: 'Egypt', flag: '🇪🇬' },
  ]

  useEffect(() => {
    if (!loading && user) {
      // Redirect immediately when user is authenticated
      // Profile loading will happen on the dashboard page
      if (profile) {
        // If profile is already loaded, use role-based redirect
        if (profile.role === "expert" || profile.role === "astrologer") {
          if (profile.status === "pending") {
            router.replace("/account-under-review")
          } else if (profile.status === "approved") {
            router.replace("/expert-dashboard")
          }
        } else {
          router.replace("/dashboard")
        }
      } else {
        // If profile isn't loaded yet, redirect to dashboard and let it handle profile loading
        router.replace("/dashboard")
      }
    }
  }, [loading, user, profile, router])

  const specializations = [
    { value: 'astrologer', label: 'Astrologer', icon: '🔮' },
    { value: 'counsellor', label: 'Counsellor', icon: '🧠' },
    { value: 'yoga_trainer', label: 'Yoga Trainer', icon: '🧘' },
    { value: 'meditation_expert', label: 'Meditation Expert', icon: '🕉️' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (error) {
        console.error('Google sign-in error:', error)
        throw error
      }
      
      // Redirect will happen automatically
    } catch (error: any) {
      console.error('Google sign-in caught error:', error)
      setError('Failed to sign in with Google. Please try again.')
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')

    // Mobile debugging
    console.log('Login attempt from mobile:', {
      userAgent: navigator.userAgent,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      email: formData.email
    })

    try {
      if (isLogin) {
        // Login with email only
        const authResult = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        console.log('Login response:', { data: authResult.data, error: authResult.error })

        if (authResult.error) {
          console.error('Login error details:', authResult.error)
          throw authResult.error
        }
        // Redirect will happen via useEffect
      } else {
        // Signup
        if (!formData.fullName.trim()) {
          setError('Full name is required')
          setFormLoading(false)
          return
        }

        if (!formData.phoneNumber.trim()) {
          setError('Phone number is required')
          setFormLoading(false)
          return
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setFormLoading(false)
          return
        }

        if (formData.role === 'expert' && !formData.specialization) {
          setError('Please select a specialization for expert role')
          setFormLoading(false)
          return
        }

        const metadata = {
          full_name: formData.fullName,
          role: formData.role,
          specialization: formData.role === 'expert' ? formData.specialization : null
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: metadata
          }
        })

        if (error) {
          console.error("Signup error:", error)
          throw error
        }

        if (data.user) {
          // Create user profile
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              full_name: formData.fullName,
              phone_number: `${formData.countryCode}${formData.phoneNumber}`,
              role: formData.role,
              specialization: (formData.role === 'expert' || formData.role === 'astrologer') ? formData.specialization : null,
              status: (formData.role === 'expert' || formData.role === 'astrologer') ? 'pending' : 'approved',
            })

          if (profileError) {
            console.error("Profile insert failed:", profileError)
            
            // Provide more detailed error information
            let errorMessage = "Failed to create profile. "
            if (profileError.code === 'PGRST116') {
              errorMessage += "The profiles table might not exist. Please contact support."
            } else if (profileError.code === '42501') {
              errorMessage += "Permission denied. Please check database permissions."
            } else if (profileError.message?.includes('column "phone_number" does not exist')) {
              errorMessage += "Phone number field not available. Using email signup."
            } else if (profileError.message) {
              errorMessage += `Error: ${profileError.message}`
            } else {
              errorMessage += "Unknown database error. Please try again."
            }
            
            setError(errorMessage)
            setFormLoading(false)
            return
          }

          console.log("Profile created successfully")

          // Create expert entry in correct table based on specialization
          if (formData.role === 'expert' || formData.role === 'astrologer') {
            let tableName = 'expert_astrologers' // default fallback
            let roleLabel = 'Expert'
            
            // Determine correct table based on role and specialization
            if (formData.role === 'expert') {
              // For expert role, check specialization to determine table
              if (formData.specialization === 'meditation_expert') {
                tableName = 'expert_meditation'
                roleLabel = 'Meditation Expert'
              } else if (formData.specialization === 'counsellor') {
                tableName = 'expert_counsellors'
                roleLabel = 'Counsellor'
              } else if (formData.specialization === 'yoga_trainer') {
                tableName = 'expert_yoga'
                roleLabel = 'Yoga Trainer'
              } else {
                // Default for expert role
                tableName = 'expert_meditation'
                roleLabel = 'Meditation Expert'
              }
            } else if (formData.role === 'astrologer') {
              tableName = 'expert_astrologers'
              roleLabel = 'Astrologer'
            }
            
            console.log(`Creating ${roleLabel} profile in ${tableName} table (role: ${formData.role}, specialization: ${formData.specialization})`)
            
            const { error: expertError } = await supabase
              .from(tableName)
              .insert({
                id: data.user.id,
                display_name: formData.fullName,
                bio: '',
                experience_years: 0,
                price_per_minute: 299,
                specialties: [],
                avatar_url: '',
                is_profile_complete: false
              })

            if (expertError) {
              console.error(`${roleLabel} profile insert failed:`, expertError)
              // Don't fail the signup, just log the error
            } else {
              console.log(`${roleLabel} profile created successfully in ${tableName} table`)
            }
          }

          // Redirect based on role
          if (formData.role === "expert" || formData.role === "astrologer") {
            router.replace("/account-under-review")
          } else {
            router.replace("/dashboard")
          }
        }
      }
    } catch (error: any) {
      console.error('Login error caught:', error)
      
      // Mobile-specific error handling
      let errorMessage = 'Something went wrong'
      
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.'
      } else if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.'
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-[#0F0F14] px-4 pt-20">
      <div className="w-full max-w-md mt-8">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-serif text-white mb-2"></h1>
          <p className="text-white/60">
            {isLogin ? 'Welcome back' : 'Join our wellness community'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1C1C24] rounded-2xl p-8 shadow-2xl shadow-black/50">
          {/* Toggle */}
          <div className="flex bg-white/5 rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                isLogin
                  ? 'bg-[#fbcc1e] text-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                !isLogin
                  ? 'bg-[#fbcc1e] text-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Social Login Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            <GoogleIcon />
            <span className="font-medium">
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </span>
          </button>

          {/* Divider Text */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1C1C24] text-white/60">Or continue with</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gradient-to-r from-[#2a2a3e] to-[#1f1f2e] border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-[#fbcc1e] focus:outline-none focus:ring-2 focus:ring-[#fbcc1e]/20 transition-all duration-300 shadow-lg"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            {isLogin && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gradient-to-r from-[#2a2a3e] to-[#1f1f2e] border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-[#fbcc1e] focus:outline-none focus:ring-2 focus:ring-[#fbcc1e]/20 transition-all duration-300 shadow-lg"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email (Signup always) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gradient-to-r from-[#2a2a3e] to-[#1f1f2e] border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-[#fbcc1e] focus:outline-none focus:ring-2 focus:ring-[#fbcc1e]/20 transition-all duration-300 shadow-lg"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3.5 bg-gradient-to-r from-[#2a2a3e] to-[#1f1f2e] border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-[#fbcc1e] focus:outline-none focus:ring-2 focus:ring-[#fbcc1e]/20 transition-all duration-300 shadow-lg"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-3.5 bg-gradient-to-r from-[#2a2a3e] to-[#1f1f2e] border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-[#fbcc1e] focus:outline-none focus:ring-2 focus:ring-[#fbcc1e]/20 transition-all duration-300 shadow-lg"
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* Phone Number (Signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  {/* Country Code Dropdown */}
                  <div className="relative w-20">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      className="appearance-none bg-gradient-to-r from-[#2a2a3e] to-[#1f1f2e] border border-[#fbcc1e]/20 rounded-xl text-white pl-4 pr-6 py-3.5 focus:border-[#fbcc1e] focus:outline-none focus:ring-2 focus:ring-[#fbcc1e]/20 transition-all duration-300 cursor-pointer hover:border-[#fbcc1e]/40 shadow-lg w-full text-sm"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code} className="bg-[#1C1C24] text-white">
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Phone Number Input */}
                  <div className="relative flex-1">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gradient-to-r from-[#2a2a3e] to-[#1f1f2e] border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-[#fbcc1e] focus:outline-none focus:ring-2 focus:ring-[#fbcc1e]/20 transition-all duration-300 shadow-lg"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Role Selection (Signup only) */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#fbcc1e]" />
                    I want to join as
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'user', specialization: '' }))}
                      className={`p-4 rounded-xl border transition-all duration-300 transform hover:scale-105 ${
                        formData.role === 'user'
                          ? 'border-[#fbcc1e] bg-gradient-to-r from-[#fbcc1e]/10 to-[#e6b800]/10 text-[#fbcc1e] shadow-lg shadow-[#fbcc1e]/20'
                          : 'border-white/10 bg-gradient-to-r from-white/5 to-white/10 text-white/60 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <User className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-semibold">User</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'expert' }))}
                      className={`p-4 rounded-xl border transition-all duration-300 transform hover:scale-105 ${
                        formData.role === 'expert'
                          ? 'border-[#fbcc1e] bg-gradient-to-r from-[#fbcc1e]/10 to-[#e6b800]/10 text-[#fbcc1e] shadow-lg shadow-[#fbcc1e]/20'
                          : 'border-white/10 bg-gradient-to-r from-white/5 to-white/10 text-white/60 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <Briefcase className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-semibold">Expert</span>
                    </button>
                  </div>
                </div>

                {/* Specialization (Expert only) */}
                {formData.role === 'expert' && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#fbcc1e]" />
                      Choose your specialization
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {specializations.map((spec) => (
                        <button
                          key={spec.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, specialization: spec.value as any }))}
                          className={`p-3 rounded-xl border transition-all duration-300 transform hover:scale-105 ${
                            formData.specialization === spec.value
                              ? 'border-[#fbcc1e] bg-gradient-to-r from-[#fbcc1e]/10 to-[#e6b800]/10 text-[#fbcc1e] shadow-lg shadow-[#fbcc1e]/20'
                              : 'border-white/10 bg-gradient-to-r from-white/5 to-white/10 text-white/60 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          <div className="text-2xl mb-1">{spec.icon}</div>
                          <span className="text-xs font-semibold">{spec.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-gradient-to-r from-[#fbcc1e] to-[#e6b800] text-black py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#fbcc1e]/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
