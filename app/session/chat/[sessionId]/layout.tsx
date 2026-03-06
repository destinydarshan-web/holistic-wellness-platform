import React from "react"
import { AuthProvider } from '@/contexts/AuthContext'
import { Navigation } from '@/components/navigation'
import { GlobalBackground } from '@/components/layout/GlobalBackground'

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthProvider>
      <GlobalBackground>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </GlobalBackground>
    </AuthProvider>
  )
}
