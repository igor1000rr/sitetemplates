'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface RecentItem {
  id: number
  title: string
  slug: string
  image?: string
  price_rub: number
  platform: string
}

const STORAGE_KEY = 'recently_viewed'
const MAX_ITEMS = 8

export function trackView(template: RecentItem) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as RecentItem[]
    const filtered = stored.filter(t => t.id !== template.id)
    filtered.unshift(template)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)))
  } catch {}
}

export default function RecentlyViewed({ excludeId }: { excludeId?: number }) {
  const [items, setItems] = useState<RecentItem[]>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as RecentItem[]
      setItems(excludeId ? stored.filter(t => t.id !== excludeId).slice(0, 4) : stored.slice(0, 4))
    } catch {}
  }, [excludeId])

  if (items.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/20">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        Вы недавно смотрели
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
        {items.map((t) => (
          <Link key={t.id} href={`/templates/${t.slug}`}
            className="group shrink-0 w-[200px] bg-bg-card rounded-xl overflow-hidden border border-white/[0.05] hover:border-accent/15 transition">
            <div className="aspect-[16/10] bg-bg-surface overflow-hidden">
              {t.image ? (
                <Image src={t.image} alt={t.title} width={320} height={200} sizes="200px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-xs font-semibold line-clamp-1 mb-1 group-hover:text-accent-pale transition">{t.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/20">{t.platform}</span>
                <span className="text-accent-pale text-sm font-bold">{t.price_rub.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
