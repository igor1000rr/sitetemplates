'use client'

import { useState, useEffect, useRef } from 'react'

interface ToastData {
  name: string
  template: string
  time?: string
}

// Fallback data when no real purchases exist yet
const fallbackData: ToastData[] = [
  { name: 'Алексей М.', template: 'Мебель и кухни на заказ' },
  { name: 'Мария К.', template: 'Стоматология — клиника' },
  { name: 'Дмитрий В.', template: 'Digital-агентство' },
  { name: 'Анна С.', template: 'Строительство бань' },
  { name: 'Сергей П.', template: 'Ремонт квартир' },
  { name: 'Елена Т.', template: 'Интернет-магазин' },
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'только что'
  if (mins < 60) return `${mins} мин назад`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ч назад`
  return `${Math.floor(hours / 24)} дн назад`
}

export default function LiveToasts() {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(false)
  const loaded = useRef(false)

  // Fetch real purchases once
  useEffect(() => {
    if (loaded.current) return
    loaded.current = true

    fetch('/api/social-proof/recent')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setToasts(data)
        } else {
          setToasts(fallbackData)
        }
      })
      .catch(() => setToasts(fallbackData))
  }, [])

  // Rotate toasts
  useEffect(() => {
    if (toasts.length === 0) return

    const showNext = () => {
      setCurrent(c => (c + 1) % toasts.length)
      setVisible(true)
      setTimeout(() => setVisible(false), 4500)
    }

    // First toast after 10s
    const t1 = setTimeout(showNext, 10000)
    // Rotate every 20-35s (less aggressive than before)
    const interval = setInterval(showNext, 20000 + Math.random() * 15000)

    return () => { clearTimeout(t1); clearInterval(interval) }
  }, [toasts])

  if (toasts.length === 0) return null
  const t = toasts[current]

  return (
    <div className={`fixed bottom-6 left-6 z-50 transition-all duration-500 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
    }`}>
      <div className="bg-bg-card/95 backdrop-blur-xl border border-white/[0.06] rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3 max-w-[320px]">
        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-white/60 text-xs leading-snug">
            <span className="font-semibold text-white/80">{t.name}</span>
            {t.time && <span className="text-white/20"> · {timeAgo(t.time)}</span>}
          </p>
          <p className="text-white/30 text-[11px] truncate">Купил «{t.template}»</p>
        </div>
      </div>
    </div>
  )
}
