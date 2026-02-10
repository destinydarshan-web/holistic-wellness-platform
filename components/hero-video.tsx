'use client'

import React from "react"

import { useState } from 'react'

interface HeroVideoProps {
  title: string
  subtitle: string
  children?: React.ReactNode
}

export function HeroVideo({ title, subtitle, children }: HeroVideoProps) {
  const [videoLoaded, setVideoLoaded] = useState(false)

  return (
    <section className="relative w-full overflow-hidden">
      {/* Video Background Container */}
      <div className="relative h-screen max-h-[600px] md:max-h-[700px] w-full overflow-hidden">
        {/* Fallback Image (shows while video loads) */}
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${
            videoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundImage: 'url(/videos/hero-wellness-fallback.jpg)',
          }}
        />

        {/* Video Element */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => setVideoLoaded(true)}
          poster="/videos/hero-wellness-fallback.jpg"
        >
          {/* Video source - can be easily swapped */}
          <source src="/videos/hero-wellness.mp4" type="video/mp4" />
          <source src="/videos/hero-wellness.webm" type="video/webm" />
          {/* Fallback for browsers that don't support video */}
          Your browser does not support the video tag.
        </video>

        {/* Dark Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50 z-10" />

        {/* Content Layer */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-0 drop-shadow-md leading-relaxed">
              {subtitle}
            </p>
            {children && <div className="mt-8">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  )
}
