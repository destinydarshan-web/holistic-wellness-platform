import React from "react"
import type { Metadata } from 'next'
import { Poppins, Merriweather } from 'next/font/google'

import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Navigation } from '@/components/navigation'
import { ConditionalFooter } from '@/components/ConditionalFooter'
import { GlobalBackground } from '@/components/layout/GlobalBackground'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-merriweather',
})

export const metadata: Metadata = {
  title: 'Holistic Wellness Platform | Astrology, Counselling, Yoga & Meditation',
  description: 'Balance your mind, body and soul. Discover inner peace and wellness with our platform offering astrology guidance, professional counselling, yoga sessions, and meditation practices.',
  generator: 'v0.app',
  themeColor: "black",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${merriweather.variable}`}>
      <head>
        <meta name="theme-color" content="#fdce20" />
        <meta name="msapplication-TileColor" content="#fdce20" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#fdce20" />
      </head>
      <body className={`${poppins.className} antialiased text-foreground`}>
        <AuthProvider>
          <GlobalBackground>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">
                {children}
              </main>
              <ConditionalFooter />
            </div>
          </GlobalBackground>
        </AuthProvider>
      </body>
    </html>
  )
}
