'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  redirectTo?: string
}

export function RoleGuard({ children, allowedRoles, redirectTo = '/dashboard' }: RoleGuardProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (!profile || !allowedRoles.includes(profile.role)) {
      router.push(redirectTo)
      return
    }
  }, [user, profile, loading, router, allowedRoles, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (!user || !profile || !allowedRoles.includes(profile.role)) {
    return null
  }

  return <>{children}</>
}

// Higher-order component for protecting routes
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: string[],
  redirectTo?: string
) {
  return function ProtectedComponent(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles} redirectTo={redirectTo}>
        <Component {...props} />
      </RoleGuard>
    )
  }
}
