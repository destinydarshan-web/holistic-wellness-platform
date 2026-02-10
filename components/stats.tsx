'use client'

import React from "react"

import { Users, Award, Zap, TrendingUp } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

interface Stat {
  icon: React.ReactNode
  value: string
  label: string
}

interface StatsProps {
  stats?: Stat[]
}

const defaultStats: Stat[] = [
  {
    icon: <Users className="w-8 h-8 text-secondary" />,
    value: '10,00+',
    label: 'Consultations Completed',
  },
  {
    icon: <Award className="w-8 h-8 text-secondary" />,
    value: '50+',
    label: 'Expert Practitioners',
  },
  {
    icon: <Zap className="w-8 h-8 text-secondary" />,
    value: '5+',
    label: 'Years of Experience',
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-secondary" />,
    value: '100%',
    label: 'Client Satisfaction',
  },
]

export function Stats({ stats = defaultStats }: StatsProps) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section 
      ref={ref}
      className="py-12 px-4 sm:px-6 lg:px-8 bg-primary/5"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`text-center ${isVisible ? `animate-scroll-fade-in scroll-animate-stagger-${Math.min(index + 1, 4)}` : 'opacity-0'}`}
            >
              <div className="flex justify-center mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <p className="text-muted-foreground text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
