import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage =
      req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/register') ||
      req.nextUrl.pathname.startsWith('/forgot-password')
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/properties') ||
      req.nextUrl.pathname.startsWith('/tenants') ||
      req.nextUrl.pathname.startsWith('/payments') ||
      req.nextUrl.pathname.startsWith('/leases') ||
      req.nextUrl.pathname.startsWith('/maintenance') ||
      req.nextUrl.pathname.startsWith('/calculators') ||
      req.nextUrl.pathname.startsWith('/settings')
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
    const isAdminLoginPage = req.nextUrl.pathname === '/admin/login'

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Redirect unauthenticated users to login for protected routes
    if (isDashboard && !isAuth) {
      let from = req.nextUrl.pathname
      if (req.nextUrl.search) {
        from += req.nextUrl.search
      }
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      )
    }

    // Admin pages require separate authentication (handled in the admin layout)
    // Skip middleware protection for admin routes
    if (isAdminPage && !isAdminLoginPage) {
      // Admin auth is handled separately via cookies
      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public pages
        const isPublicPage =
          req.nextUrl.pathname === '/' ||
          req.nextUrl.pathname.startsWith('/pricing') ||
          req.nextUrl.pathname.startsWith('/features') ||
          req.nextUrl.pathname.startsWith('/terms') ||
          req.nextUrl.pathname.startsWith('/privacy') ||
          req.nextUrl.pathname.startsWith('/api') ||
          req.nextUrl.pathname.startsWith('/admin')

        if (isPublicPage) return true

        // Auth pages are accessible without token
        const isAuthPage =
          req.nextUrl.pathname.startsWith('/login') ||
          req.nextUrl.pathname.startsWith('/register') ||
          req.nextUrl.pathname.startsWith('/forgot-password') ||
          req.nextUrl.pathname.startsWith('/verify-email')

        if (isAuthPage) return true

        // All other pages require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
