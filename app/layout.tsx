import React from "react"
import type { Metadata } from 'next'
import { Poppins, Merriweather } from 'next/font/google'

import './globals.css'

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

// export const metadata: Metadata = {
//   title: 'Holistic Wellness Platform | Astrology, Counselling, Yoga & Meditation',
//   description: 'Balance your mind, body and soul. Discover inner peace and wellness with our platform offering astrology guidance, professional counselling, yoga sessions, and meditation practices.',
//   generator: 'v0.app',
//   themeColor: "#fdce20",
//   viewport: {
//     width: 'device-width',
//     initialScale: 1,
//     maximumScale: 1,
//     userScalable: false,
//   },
// }


export const metadata: Metadata = {
  title: "Holistic Wellness Platform | Astrology, Counselling, Yoga & Meditation",
  description: "Balance your mind, body and soul.",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdce20" },
    { media: "(prefers-color-scheme: dark)", color: "#fdce20" },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${merriweather.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">{children}</body>
    </html>
  )
}
