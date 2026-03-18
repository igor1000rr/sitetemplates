'use client'

import { useAuth } from '@/stores/auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

const nav = [
  { href: '/author', label: 'Дашборд', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { href: '/author/templates', label: 'Мои шаблоны', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z' },
  { href: '/author/payouts', label: 'Выплаты', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
  { href: '/author/profile', label: 'Профиль', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
    if (!isLoading && isAuthenticated && user?.role === 'customer') {
      router.push('/author/register')
    }
  }, [isLoading, isAuthenticated, user])

  if (isLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen pt-[140px] text-center">
        <div className="animate-pulse text-white/20">Загрузка...</div>
      </main>
    )
  }

  // Страница регистрации автора - без sidebar
  if (pathname === '/author/register') {
    return <>{children}</>
  }

  if (user?.role !== 'author' && user?.role !== 'admin') {
    return (
      <main className="min-h-screen pt-[140px] text-center">
        <div className="text-white/20">Доступ только для авторов</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-[110px] pb-16">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Панель автора</h1>
            <p className="text-white/25 text-sm mt-1">Управляйте шаблонами и выплатами</p>
          </div>
          <Link href="/author/templates/new" className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
            + Новый шаблон
          </Link>
        </div>

        <div className="flex gap-8 flex-wrap lg:flex-nowrap">
          <aside className="w-full lg:w-[220px] shrink-0">
            <div className="flex lg:flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm transition ${
                    pathname === item.href
                      ? 'bg-accent/10 text-accent-pale font-semibold'
                      : 'text-white/35 hover:text-white/60 hover:bg-white/[0.02]'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              ))}
            </div>
          </aside>

          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </main>
  )
}
