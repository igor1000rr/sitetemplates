'use client'

import { useState, useEffect } from 'react'
import { wishlistApi } from '@/lib/api'
import Link from 'next/link'
import WishlistButton from '@/components/WishlistButton'

export default function AccountWishlist() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    wishlistApi.list()
      .then(({ data }) => setTemplates(data.data || [])).catch(() => {}).finally(() => setLoading(false))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="animate-pulse text-white/20">Загрузка...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Избранное</h2>
        <span className="text-white/15 text-sm">{templates.length} шаблонов</span>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 bg-bg-card rounded-xl border border-white/[0.05]">
          <div className="text-white/10 text-4xl mb-3">♡</div>
          <p className="text-white/20 text-sm mb-3">В избранном пусто</p>
          <Link href="/templates" className="text-accent-light hover:text-accent-pale transition text-sm">
            Перейти в каталог →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {templates.map((t: any) => (
            <div key={t.id} className="flex items-center gap-4 p-4 bg-bg-card rounded-xl border border-white/[0.05] group">
              <Link href={`/templates/${t.slug}`} className="shrink-0">
                {t.preview_image ? (
                  <img src={t.preview_image} alt={t.title}
                    className="w-20 h-14 rounded-lg object-cover bg-white/[0.02]" />
                ) : (
                  <div className="w-20 h-14 rounded-lg bg-white/[0.02]" />
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/templates/${t.slug}`} className="font-medium text-sm hover:text-accent-pale transition block truncate">
                  {t.title}
                </Link>
                <div className="text-white/15 text-xs mt-0.5">
                  {t.category && <span>{t.category}</span>}
                  {t.platform && <span> · {t.platform}</span>}
                  {t.rating && <span> · ⭐ {t.rating}</span>}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-bold text-sm">{t.price_rub?.toLocaleString('ru-RU')} ₽</div>
                {t.old_price_rub && (
                  <div className="text-white/10 text-xs line-through">{t.old_price_rub.toLocaleString('ru-RU')} ₽</div>
                )}
              </div>

              <WishlistButton templateId={t.id} initialInWishlist={true} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
