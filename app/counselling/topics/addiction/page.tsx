import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Shield, Heart, Brain, Lightbulb } from 'lucide-react'

export default function AddictionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#0b1220]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 to-[#0b1220]/50 backdrop-blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <Link 
              href="/counselling"
              className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Counselling
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Addiction Recovery Support
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Professional guidance for overcoming substance abuse and behavioral addictions through evidence-based recovery programs
            </p>
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Understanding Addiction */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Understanding Addiction</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Addiction is a complex condition that affects brain function and behavior. Our specialized counsellors provide compassionate support for recovery and relapse prevention.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <span>Substance abuse (alcohol, drugs, prescription)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <span>Behavioral addictions (gambling, gaming, internet)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <span>Co-occurring mental health disorders</span>
                </li>
              </ul>
            </div>

            {/* Recovery Approaches */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Recovery Approaches</h2>
              </div>
              <p className="text-gray-300 mb-4">
                We use comprehensive, evidence-based approaches to support lasting recovery and prevent relapse.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <span>Motivational interviewing and cognitive therapy</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <span>Relapse prevention and coping strategies</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <span>Family therapy and support systems</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Benefits of Addiction Counselling</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Lasting Recovery</h3>
                <p className="text-gray-300 text-sm">Sustainable sobriety and relapse prevention</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Healing Relationships</h3>
                <p className="text-gray-300 text-sm">Rebuilding trust and family connections</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">New Life Skills</h3>
                <p className="text-gray-300 text-sm">Healthy coping mechanisms and life balance</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Recovery?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Connect with specialized addiction counsellors who understand your journey and support your recovery
            </p>
            <Link 
              href="/counselling"
              className="inline-flex items-center gap-2 bg-orange-500 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-400 transition-colors"
            >
              Find Addiction Counsellors
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
