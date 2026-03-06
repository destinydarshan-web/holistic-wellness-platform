import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Shield, Heart, Brain, Lightbulb } from 'lucide-react'

export default function TraumaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#0b1220]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 to-[#0b1220]/50 backdrop-blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <Link 
              href="/counselling"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Counselling
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Trauma & PTSD Support
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Professional healing support for trauma recovery and PTSD management through evidence-based therapies
            </p>
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Understanding Trauma */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Understanding Trauma</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Trauma can result from various life events and can have lasting effects on mental health. Our specialized counsellors provide safe, compassionate support for healing and recovery.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                  <span>Post-traumatic stress disorder (PTSD)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                  <span>Childhood trauma and abuse recovery</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                  <span>Accident and disaster trauma</span>
                </li>
              </ul>
            </div>

            {/* Healing Approaches */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Healing Approaches</h2>
              </div>
              <p className="text-gray-300 mb-4">
                We use evidence-based therapies specifically designed for trauma recovery and PTSD treatment.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                  <span>Trauma-focused cognitive behavioral therapy</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                  <span>Eye movement desensitization and reprocessing (EMDR)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                  <span>Somatic experiencing and body-based therapies</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Benefits of Trauma Counselling</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Symptom Reduction</h3>
                <p className="text-gray-300 text-sm">Decreased flashbacks, nightmares, and anxiety</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Emotional Healing</h3>
                <p className="text-gray-300 text-sm">Processing emotions and finding peace</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Life Restoration</h3>
                <p className="text-gray-300 text-sm">Rebuilding relationships and daily functioning</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Begin Healing?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Connect with specialized trauma counsellors who understand your journey and can guide your recovery
            </p>
            <Link 
              href="/counselling"
              className="inline-flex items-center gap-2 bg-indigo-500 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-400 transition-colors"
            >
              Find Trauma Counsellors
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
