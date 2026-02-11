'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'

const allNavItems = [
  { label: 'Home', href: '/' },
  { label: 'Astrology', href: '/astrology' },
  { label: 'Counselling', href: '/counselling' },
  { label: 'Yoga', href: '/yoga' },
  { label: 'Meditation', href: '/meditation' },
  { label: 'Blog', href: '/blog' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
]

const desktopNavItems = allNavItems.slice(0, 6)

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2">
          {/* Logo & Brand - Always Visible */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-2 min-w-0"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 flex-shrink-0 flex items-center justify-center">
              <Image
                src="..public\images\DD-Logo.jpeg"
                alt="Destiny Darshan Logo"
                width={36}
                height={36}
                className="w-full h-full"
              />
            </div>
            <span className="text-base md:text-lg font-semibold text-foreground truncate">
              Destiny Darshan
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {desktopNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  isActive(item.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors flex-shrink-0"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile/Tablet Menu - Full Navigation */}
        {isOpen && (
          <div
            className="md:hidden pb-4 space-y-1 animate-in slide-in-from-top-2 duration-200"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {allNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`block px-4 py-3 text-sm font-medium transition-colors rounded-md ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
