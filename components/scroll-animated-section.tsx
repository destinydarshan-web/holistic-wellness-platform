'use client'

import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { ReactNode } from 'react'

interface ScrollAnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: boolean
}

export function ScrollAnimatedSection({
  children,
  className = '',
  delay = false,
}: ScrollAnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ rootMargin: '0px 0px -100px 0px' })

  return (
    <div
      ref={ref}
      className={`${isVisible ? 'animate-scroll-fade-in' : 'opacity-0'} ${className}`}
      style={{ animationDelay: delay && isVisible ? '0.1s' : '0s' }}
    >
      {children}
    </div>
  )
}
