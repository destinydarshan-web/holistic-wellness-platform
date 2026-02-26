'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, ShoppingBag, BookOpen, Info, Phone, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react'
import Image from 'next/image'
import { ServiceIcon } from '@/components/ServiceIcon'
import { useAuth } from '@/contexts/AuthContext'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services', hasDropdown: true },
  { name: 'Products', href: '/products' },
  { name: 'Blog', href: '/blog' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' }
]

const servicesList = [
  { name: 'Astrology', href: '/astrology', description: 'Discover your cosmic path', type: 'astrology' as const },
  { name: 'Counselling', href: '/counselling', description: 'Professional mental support', type: 'counselling' as const },
  { name: 'Yoga', href: '/yoga', description: 'Transform mind & body', type: 'yoga' as const },
  { name: 'Meditation', href: '/meditation', description: 'Find inner peace', type: 'meditation' as const }
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut, logout, loading } = useAuth()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    setIsUserDropdownOpen(false)
    router.push("/")
  }

  const getDashboardLink = () => {
    if (!profile) return '/dashboard'
    
    switch (profile.role) {
      case 'admin':
        return '/admin-dashboard'
      case 'expert':
        return profile.status === 'approved' ? '/expert-dashboard' : '/account-under-review'
      case 'user':
      default:
        return '/dashboard'
    }
  }

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`absolute top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0F0F14]/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
    } py-5`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center">
          {/* Logo & Brand - Left */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-2 min-w-0"
          >
            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
              <Image
                src="/images/DD-Logo.png"
                alt="Destiny Darshan Logo"
                width={36}
                height={36}
                className="w-full h-full"
              />
            </div>
            <span className="text-base md:text-lg font-semibold text-white truncate">
              Destiny Darshan
            </span>
          </Link>

          {/* Navigation Links - Center */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((item) => (
              <div key={item.href} className="relative group">
                {item.hasDropdown ? (
                  <>
                    <div className="flex items-center gap-1 cursor-pointer">
                      <span className={`text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'text-yellow-400 font-semibold'
                          : 'text-white/90 hover:text-white'
                      }`}>
                        {item.name}
                      </span>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isActive(item.href)
                            ? 'text-yellow-400'
                            : 'text-white/60'
                        }`}
                      />
                    </div>
                    
                    {/* Services Dropdown */}
                    <div className="absolute left-0 top-full opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 w-64 bg-[#1C1C24] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-4 z-50">
                      <div className="space-y-2">
                        {servicesList.map((service) => (
                          <Link
                            key={service.href}
                            href={service.href}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
                          >
                            <ServiceIcon type={service.type} size="sm" />
                            <div className="flex-1">
                              <h4 className="text-white font-medium text-sm">{service.name}</h4>
                              <p className="text-white/60 text-xs">{service.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'text-yellow-400 font-semibold'
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Auth Section - Right */}
          <div className="hidden lg:flex items-center">
            {loading ? (
              <div className="w-20 h-10 bg-white/10 rounded-full animate-pulse"></div>
            ) : user ? (
              /* User Dropdown */
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 bg-white/5 border border-white/20 text-white px-5 py-2.5 rounded-full hover:bg-white/10 transition-all duration-300"
                >
                  <User size={16} />
                  <span className="text-sm font-medium">
                    Hi, {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#1C1C24] backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-2 z-50">
                    <Link
                      href={getDashboardLink()}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/90 hover:text-white"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} />
                      <span className="text-sm">Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/90 hover:text-white w-full text-left"
                    >
                      <LogOut size={16} />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login Button */
              <Link
                href="/login"
                className="flex items-center gap-2 bg-white/5 border border-white/20 text-white px-5 py-2.5 rounded-full hover:bg-white/10 transition-all duration-300"
              >
                <User size={16} />
                <span className="text-sm font-medium">Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg border border-white/20 hover:bg-white/10 transition-all duration-200 flex-shrink-0"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            className="lg:hidden px-6 pt-6 pb-8 bg-black/80 backdrop-blur-md transition-transform duration-300 translate-x-0"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="space-y-1">
              {navLinks.map((item) => (
                <div key={item.href}>
                  {item.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                        className={`flex items-center justify-between w-full px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg ${
                          isActive(item.href)
                            ? 'bg-[#fbcc1e]/20 text-[#fbcc1e] font-semibold'
                            : 'text-white/90 hover:bg-white/10'
                        }`}
                      >
                        <span>{item.name}</span>
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-300 ${
                            isMobileServicesOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      
                      {/* Mobile Services Accordion */}
                      {isMobileServicesOpen && (
                        <div className="mt-2 space-y-1 pl-4">
                          {servicesList.map((service) => (
                            <Link
                              key={service.href}
                              href={service.href}
                              onClick={() => {
                                setIsOpen(false)
                                setIsMobileServicesOpen(false)
                              }}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-all duration-300"
                            >
                              <ServiceIcon type={service.type} size="sm" />
                              <div>
                                <h4 className="text-white font-medium text-sm">{service.name}</h4>
                                <p className="text-white/60 text-xs">{service.description}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg ${
                        isActive(item.href)
                          ? 'bg-[#fbcc1e]/20 text-[#fbcc1e] font-semibold'
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-white/20">
                {loading ? (
                  <div className="w-full h-10 bg-white/10 rounded-full animate-pulse"></div>
                ) : user ? (
                  <div className="space-y-2">
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 bg-white/5 border border-white/20 text-white px-5 py-2.5 rounded-full hover:bg-white/10 transition-all duration-300 w-full justify-center"
                    >
                      <LayoutDashboard size={16} />
                      <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                      className="flex items-center gap-3 bg-white/5 border border-white/20 text-white px-5 py-2.5 rounded-full hover:bg-white/10 transition-all duration-300 w-full justify-center"
                    >
                      <LogOut size={16} />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 bg-white/5 border border-white/20 text-white px-5 py-2.5 rounded-full hover:bg-white/10 transition-all duration-300 w-full justify-center"
                  >
                    <User size={16} />
                    <span className="text-sm font-medium">Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
