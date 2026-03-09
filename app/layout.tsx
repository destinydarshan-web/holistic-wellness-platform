import React from "react"
import type { Metadata, Viewport } from 'next'
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
  description: 'Connect with expert astrologers for personalized horoscope readings and birth chart analysis. Find professional counsellors for mental health support and relationship guidance. Join live yoga sessions with certified instructors and practice guided meditation for stress relief. Book one-on-one consultations, group workshops, and wellness programs designed for your personal growth journey.',
  generator: 'v0.app',
  icons: {
    icon: '/images/DD-Logo.png',
    shortcut: '/images/DD-Logo.png',
    apple: '/images/DD-Logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fdce20",
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
