'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, HeartHandshake, Leaf, Brain } from 'lucide-react'

interface ServiceItem {
  name: string
  href: string
  icon: React.ReactNode
  ariaLabel: string
}

const services: ServiceItem[] = [
  {
    name: 'Astrology',
    href: '/astrology',
    icon: <Sparkles className="w-6 h-6 text-foreground" />,
    ariaLabel: 'Navigate to Astrology services'
  },
  {
    name: 'Counselling',
    href: '/counselling',
    icon: <HeartHandshake className="w-6 h-6 text-foreground" />,
    ariaLabel: 'Navigate to Counselling services'
  },
  {
    name: 'Yoga',
    href: '/yoga',
    icon: <Leaf className="w-6 h-6 text-foreground" />,
    ariaLabel: 'Navigate to Yoga services'
  },
  {
    name: 'Meditation',
    href: '/meditation',
    icon: <Brain className="w-6 h-6 text-foreground" />,
    ariaLabel: 'Navigate to Meditation services'
  }
]

export function ServiceQuickLinks() {
  return (
    <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-4 gap-3 md:gap-3 max-w-2xl mx-auto overflow-x-auto md:overflow-x-visible">
          {services.map((service) => (
            <Link
              key={service.name}
              href={service.href}
              aria-label={service.ariaLabel}
              className="group flex flex-col items-center justify-center p-3 bg-card text-card-foreground rounded-xl shadow-sm hover:bg-secondary hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-border w-full md:max-w-[200px] md:mx-auto"
            >
              <div className="text-primary mb-3 transition-transform duration-300 group-hover:scale-110 hover:text-accent">
                {service.icon}
              </div>
              <span className="text-xs md:text-sm font-medium text-center text-foreground">
                {service.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
