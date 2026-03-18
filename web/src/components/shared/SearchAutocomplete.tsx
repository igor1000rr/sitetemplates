'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { templatesApi } from '@/lib/api'

interface SearchResult {
  id: number; title: string; slug: string; category: string
  platform: string; price_rub: number; image?: string
}

interface Props {
  autoFocus?: boolean
  onClose?: () => void
}

export default function SearchAutocomplete({ autoFocus, onClose }: Props = {}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<NodeJS.Timeout>()
  const router = useRouter()

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus()
  }, [autoFocus])

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced search
  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await templatesApi.list({ search: query, per_page: 5 })
        setResults((data.data || []).map((t: any) => ({
          id: t.id, title: t.title, slug: t.slug,
          category: t.category?.name || '', platform: t.platform?.name || '',
          price_rub: t.price_rub, image: t.preview_image,
        })))
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
  }, [query])

  const go = (slug: string) => {
    setOpen(false); setQuery('')
    router.push(`/templates/${slug}`)
    onClose?.()
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setOpen(false)
    if (query.trim()) {
      router.push(`/templates?search=${encodeURIComponent(query.trim())}`)
      onClose?.()
    }
  }

  return (
    <div ref={ref} className="relative">
      <form onSubmit={submit}>
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-1.5 focus-within:border-accent/20 transition">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            className="text-white/15 shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder="Поиск шаблонов..."
            className="bg-transparent text-sm text-white w-full lg:w-[200px] outline-none placeholder:text-white/15"
          />
        </div>
      </form>

      {/* Dropdown */}
      {open && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden z-50 min-w-[280px]">
          {loading ? (
            <div className="px-4 py-3 text-white/15 text-sm">Ищем...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-white/15 text-sm">Ничего не найдено</div>
          ) : (
            <>
              {results.map(r => (
                <button key={r.id} onClick={() => go(r.slug)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.03] transition text-left">
                  {r.image ? (
                    <img src={r.image} alt="" className="w-10 h-7 rounded object-cover shrink-0 bg-bg-surface" />
                  ) : (
                    <div className="w-10 h-7 rounded bg-white/[0.03] shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/70 truncate">{r.title}</div>
                    <div className="text-[10px] text-white/20">{r.platform} · {r.category}</div>
                  </div>
                  <div className="text-xs text-accent-pale font-bold shrink-0">{r.price_rub?.toLocaleString('ru-RU')} ₽</div>
                </button>
              ))}
              <button onClick={() => { submit({ preventDefault: () => {} } as any) }}
                className="w-full px-4 py-2 text-center text-accent-light text-xs hover:bg-white/[0.02] transition border-t border-white/[0.04]">
                Все результаты по «{query}» →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
