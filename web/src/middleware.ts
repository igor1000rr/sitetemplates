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

  // ─── Content-Security-Policy с одноразовым nonce ───
  // Строгая CSP (nonce + strict-dynamic) для современных браузеров; https:/unsafe-inline
  // остаются как fallback для старых браузеров (они игнорируют strict-dynamic),
  // поэтому переход не может сломать ни новые, ни старые клиенты. Next автоматически
  // проставляет nonce своим скриптам, читая CSP из заголовка запроса.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV !== 'production'

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
    "connect-src 'self' https://mc.yandex.ru https://www.google-analytics.com https://api.yookassa.ru",
    "frame-src https://yookassa.ru https://yoomoney.ru",
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  // Next читает nonce именно из заголовка запроса
  requestHeaders.set('content-security-policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  // CSP нужна на всех страницах; исключаем статику, изображения и API-проксирование
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|favicon-32.png|favicon.svg|manifest.json|sw.js|icons|sitemap.xml|robots.txt).*)',
  ],
}
