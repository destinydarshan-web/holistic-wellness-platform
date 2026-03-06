import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Shield, Heart, Brain, Lightbulb } from 'lucide-react'

export default function StressManagementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#0b1220]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 to-[#0b1220]/50 backdrop-blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <Link 
              href="/counselling"
              className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Counselling
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Stress Management
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Professional guidance for managing daily stress, building resilience, and achieving work-life balance
            </p>
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Understanding Stress */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Understanding Stress</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Stress is a natural response to life's challenges, but chronic stress can impact your physical and mental health. Our counsellors help you identify stressors and develop effective coping strategies.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <span>Work-related stress and burnout</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <span>Family and relationship stress</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <span>Financial and lifestyle pressures</span>
                </li>
              </ul>
            </div>

            {/* Management Techniques */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Management Techniques</h2>
              </div>
              <p className="text-gray-300 mb-4">
                We teach proven techniques to help you manage stress effectively and build resilience for life's challenges.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <span>Mindfulness and meditation practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <span>Time management and prioritization skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <span>Relaxation techniques and breathing exercises</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Benefits of Stress Counselling</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Better Health</h3>
                <p className="text-gray-300 text-sm">Improved physical and mental well-being</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Work-Life Balance</h3>
                <p className="text-gray-300 text-sm">Better balance between professional and personal life</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Resilience</h3>
                <p className="text-gray-300 text-sm">Stronger ability to handle life's challenges</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Manage Stress Better?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Connect with counsellors who specialize in stress management and resilience building
            </p>
            <Link 
              href="/counselling"
              className="inline-flex items-center gap-2 bg-red-500 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-red-400 transition-colors"
            >
              Find Stress Management Counsellors
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
