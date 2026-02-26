'use client'

import React, { useState, useEffect, useRef } from "react"

import { Users, Award, Zap, TrendingUp } from 'lucide-react'

interface Stat {
  icon: React.ReactNode
  value: string
  label: string
  targetNumber?: number
}

interface StatsProps {
  stats?: Stat[]
}

const defaultStats: Stat[] = [
  {
    icon: <Users className="w-8 h-8 text-secondary" />,
    value: '1000+',
    label: 'Consultations Completed',
    targetNumber: 1000,
  },
  {
    icon: <Award className="w-8 h-8 text-secondary" />,
    value: '50+',
    label: 'Expert Practitioners',
    targetNumber: 50,
  },
  {
    icon: <Zap className="w-8 h-8 text-secondary" />,
    value: '5+',
    label: 'Years of Experience',
    targetNumber: 5,
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-secondary" />,
    value: '100%',
    label: 'Client Satisfaction',
    targetNumber: 100,
  },
]

interface CountingStatProps {
  target: number
  suffix: string
  duration: number
  isVisible: boolean
}

function CountingStat({ target, suffix, duration, isVisible }: CountingStatProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true)
      startTimeRef.current = null
      
      const animateCount = (timestamp: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp
        }
        
        const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
        const easeOutProgress = 1 - Math.pow(1 - progress, 3) // ease-out cubic
        const currentCount = Math.floor(easeOutProgress * target)
        
        setCount(currentCount)
        
        if (progress < 1) {
          requestAnimationFrame(animateCount)
        }
      }
      
      requestAnimationFrame(animateCount)
    }
  }, [isVisible, hasAnimated, target, duration])

  return (
    <span>
      {count}{suffix}
    </span>
  )
}

export function Stats({ stats = defaultStats }: StatsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setIsVisible(true)
          setHasTriggered(true)
        }
      },
      {
        threshold: 0.5,
        rootMargin: '0px'
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [hasTriggered])

  return (
    <section 
      ref={ref}
      className="py-12 px-4 sm:px-6 lg:px-8 bg-primary/5 border-y border-black/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`text-center transition-all duration-300 hover:-translate-y-1 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-5'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="flex justify-center mb-4">
                {stat.icon}
              </div>
              <div className="text-4xl md:text-5xl font-bold text-[#fbcc1e] leading-none tracking-tight mb-2">
                {stat.targetNumber ? (
                  <CountingStat 
                    target={stat.targetNumber} 
                    suffix={stat.value.includes('+') ? '+' : stat.value.includes('%') ? '%' : ''}
                    duration={1800}
                    isVisible={isVisible}
                  />
                ) : (
                  stat.value
                )}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-3">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
