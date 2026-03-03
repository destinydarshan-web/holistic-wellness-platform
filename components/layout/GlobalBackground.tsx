'use client'

import React from 'react'

interface GlobalBackgroundProps {
  children: React.ReactNode
}

export function GlobalBackground({ children }: GlobalBackgroundProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0e1117] to-[#05070d]">
      {/* Optional: Add subtle glow overlays here if needed */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle Radial Glow - matching homepage style */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,200,0,0.03),_transparent_60%)]"></div>
      </div>

      {/* Main content with proper z-index */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
