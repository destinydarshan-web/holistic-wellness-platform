import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Shield, Heart, Brain, Lightbulb } from 'lucide-react'

export default function PregnancyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#0b1220]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 to-[#0b1220]/50 backdrop-blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <Link 
              href="/counselling"
              className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Counselling
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Pregnancy & Maternal Health
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Professional support for navigating pregnancy, motherhood, and maternal mental health challenges
            </p>
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Pregnancy Challenges */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Pregnancy & Motherhood</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Pregnancy and motherhood bring unique emotional challenges. Our counsellors provide support for prenatal anxiety, postpartum depression, and the transition to motherhood.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mt-2"></div>
                  <span>Prenatal anxiety and pregnancy-related stress</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mt-2"></div>
                  <span>Postpartum depression and baby blues</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mt-2"></div>
                  <span>Motherhood identity and role transitions</span>
                </li>
              </ul>
            </div>

            {/* Support Services */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Support Services</h2>
              </div>
              <p className="text-gray-300 mb-4">
                We provide specialized counselling services to support mothers through every stage of their journey.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mt-2"></div>
                  <span>Individual therapy for maternal mental health</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mt-2"></div>
                  <span>Couples counselling for relationship adjustments</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mt-2"></div>
                  <span>Support groups and peer connections</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Benefits of Maternal Counselling</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Emotional Well-being</h3>
                <p className="text-gray-300 text-sm">Better mental health during and after pregnancy</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Stronger Family Bonds</h3>
                <p className="text-gray-300 text-sm">Improved relationships with partner and children</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Confidence & Identity</h3>
                <p className="text-gray-300 text-sm">Stronger sense of self as a mother</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready for Maternal Support?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Connect with counsellors who specialize in maternal mental health and pregnancy support
            </p>
            <Link 
              href="/counselling"
              className="inline-flex items-center gap-2 bg-pink-500 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-pink-400 transition-colors"
            >
              Find Maternal Counsellors
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
