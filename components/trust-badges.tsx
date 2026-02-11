'use client'

import React from "react"

import { Lock, Award, Leaf, MessageSquare } from 'lucide-react'

interface TrustBadge {
  icon: React.ReactNode
  title: string
  description: string
}

interface TrustBadgesProps {
  badges?: TrustBadge[]
}

const defaultBadges: TrustBadge[] = [
  {
    icon: <Lock className="w-6 h-6 text-[#1f1f1f]" />,
    title: '100% Confidential Sessions',
    description: 'Your privacy is our priority. All consultations are completely confidential.',
  },
  {
    icon: <Award className="w-6 h-6 text-[#1f1f1f]" />,
    title: 'Certified & Experienced Experts',
    description: 'Our practitioners are highly qualified and vetted professionals.',
  },
  {
    icon: <Leaf className="w-6 h-6 text-[#1f1f1f]" />,
    title: 'Holistic & Personalized Approach',
    description: 'Every session is tailored to your unique needs and wellness goals.',
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-[#1f1f1f]" />,
    title: 'Secure Communication',
    description: 'All conversations are encrypted and secure on our platform.',
  },
]

export function TrustBadges({ badges = defaultBadges }: TrustBadgesProps) {
  return (
    <section id="services-section" className="py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md text-center gap-4"
            >
              <div className="w-6 h-6 text-[#fbcc1e] mb-4">
                {badge.icon}
              </div>
              <h3 className="text-sm md:text-base font-semibold tracking-tight">
                {badge.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
