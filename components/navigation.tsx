'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Sparkles, Heart, Leaf, Brain, ShoppingBag, BookOpen, Info, Phone } from 'lucide-react'
import Image from 'next/image'

const navLinks = [
  { name: 'Home', href: '/', icon: Sparkles },
  { name: 'Astrology', href: '/astrology', icon: Sparkles },
  { name: 'Counselling', href: '/counselling', icon: Heart },
  { name: 'Yoga', href: '/yoga', icon: Leaf },
  { name: 'Meditation', href: '/meditation', icon: Brain },
  { name: 'Products', href: '/products', icon: ShoppingBag },
  { name: 'Blog', href: '/blog', icon: BookOpen },
  { name: 'About Us', href: '/about', icon: Info },
  { name: 'Contact Us', href: '/contact', icon: Phone }
]

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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 gap-2">
          {/* Logo & Brand - Always Visible */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-2 min-w-0"
          >
            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
              <Image
                src="/images/DD-Logo.jpeg"
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
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-[#fbcc1e] font-semibold'
                    : 'text-neutral-700 hover:text-black'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Tablet Menu */}
          <div className="hidden md:flex lg:hidden items-center gap-6">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-[#fbcc1e] font-semibold'
                    : 'text-neutral-700 hover:text-black'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all duration-200 flex-shrink-0"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu - Full Navigation */}
        {isOpen && (
          <div
            className="md:hidden px-6 pt-6 pb-8 bg-white transition-transform duration-300 translate-x-0"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="px-6 space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-8 py-3 text-base font-medium transition-all duration-200 rounded-lg hover:translate-x-1 ${
                      isActive(item.href)
                        ? 'bg-[#fbcc1e]/7 text-[#fbcc1e] font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon 
                      size={18} 
                      strokeWidth={1.5} 
                      className={isActive(item.href) ? 'text-[#d4a000]' : 'text-gray-400'}
                    />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
