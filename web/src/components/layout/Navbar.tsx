'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/stores/auth'
import { useCart } from '@/stores/cart'
import Link from 'next/link'
import SearchAutocomplete from '@/components/shared/SearchAutocomplete'
import NotificationBell from '@/components/shared/NotificationBell'

const navLinks = [
  { href: '/templates', label: 'Каталог' },
  { href: '/ai-match', label: '✨ AI-подбор', accent: true },
  { href: '/custom-development', label: 'Под ключ' },
  { href: '/pricing', label: 'Тарифы' },
  { href: '/blog', label: 'Блог' },
  { href: '/faq', label: 'Помощь' },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const cartCount = useCart((s) => s.count())
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (!profileOpen) return
    const fn = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [profileOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <nav className={`fixed top-[30px] left-0 right-0 z-40 border-b border-white/[0.04] transition-all duration-300 ${
        scrolled ? 'bg-bg/90 backdrop-blur-xl' : 'bg-bg/40 backdrop-blur-xl'
      }`}>
        <div className="max-w-[1300px] mx-auto px-4 md:px-8 flex items-center h-[60px] justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
            <span className="text-[17px] font-extrabold tracking-tight">
              AI<span className="text-accent-pale">Templ</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className={`text-[13px] font-medium px-3 py-1.5 rounded-lg hover:text-white/70 hover:bg-white/[0.03] transition ${
                  l.accent ? 'text-accent-pale' : 'text-white/40'
                }`}>{l.label}</Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:block"><SearchAutocomplete /></div>

            {/* Mobile search button */}
            <button onClick={() => setMobileSearch(true)}
              className="lg:hidden w-9 h-9 rounded-lg bg-white/[0.03] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {isAuthenticated && <NotificationBell />}

            <Link href="/cart" className="relative w-9 h-9 rounded-lg bg-white/[0.03] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </Link>

            <div className="hidden md:block">
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-white/60 text-sm hover:bg-white/[0.06] transition">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent-light text-xs font-bold">{user?.name?.charAt(0) || 'U'}</div>
                    <span className="hidden sm:inline text-[13px]">{user?.name}</span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-52 bg-bg-card border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                      {[
                        { href: '/account', label: 'Мои покупки' },
                        { href: '/account/subscription', label: 'Подписка' },
                        { href: '/account/wishlist', label: 'Избранное' },
                        { href: '/account/referral', label: 'Рефералы' },
                      ].map(i => (
                        <Link key={i.href} href={i.href} onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2.5 text-sm text-white/50 hover:bg-white/[0.03] hover:text-white/80 transition">{i.label}</Link>
                      ))}
                      <Link href="/account/settings" onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2.5 text-sm text-white/50 hover:bg-white/[0.03] hover:text-white/80 transition border-t border-white/[0.04]">Настройки</Link>
                      {user?.role === 'admin' && (
                        <Link href="/panel" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm text-accent-light hover:bg-white/[0.03] transition">Filament Admin</Link>
                      )}
                      {(user?.role === 'author' || user?.role === 'admin') && (
                        <Link href="/author" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm text-accent-light/70 hover:bg-white/[0.03] hover:text-accent-light transition">Панель автора</Link>
                      )}
                      <button onClick={() => { logout(); setProfileOpen(false) }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-white/30 hover:bg-white/[0.03] hover:text-white/50 transition border-t border-white/[0.04]">Выйти</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className="bg-accent text-white px-5 py-2 rounded-lg text-[13px] font-bold hover:bg-accent-dark transition">Войти</Link>
              )}
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-lg bg-white/[0.03] flex items-center justify-center text-white/40">
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[45] bg-bg/95 backdrop-blur-xl pt-[92px] overflow-y-auto">
          <div className="max-w-md mx-auto px-6 py-6 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className={`px-4 py-3.5 rounded-xl text-[15px] font-medium transition ${l.accent ? 'text-accent-pale bg-accent/[0.06]' : 'text-white/50 hover:bg-white/[0.03]'}`}>{l.label}</Link>
            ))}
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="px-4 py-3.5 text-white/30 text-[15px] hover:bg-white/[0.03] rounded-xl transition">Контакты</Link>

            {isAuthenticated ? (
              <div className="border-t border-white/[0.05] mt-3 pt-3 flex flex-col gap-1">
                <Link href="/account" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-white/50 text-[15px] hover:bg-white/[0.03] rounded-xl transition">Личный кабинет</Link>
                <Link href="/account/subscription" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-white/40 text-[15px] hover:bg-white/[0.03] rounded-xl transition">Подписка</Link>
                <Link href="/account/wishlist" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-white/40 text-[15px] hover:bg-white/[0.03] rounded-xl transition">Избранное</Link>
                <button onClick={() => { logout(); setMobileOpen(false) }}
                  className="w-full text-left px-4 py-3 text-white/25 text-[15px] hover:bg-white/[0.03] rounded-xl transition">Выйти</button>
              </div>
            ) : (
              <div className="mt-4 flex gap-2">
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="flex-1 bg-accent text-white py-3 rounded-xl text-sm font-bold text-center hover:bg-accent-dark transition">Войти</Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="flex-1 bg-white/[0.04] border border-white/[0.06] text-white/50 py-3 rounded-xl text-sm font-semibold text-center hover:text-white/80 transition">Регистрация</Link>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Mobile search overlay */}
      {mobileSearch && (
        <div className="fixed inset-0 z-[55] bg-bg/98 backdrop-blur-xl pt-[30px]">
          <div className="max-w-lg mx-auto px-4 pt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <SearchAutocomplete autoFocus onClose={() => setMobileSearch(false)} />
              </div>
              <button onClick={() => setMobileSearch(false)}
                className="text-white/30 hover:text-white/60 text-sm font-medium transition shrink-0">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
