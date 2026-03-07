'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, ShoppingBag, BookOpen, Info, Phone, ChevronDown, User, LogOut, LayoutDashboard, Calendar, DollarSign } from 'lucide-react'
import Image from 'next/image'
import { ServiceIcon } from '@/components/ServiceIcon'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'

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
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut, loading } = useAuth()

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

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
    console.log("Logout clicked - executing signOut");
    
    try {
      // Close dropdown immediately
      setIsUserDropdownOpen(false);
      
      // Use AuthContext signOut function
      const { error } = await signOut();
      
      if (error) {
        console.error("Logout error:", error.message);
      } else {
        console.log("Logout successful");
      }
      
      // Add a small delay to ensure state is cleared before navigation
      setTimeout(() => {
        // Navigate to home
        router.push("/");
        // Force a refresh to ensure all state is cleared
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error("Logout exception:", error);
      
      // Emergency fallback
      setTimeout(() => {
        router.push("/");
        window.location.reload();
      }, 100);
    }
  };

  const getDashboardLink = () => {
    if (!profile) return '/dashboard'
    
    switch (profile.role) {
      case 'admin':
        return '/admin-dashboard'
      case 'expert':
      case 'astrologer':
        return profile.status === 'approved' ? '/expert-dashboard' : '/account-under-review'
      case 'user':
      default:
        return '/dashboard'
    }
  }

  return (
    <nav className="absolute top-0 left-0 w-full z-50 py-5">
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
            <span className="text-base md:text-lg font-semibold text-white truncate drop-shadow-md">
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
                      <span className={`text-sm font-medium transition-all duration-200 drop-shadow-md ${
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
                    <div className="absolute left-0 top-full opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 w-64 bg-[#111] border border-white/10 shadow-xl rounded-xl p-4 z-50">
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
                    className={`text-sm font-medium transition-all duration-200 drop-shadow-md ${
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
                  <span className="text-sm font-medium drop-shadow-md">
                    Hi, {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-white/10 shadow-xl rounded-xl p-2 z-50">
                    {/* Show Dashboard only for non-expert users */}
                    {profile?.role !== 'expert' && profile?.role !== 'astrologer' && (
                      <>
                        <Link
                          href={getDashboardLink()}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/90 hover:text-white"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <LayoutDashboard size={16} />
                          <span className="text-sm">Dashboard</span>
                        </Link>
                        <Link
                          href="/user/calendar"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/90 hover:text-white"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <Calendar size={16} />
                          <span className="text-sm">My Calendar</span>
                        </Link>
                        <Link
                          href="/appointments"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/90 hover:text-white"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <Calendar size={16} />
                          <span className="text-sm">Appointments</span>
                        </Link>
                      </>
                    )}
                    
                    {/* Expert-specific menu items */}
                    {(profile?.role === 'expert' || profile?.role === 'astrologer') && (
                      <>
                        <Link
                          href="/expert-dashboard"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/90 hover:text-white"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <LayoutDashboard size={16} />
                          <span className="text-sm">Expert Dashboard</span>
                        </Link>
                        <Link
                          href="/expert/profile"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/90 hover:text-white"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <User size={16} />
                          <span className="text-sm">Edit Profile</span>
                        </Link>
                        <Link
                          href="/expert/calendar"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/90 hover:text-white"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <Calendar size={16} />
                          <span className="text-sm">My Calendar</span>
                        </Link>
                        <Link
                          href="/expert/earnings"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/90 hover:text-white"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <DollarSign size={16} />
                          <span className="text-sm">Earnings</span>
                        </Link>
                      </>
                    )}
                    
                    <div className="border-t border-white/10 my-2"></div>
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
                <span className="text-sm font-medium drop-shadow-md">Login</span>
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

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Panel */}
            <div className="relative h-full w-full max-w-md ml-auto bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] transition-transform duration-300 ease-in-out translate-x-0 flex flex-col">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                {/* Logo */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <Image
                      src="/images/DD-Logo.png"
                      alt="Destiny Darshan Logo"
                      width={32}
                      height={32}
                      className="w-full h-full"
                    />
                  </div>
                  <span className="text-lg font-semibold text-white">Destiny Darshan</span>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Glow Divider */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-4" />

              {/* Menu Items */}
              <nav className="px-8 flex-1 overflow-y-auto" role="navigation" aria-label="Mobile navigation">
                <ul className="flex flex-col gap-4 leading-tight tracking-wide">
                  {navLinks.map((item) => (
                    <li key={item.href}>
                      {item.hasDropdown ? (
                        <div>
                          <button
                            onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                            className={`flex items-center justify-between w-full text-xl font-medium transition-colors duration-200 hover:translate-x-1 ${
                              isActive(item.href)
                                ? 'text-[#fbcc1e]'
                                : 'text-white/80 hover:text-white'
                            }`}
                          >
                            <span>{item.name}</span>
                            <ChevronDown 
                              className={`w-5 h-5 transition-transform duration-300 ${
                                isMobileServicesOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          
                          {/* Services Dropdown */}
                          {isMobileServicesOpen && (
                            <div className="mt-3 pl-4 space-y-2 border-l border-white/10">
                              {servicesList.map((service) => (
                                <Link
                                  key={service.href}
                                  href={service.href}
                                  onClick={() => {
                                    setIsOpen(false)
                                    setIsMobileServicesOpen(false)
                                  }}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
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
                          className={`block text-xl font-medium transition-colors duration-200 hover:translate-x-1 ${
                            isActive(item.href)
                              ? 'text-[#fbcc1e]'
                              : 'text-white/80 hover:text-white'
                          }`}
                        >
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Auth Section */}
                <div className="mt-8 pt-4 border-t border-white/10">
                  {loading ? (
                    <div className="w-full h-12 bg-white/10 rounded-xl animate-pulse"></div>
                  ) : user ? (
                    <div className="space-y-2">
                      {/* Show Dashboard only for non-expert users */}
                      {profile?.role !== 'expert' && profile?.role !== 'astrologer' && (
                        <>
                          <Link
                            href={getDashboardLink()}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm font-medium tracking-wide"
                          >
                            <LayoutDashboard size={16} />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            href="/appointments"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm font-medium tracking-wide"
                          >
                            <Calendar size={16} />
                            <span>Appointments</span>
                          </Link>
                        </>
                      )}
                      
                      {/* Expert-specific mobile menu */}
                      {(profile?.role === 'expert' || profile?.role === 'astrologer') && (
                        <>
                          <Link
                            href="/expert-dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm font-medium tracking-wide hover:border-l-2 hover:border-l-yellow-400 hover:shadow-sm"
                          >
                            <LayoutDashboard size={16} />
                            <span>Expert Dashboard</span>
                          </Link>
                          <Link
                            href="/expert/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm font-medium tracking-wide hover:border-l-2 hover:border-l-yellow-400 hover:shadow-sm"
                          >
                            <User size={16} />
                            <span>Edit Profile</span>
                          </Link>
                          <Link
                            href="/expert/calendar"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm font-medium tracking-wide hover:border-l-2 hover:border-l-yellow-400 hover:shadow-sm"
                          >
                            <Calendar size={16} />
                            <span>My Calendar</span>
                          </Link>
                          <Link
                            href="/expert/earnings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 text-sm font-medium tracking-wide hover:border-l-2 hover:border-l-yellow-400 hover:shadow-sm"
                          >
                            <DollarSign size={16} />
                            <span>Earnings</span>
                          </Link>
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                        className="flex items-center gap-2 bg-white/5 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 text-sm font-medium tracking-wide"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 bg-white/5 border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/10 transition-all duration-300 w-full justify-center"
                    >
                      <User size={18} />
                      <span className="font-medium">Login</span>
                    </Link>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
