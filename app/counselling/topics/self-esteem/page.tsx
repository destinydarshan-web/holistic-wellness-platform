import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Shield, Heart, Brain, Lightbulb } from 'lucide-react'

export default function SelfEsteemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#0b1220]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 to-[#0b1220]/50 backdrop-blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <Link 
              href="/counselling"
              className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Counselling
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Self-Esteem Building
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Professional guidance for building confidence, developing self-worth, and cultivating a positive self-image
            </p>
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Understanding Self-Esteem */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Understanding Self-Esteem</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Self-esteem affects every aspect of your life, from relationships to career success. Our counsellors help you build healthy self-worth and confidence.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2"></div>
                  <span>Negative self-talk and self-criticism</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2"></div>
                  <span>Comparison and social pressure</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2"></div>
                  <span>Perfectionism and fear of failure</span>
                </li>
              </ul>
            </div>

            {/* Building Strategies */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Building Strategies</h2>
              </div>
              <p className="text-gray-300 mb-4">
                We provide proven strategies to help you develop lasting self-confidence and a positive self-image.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2"></div>
                  <span>Cognitive restructuring techniques</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2"></div>
                  <span>Strength-based approaches and goal setting</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2"></div>
                  <span>Assertiveness training and boundary setting</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Benefits of Self-Esteem Counselling</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Greater Confidence</h3>
                <p className="text-gray-300 text-sm">Improved self-belief and assertiveness</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Better Relationships</h3>
                <p className="text-gray-300 text-sm">Healthier boundaries and communication</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Resilience</h3>
                <p className="text-gray-300 text-sm">Better ability to handle setbacks</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Build Your Confidence?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Connect with counsellors who specialize in self-esteem development and confidence building
            </p>
            <Link 
              href="/counselling"
              className="inline-flex items-center gap-2 bg-teal-500 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-teal-400 transition-colors"
            >
              Find Self-Esteem Counsellors
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
