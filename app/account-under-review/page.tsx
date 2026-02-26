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
    
    if (!loading) {
      if (!user) {
        console.log('No user, redirecting to login')
        router.replace("/login")
      } else if (profile && profile.status !== "pending") {
        console.log('Profile status not pending, redirecting to home. Status:', profile.status)
        router.replace("/")
      }
    }
  }, [user, profile, loading, router])

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="pt-24 min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">

        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-yellow-500/10 flex items-center justify-center">
          <span className="text-yellow-400 text-2xl">⏳</span>
        </div>

        <h1 className="text-2xl font-semibold mb-3">
          Your Expert Account Is Under Review
        </h1>

        <p className="text-zinc-400 mb-6">
          Thank you for applying as an expert at Destiny Darshan.
          Our team is reviewing your profile to ensure quality and authenticity.
        </p>

        <p className="text-sm text-zinc-500 mb-8">
          You will receive an email once your account is approved.
          Review typically takes 12–24 hours.
        </p>

        <button
          onClick={() => router.push("/")}
          className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition"
        >
          Back to Home
        </button>

      </div>
    </div>
  )
}