'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const suggestions = [
  'Стоматологическая клиника',
  'Мебель на заказ',
  'Строительство домов',
  'Автосервис',
  'Салон красоты',
  'Ресторан',
  'Юридическая компания',
  'Доставка еды',
]

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [placeholder, setPlaceholder] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Animated placeholder
  useEffect(() => {
    let idx = 0
    let charIdx = 0
    let deleting = false

    const tick = () => {
      const text = suggestions[idx]
      if (!deleting) {
        setPlaceholder(text.slice(0, charIdx + 1))
        charIdx++
        if (charIdx >= text.length) {
          deleting = true
          return setTimeout(tick, 2000)
        }
      } else {
        setPlaceholder(text.slice(0, charIdx))
        charIdx--
        if (charIdx <= 0) {
          deleting = false
          idx = (idx + 1) % suggestions.length
        }
      }
      setTimeout(tick, deleting ? 30 : 60)
    }

    const t = setTimeout(tick, 1000)
    return () => clearTimeout(t)
  }, [])

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/templates?search=${encodeURIComponent(query)}`)
    }
  }

  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5)

  return (
    <div className="max-w-[600px] mx-auto relative">
      <div className="flex items-center bg-white/[0.025] border border-white/[0.06] rounded-[14px] p-1">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={placeholder || 'Опишите ваш бизнес...'}
          className="flex-1 px-4 py-3 bg-transparent border-none text-white text-sm outline-none placeholder:text-white/20"
        />
        <button
          onClick={handleSearch}
          className="w-10 h-10 rounded-[10px] bg-accent flex items-center justify-center text-white shrink-0 hover:bg-accent-dark transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && query.length > 0 && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl z-10">
          {filtered.map((s) => (
            <button
              key={s}
              onMouseDown={() => {
                setQuery(s)
                router.push(`/templates?search=${encodeURIComponent(s)}`)
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-white/50 hover:bg-white/[0.03] hover:text-white/80 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
