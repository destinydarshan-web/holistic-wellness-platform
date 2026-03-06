import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Shield, Heart, Brain, Lightbulb } from 'lucide-react'

export default function AnxietyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#0b1220]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 to-[#0b1220]/50 backdrop-blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <Link 
              href="/counselling"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Counselling
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Anxiety Management
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Professional support for managing anxiety disorders and developing effective coping strategies
            </p>
          </div>

          {/* Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* What is Anxiety */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Understanding Anxiety</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Anxiety is a natural response to stress, but when it becomes overwhelming, it can interfere with daily life. Our counsellors help you identify triggers and develop effective management techniques.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <span>Excessive worry about everyday situations</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <span>Physical symptoms like rapid heartbeat and sweating</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <span>Difficulty concentrating and sleep disturbances</span>
                </li>
              </ul>
            </div>

            {/* Treatment Approaches */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Treatment Approaches</h2>
              </div>
              <p className="text-gray-300 mb-4">
                We use evidence-based approaches to help you manage anxiety effectively and regain control of your life.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <span>Cognitive Behavioral Therapy (CBT)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <span>Mindfulness and relaxation techniques</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <span>Exposure therapy for phobias</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Benefits of Anxiety Counselling</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Reduced Symptoms</h3>
                <p className="text-gray-300 text-sm">Learn techniques to manage and reduce anxiety symptoms effectively</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Improved Relationships</h3>
                <p className="text-gray-300 text-sm">Better communication and reduced anxiety in social situations</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Better Quality of Life</h3>
                <p className="text-gray-300 text-sm">Enjoy daily activities without overwhelming anxiety</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Take Control?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Connect with experienced counsellors who specialize in anxiety management
            </p>
            <Link 
              href="/counselling"
              className="inline-flex items-center gap-2 bg-green-500 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-400 transition-colors"
            >
              Find Anxiety Counsellors
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
