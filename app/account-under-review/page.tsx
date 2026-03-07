"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function AccountUnderReviewPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    console.log('=== DEBUG: Account Under Review Page ===')
    console.log('Loading:', loading)
    console.log('User:', user)
    console.log('Profile:', profile)
    console.log('Profile status:', profile?.status)
    
    // Only redirect when we have complete data
    if (!loading) {
      if (!user) {
        console.log('No user, redirecting to login')
        router.replace("/login")
        return
      }
      
      // If we have profile data, check status
      if (profile) {
        if (profile.status !== "pending") {
          console.log('Profile status not pending, redirecting. Status:', profile.status)
          if (profile.status === "approved" && (profile.role === "expert" || profile.role === "astrologer")) {
            router.replace("/expert-dashboard")
          } else if (profile.status === "approved" && profile.role === "user") {
            router.replace("/dashboard")
          } else {
            router.replace("/")
          }
        } else {
          console.log('Profile status is pending, showing under review page')
        }
      } else {
        console.log('No profile data yet, waiting...')
      }
    }
  }, [user, profile, loading, router])

  // Show loading only while auth context is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#fdce20] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user after loading, show redirect message
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#0b1220] px-4 py-12 relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.08),transparent_60%)]"></div>
      
      {/* Premium Card Container */}
      <div className="relative max-w-xl mx-auto rounded-2xl bg-gradient-to-b from-[#0f172a] to-[#0b1220] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-10 text-center">
        
        {/* Glowing Status Circle */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#fdce20]/10 flex items-center justify-center text-[#fdce20] shadow-[0_0_40px_rgba(253,206,32,0.2)]">
          <span className="text-2xl">⏳</span>
        </div>

        {/* Premium Header */}
        <h1 className="text-2xl font-semibold text-white mb-2">
          Application Submitted 🎉
        </h1>

        

        {/* Engaging Description */}
        <p className="text-white/70 leading-relaxed mb-4">
          Our team will soon reach out to you over your email-address to review your profile. This ensures quality and authenticity for our community.
        </p>

        <p className="text-sm text-white/50 leading-relaxed">
          They will reach out you within 1 business day. Please check you mailbox.
        </p>

        {/* Status Badge */}
        <div className="inline-block px-3 py-1 rounded-full bg-[#fdce20]/10 text-[#fdce20] text-xs mt-6">
          Status: Pending Review
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => router.push("/")}
            className="w-full h-11 rounded-xl bg-[#fdce20] text-black font-medium hover:bg-amber-400 transition-all"
          >
            Return to Home
          </button>
          
          <button
            onClick={() => router.push("/login")}
            className="w-full h-11 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition-all"
          >
            Log Out
          </button>
        </div>

      </div>
    </div>
  )
}