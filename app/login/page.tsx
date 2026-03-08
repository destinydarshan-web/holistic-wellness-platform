'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, User, Mail, Lock, Briefcase, Star, Phone } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    fullName: '',
    role: 'user' as 'user' | 'expert' | 'astrologer',
    specialization: '' as 'astrologer' | 'counsellor' | 'yoga_trainer' | 'meditation_expert' | ''
  })
  const [error, setError] = useState('')
  const router = useRouter()
  const { user, profile, loading } = useAuth()

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
        // Login
        console.log('Attempting login...')
        let authResult: any
        
        if (loginMethod === 'email') {
          authResult = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
          })
        } else if (loginMethod === 'phone') {
          // For phone login, we need to use signInWithPassword with email
          // Supabase requires email for password-based auth, so we'll need to handle this differently
          // For now, we'll search for user by phone and get their email
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('phone_number', formData.phoneNumber)
            .maybeSingle()
          
          if (profileData) {
            setError('Phone login not yet available. Please use email address.')
            setFormLoading(false)
            return
          } else {
            setError('Phone number not found. Please check your number or sign up.')
            setFormLoading(false)
            return
          }
        }

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
          phone_number: formData.phoneNumber,
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
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              full_name: formData.fullName,
              role: formData.role,
              specialization: (formData.role === 'expert' || formData.role === 'astrologer') ? formData.specialization : null,
              status: (formData.role === 'expert' || formData.role === 'astrologer') ? 'pending' : 'approved',
            })

          if (profileError) {
            console.error("Profile insert failed:", profileError)
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
        if (loginMethod === 'phone') {
          errorMessage = 'Invalid phone number or password. Please try again.'
        } else {
          errorMessage = 'Invalid email or password. Please try again.'
        }
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
          <h1 className="text-3xl font-bold font-serif text-white mb-2">Destiny Darshan</h1>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#fbcc1e] focus:outline-none transition-colors"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            {isLogin && loginMethod === 'email' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#fbcc1e] focus:outline-none transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
            )}

            {/* Phone Number (Login) */}
            {isLogin && loginMethod === 'phone' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#fbcc1e] focus:outline-none transition-colors"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
            )}

            {/* Login Method Toggle (Login only) */}
            {isLogin && (
              <div className="flex gap-2 justify-center mb-4 w-full">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    loginMethod === 'email'
                      ? 'bg-gradient-to-r from-[#fbcc1e] to-[#e6b800] text-black shadow-lg shadow-[#fbcc1e]/25'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/20'
                  }`}
                >
                  <Mail className={`w-4 h-4 ${loginMethod === 'email' ? 'text-black' : 'text-white/70'}`} />
                  <span className="text-sm">Email Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    loginMethod === 'phone'
                      ? 'bg-gradient-to-r from-[#fbcc1e] to-[#e6b800] text-black shadow-lg shadow-[#fbcc1e]/25'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/20'
                  }`}
                >
                  <Phone className={`w-4 h-4 ${loginMethod === 'phone' ? 'text-black' : 'text-white/70'}`} />
                  <span className="text-sm">Phone Login</span>
                </button>
              </div>
            )}

            {/* Email (Signup always) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#fbcc1e] focus:outline-none transition-colors"
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#fbcc1e] focus:outline-none transition-colors"
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
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#fbcc1e] focus:outline-none transition-colors"
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
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-[#fbcc1e] focus:outline-none transition-colors"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
            )}

            {/* Role Selection (Signup only) */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    I want to join as
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'user', specialization: '' }))}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        formData.role === 'user'
                          ? 'border-[#fbcc1e] bg-[#fbcc1e]/10 text-[#fbcc1e]'
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                      }`}
                    >
                      <User className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">User</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: 'expert' }))}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        formData.role === 'expert'
                          ? 'border-[#fbcc1e] bg-[#fbcc1e]/10 text-[#fbcc1e]'
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                      }`}
                    >
                      <Briefcase className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Expert</span>
                    </button>
                  </div>
                </div>

                {/* Specialization (Expert only) */}
                {formData.role === 'expert' && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Choose your specialization
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {specializations.map((spec) => (
                        <button
                          key={spec.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, specialization: spec.value as any }))}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            formData.specialization === spec.value
                              ? 'border-[#fbcc1e] bg-[#fbcc1e]/10 text-[#fbcc1e]'
                              : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                          }`}
                        >
                          <div className="text-2xl mb-1">{spec.icon}</div>
                          <span className="text-xs font-medium">{spec.label}</span>
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
