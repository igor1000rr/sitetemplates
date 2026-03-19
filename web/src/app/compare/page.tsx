'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { compareApi } from '@/lib/api'
import Link from 'next/link'
import { useCompare } from '@/stores/compare'

interface TemplateCompare {
  id: number; title: string; slug: string; preview_image: string;
  demo_url: string; price_rub: number; old_price_rub: number | null;
  category: string; platform: string; rating: number | null;
  reviews_count: number; sales_count: number; description: string;
  features: string; tags: string[]; created_at: string;
}

const rows: { label: string; key: string; render?: (t: TemplateCompare) => React.ReactNode }[] = [
  { label: 'Цена', key: 'price', render: t => (
    <div>
      <span className="text-lg font-bold">{t.price_rub.toLocaleString('ru-RU')} ₽</span>
      {t.old_price_rub && (
        <span className="ml-2 text-white/15 line-through text-sm">{t.old_price_rub.toLocaleString('ru-RU')} ₽</span>
      )}
    </div>
  )},
  { label: 'Категория', key: 'category', render: t => t.category || '—' },
  { label: 'Платформа', key: 'platform', render: t => t.platform || '—' },
  { label: 'Рейтинг', key: 'rating', render: t => t.rating
    ? <span>⭐ {t.rating} <span className="text-white/15">({t.reviews_count})</span></span>
    : <span className="text-white/15">Нет отзывов</span>
  },
  { label: 'Продаж', key: 'sales', render: t => t.sales_count },
  { label: 'Описание', key: 'desc', render: t => (
    <p className="text-white/30 text-xs leading-relaxed line-clamp-3">{t.description || '—'}</p>
  )},
  { label: 'Добавлен', key: 'date', render: t => t.created_at },
]

export default function ComparePage() {
  const params = useSearchParams()
  const [templates, setTemplates] = useState<TemplateCompare[]>([])
  const [loading, setLoading] = useState(true)
  const { clear } = useCompare()

  useEffect(() => {
    const ids = params.get('ids')
    if (!ids) { setLoading(false); return }

    const idArr = ids.split(',').map(Number).filter(Boolean)
    if (idArr.length < 2) { setLoading(false); return }

    compareApi.compare(idArr)
      .then(({ data }) => setTemplates(data.data || [])).catch(() => {})
      .finally(() => setLoading(false))
  }, [params])

  useEffect(() => {
    // Очистить compare bar при посещении страницы сравнения
    return () => clear()
  }, [])

  if (loading) return (
    <main className="min-h-screen pt-[140px] text-center">
      <div className="animate-pulse text-white/20">Загрузка сравнения...</div>
    </main>
  )

  if (templates.length < 2) return (
    <main className="min-h-screen pt-[140px] text-center">
      <h1 className="text-xl font-bold mb-3">Сравнение шаблонов</h1>
      <p className="text-white/25 text-sm mb-4">Выберите минимум 2 шаблона для сравнения</p>
      <Link href="/templates" className="text-accent-light hover:text-accent-pale transition text-sm">
        Перейти в каталог →
      </Link>
    </main>
  )

  const cols = templates.length

  return (
    <main className="min-h-screen pt-[100px] pb-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-accent-light text-[11px] font-bold tracking-[2px] uppercase mb-1">Сравнение</p>
            <h1 className="font-display text-2xl font-bold">{cols} шаблона</h1>
          </div>
          <Link href="/templates" className="text-white/20 hover:text-white/40 text-sm transition">← В каталог</Link>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            {/* Header: previews + titles */}
            <thead>
              <tr>
                <th className="w-[140px]"></th>
                {templates.map(t => (
                  <th key={t.id} className="p-3 text-left align-top">
                    <Link href={`/templates/${t.slug}`} className="block group">
                      {t.preview_image && (
                        <div className="w-full aspect-[16/10] rounded-xl overflow-hidden bg-white/[0.02] mb-3 border border-white/[0.05] group-hover:border-accent/20 transition">
                          <img src={t.preview_image} alt={t.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <h3 className="text-sm font-bold group-hover:text-accent-pale transition">{t.title}</h3>
                    </Link>
                    <div className="flex gap-2 mt-2">
                      {t.demo_url && (
                        <a href={t.demo_url} target="_blank" rel="noopener"
                          className="text-[10px] text-accent-light/60 hover:text-accent-pale transition">Demo ↗</a>
                      )}
                      <Link href={`/templates/${t.slug}`}
                        className="text-[10px] text-white/20 hover:text-white/40 transition">Подробнее</Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {rows.map(row => (
                <tr key={row.key} className="border-t border-white/[0.03]">
                  <td className="py-3 px-3 text-white/25 text-xs font-medium">{row.label}</td>
                  {templates.map(t => (
                    <td key={t.id} className="py-3 px-3 text-sm">
                      {row.render ? row.render(t) : '—'}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Tags row */}
              <tr className="border-t border-white/[0.03]">
                <td className="py-3 px-3 text-white/25 text-xs font-medium">Теги</td>
                {templates.map(t => (
                  <td key={t.id} className="py-3 px-3">
                    {t.tags?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {t.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] bg-white/[0.04] text-white/25 px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    ) : <span className="text-white/10 text-xs">—</span>}
                  </td>
                ))}
              </tr>

              {/* Action row */}
              <tr className="border-t border-white/[0.03]">
                <td className="py-4 px-3"></td>
                {templates.map(t => (
                  <td key={t.id} className="py-4 px-3">
                    <Link href={`/templates/${t.slug}`}
                      className="inline-block bg-accent text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-accent-dark transition">
                      Купить за {t.price_rub.toLocaleString('ru-RU')} ₽
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
