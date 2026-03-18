'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookie_consent')
    if (!accepted) {
      // Delay for UX
      setTimeout(() => setShow(true), 2000)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('cookie_consent', '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[55] p-4 animate-slide-up">
      <div className="max-w-[600px] mx-auto bg-bg-card border border-white/[0.06] rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex-1 min-w-0">
          <p className="text-white/40 text-xs leading-relaxed">
            Мы используем cookies для авторизации и аналитики.{' '}
            <Link href="/legal/privacy" className="text-accent-light/60 hover:text-accent-light transition">Подробнее</Link>
          </p>
        </div>
        <button onClick={accept}
          className="bg-accent text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-accent-dark transition shrink-0">
          Принять
        </button>
      </div>
    </div>
  )
}
