'use client'

import React from 'react'

interface ServiceIconProps {
  type: 'astrology' | 'counselling' | 'yoga' | 'meditation'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const serviceConfig = {
  astrology: {
    gradient: 'from-purple-500 to-purple-700',
    icon: '🔮',
  },
  counselling: {
    gradient: 'from-rose-400 to-pink-600',
    icon: '💬',
  },
  yoga: {
    gradient: 'from-emerald-400 to-green-600',
    icon: '🧘',
  },
  meditation: {
    gradient: 'from-indigo-400 to-blue-600',
    icon: '🧘',
  },
}

const sizeConfig = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-14 h-14 text-xl',
  lg: 'w-16 h-16 text-2xl',
}

export function ServiceIcon({ type, size = 'md', className = '' }: ServiceIconProps) {
  const config = serviceConfig[type]
  const sizeClasses = sizeConfig[size]

  return (
    <div 
      className={`
        ${sizeClasses} 
        rounded-full 
        bg-gradient-to-br 
        ${config.gradient}
        flex 
        items-center 
        justify-center 
        shadow-lg 
        shadow-black/20
        hover:scale-105 
        transition-all 
        duration-300
        ${className}
      `}
    >
      <span className="text-white">{config.icon}</span>
    </div>
  )
}
