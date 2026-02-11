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
    icon: <Lock className="w-6 h-6 text-foreground" />,
    title: '100% Confidential Sessions',
    description: 'Your privacy is our priority. All consultations are completely confidential.',
  },
  {
    icon: <Award className="w-6 h-6 text-foreground" />,
    title: 'Certified & Experienced Experts',
    description: 'Our practitioners are highly qualified and vetted professionals.',
  },
  {
    icon: <Leaf className="w-6 h-6 text-foreground" />,
    title: 'Holistic & Personalized Approach',
    description: 'Every session is tailored to your unique needs and wellness goals.',
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-foreground" />,
    title: 'Secure Communication',
    description: 'All conversations are encrypted and secure on our platform.',
  },
]

export function TrustBadges({ badges = defaultBadges }: TrustBadgesProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-lg border border-accent/20 hover:border-accent/50 hover:bg-accent/5 transition-all"
            >
              <div className="mb-4">
                {badge.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-balance">
                {badge.title}
              </h3>
              <p className="text-sm text-foreground text-balance">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
