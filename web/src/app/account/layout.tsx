'use client'

import { useAuth } from '@/stores/auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

const nav = [
  { href: '/account', label: 'Мои покупки', icon: 'M20 12V22H4V12' },
  { href: '/account/wishlist', label: 'Избранное', icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' },
  { href: '/account/subscription', label: 'Подписка', icon: 'M12 2L2 7l10 5 10-5-10-5z' },
  { href: '/account/referral', label: 'Рефералы', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2' },
  { href: '/account/settings', label: 'Настройки', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6z' },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isLoading, isAuthenticated])

  if (isLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen pt-[140px] text-center">
        <div className="animate-pulse text-white/20">Загрузка...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-[110px] pb-16">
      <div className="max-w-[1100px] mx-auto px-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight">Личный кабинет</h1>
          <p className="text-white/25 text-sm mt-1">{user?.email}</p>
        </div>

        <div className="flex gap-8 flex-wrap lg:flex-nowrap">
          {/* Sidebar */}
          <aside className="w-full lg:w-[200px] shrink-0">
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

          {/* Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </main>
  )
}
