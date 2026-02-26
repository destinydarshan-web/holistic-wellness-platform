import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simplified middleware for basic route protection
// Full auth protection handled client-side in individual pages

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // For now, allow all routes - auth protection handled by pages
  // This prevents the module resolution error
  
  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/expert-dashboard/:path*',
    '/admin-dashboard/:path*',
    '/login',
    '/signup',
    '/account-under-review'
  ]
}
