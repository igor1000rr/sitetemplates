'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export const CONSENT_KEY = 'cookie_consent'
export const CONSENT_EVENT = 'cookie-consent-change'

/** Дал ли пользователь согласие на аналитические cookie. */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(CONSENT_KEY) === 'accepted'
}

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const v = localStorage.getItem(CONSENT_KEY)
    if (v !== 'accepted' && v !== 'rejected') {
      // Delay for UX
      setTimeout(() => setShow(true), 2000)
    }
  }, [])

  const choose = (value: 'accepted' | 'rejected') => {
    localStorage.setItem(CONSENT_KEY, value)
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[55] p-4 animate-slide-up">
      <div className="max-w-[600px] mx-auto bg-bg-card border border-white/[0.06] rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex-1 min-w-0">
          <p className="text-white/40 text-xs leading-relaxed">
            Мы используем cookies для авторизации, а с вашего согласия — и для аналитики.{' '}
            <Link href="/legal/privacy" className="text-accent-light/60 hover:text-accent-light transition">Подробнее</Link>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => choose('rejected')}
            className="text-white/50 px-4 py-2 rounded-lg text-xs font-bold hover:text-white/80 transition">
            Отклонить
          </button>
          <button onClick={() => choose('accepted')}
            className="bg-accent text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-accent-dark transition">
            Принять
          </button>
        </div>
      </div>
    </div>
  )
}
