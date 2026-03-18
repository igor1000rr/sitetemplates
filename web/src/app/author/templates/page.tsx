'use client'

import { useState, useEffect } from 'react'
import { authorApi } from '@/lib/api'
import Link from 'next/link'

const statusMap: Record<string, { label: string; color: string }> = {
  published: { label: 'Опубликован', color: 'bg-green-500/10 text-green-400' },
  pending: { label: 'На модерации', color: 'bg-yellow-500/10 text-yellow-400' },
  draft: { label: 'Черновик', color: 'bg-white/[0.06] text-white/30' },
  rejected: { label: 'Отклонён', color: 'bg-red-500/10 text-red-400' },
}

export default function AuthorTemplates() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authorApi.templates().then(({ data }) => { setTemplates(data.data || []); setLoading(false) })
  }, [])

  if (loading) return <div className="animate-pulse text-white/20">Загрузка...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Мои шаблоны ({templates.length})</h2>
        <Link href="/author/templates/new" className="bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
          + Загрузить
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-16 bg-bg-card rounded-2xl border border-white/[0.05]">
          <div className="text-white/10 text-4xl mb-4">📦</div>
          <p className="text-white/25 mb-4">У вас пока нет шаблонов</p>
          <Link href="/author/templates/new" className="text-accent-light hover:text-accent-pale transition text-sm">
            Загрузить первый шаблон →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t: any) => (
            <Link key={t.id} href={`/author/templates/${t.id}`}
              className="flex items-center gap-4 p-4 bg-bg-card rounded-xl border border-white/[0.05] hover:border-accent/10 transition group">
              <div className="w-16 h-11 rounded-lg bg-bg-surface overflow-hidden shrink-0">
                {t.image && <img src={t.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold group-hover:text-accent-pale transition truncate">{t.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${statusMap[t.status]?.color || ''}`}>
                    {statusMap[t.status]?.label || t.status}
                  </span>
                </div>
                <div className="text-white/20 text-xs">
                  {t.platform} · {t.category} · {t.created_at}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-accent-pale font-bold">{t.price_rub.toLocaleString('ru-RU')} ₽</div>
                <div className="text-white/20 text-xs">{t.sales_count} продаж · ★{t.rating}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
