import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for auth token in cookie or Authorization header
  const token = request.cookies.get('auth_token')?.value

  // Protected routes — redirect to login if no token
  const protectedPaths = ['/account', '/admin', '/author']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Auth pages — redirect to account if already logged in
  const authPaths = ['/auth/login', '/auth/register']
  if (authPaths.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/account', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*', '/author/:path*', '/auth/login', '/auth/register'],
}
