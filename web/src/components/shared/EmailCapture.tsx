'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/stores/auth'

export default function EmailCapture() {
  const { isAuthenticated } = useAuth()
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [promoCode, setPromoCode] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) return
    const dismissed = localStorage.getItem('email_capture_dismissed')
    if (dismissed) return

    // Show after 30 seconds or 50% scroll
    const timer = setTimeout(() => setShow(true), 30000)

    const onScroll = () => {
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      if (scrolled > 0.5) setShow(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [isAuthenticated])

  const dismiss = () => {
    setShow(false)
    localStorage.setItem('email_capture_dismissed', '1')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'popup' }),
      })
      const data = await res.json()
      setPromoCode(data.promo_code || null)
      setSubmitted(true)
      localStorage.setItem('email_capture_dismissed', '1')
      setTimeout(() => setShow(false), 5000)
    } catch {
      setSubmitted(true)
      localStorage.setItem('email_capture_dismissed', '1')
      setTimeout(() => setShow(false), 3000)
    }
  }

  if (!show || isAuthenticated) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[52] p-4 animate-slide-up">
      <div className="max-w-[520px] mx-auto bg-bg-card border border-accent/15 rounded-2xl shadow-[0_-10px_40px_rgba(139,92,246,0.1)] p-5">
        <button onClick={dismiss} className="absolute top-3 right-3 text-white/15 hover:text-white/40 transition p-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {submitted ? (
          <div className="text-center py-2">
            <span className="text-green-400 text-sm font-semibold">Отлично! Скоро пришлём подборку.</span>
            {promoCode && (
              <div className="mt-2 bg-accent/[0.08] border border-accent/15 rounded-lg px-3 py-2 inline-block">
                <span className="text-white/40 text-[10px] block">Ваш промокод на скидку 10%:</span>
                <span className="text-accent-light font-bold text-sm tracking-wider">{promoCode}</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎁</span>
              <span className="font-bold text-sm">Получите подборку лучших шаблонов</span>
            </div>
            <p className="text-white/25 text-xs mb-3">
              Подпишитесь и получите ТОП-10 шаблонов для вашей ниши + промокод на первую покупку.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="email@example.com"
                className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15" />
              <button type="submit"
                className="bg-accent text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-accent-dark transition shrink-0">
                Получить
              </button>
            </form>
            <p className="text-white/10 text-[10px] mt-2">
              Без спама. Отписка в один клик. <a href="/legal/privacy" target="_blank" className="text-white/20 hover:text-white/30">Политика конфиденциальности</a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
