'use client'

import { usePathname } from 'next/navigation'
import { Footer } from '@/components/footer'

export function ConditionalFooter() {
  const pathname = usePathname()
  
  // Don't show footer on chat pages
  if (pathname?.includes('/session/chat/')) {
    return null
  }
  
  return <Footer />
}
