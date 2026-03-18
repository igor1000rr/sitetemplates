'use client'

import { useRouter } from 'next/navigation'
import type { Category, Platform } from '@/types'

interface Props {
  categories: Category[]
  platforms: Platform[]
  current: Record<string, string | undefined>
}

const sortOptions = [
  { value: 'popular', label: 'Популярные' },
  { value: 'newest', label: 'Новинки' },
  { value: 'price_asc', label: 'Дешевле' },
  { value: 'price_desc', label: 'Дороже' },
  { value: 'rating', label: 'По рейтингу' },
]

const typeOptions = [
  { value: '', label: 'Все типы' },
  { value: 'landing', label: 'Лендинг' },
  { value: 'multipage', label: 'Многостраничный' },
  { value: 'shop', label: 'Магазин' },
  { value: 'quiz', label: 'Квиз' },
]

export default function CatalogFilters({ categories, platforms, current }: Props) {
  const router = useRouter()

  const navigate = (key: string, value: string) => {
    const sp = new URLSearchParams()
    Object.entries(current).forEach(([k, v]) => { if (v && k !== 'page') sp.set(k, v) })
    if (value) sp.set(key, value)
    else sp.delete(key)
    sp.delete('page')
    router.push(`/templates?${sp}`)
  }

  return (
    <aside className="w-full lg:w-[220px] shrink-0">
      <div className="sticky top-[110px] space-y-6">
        {/* Search */}
        <div>
          <label className="block text-white/25 text-[10px] font-bold uppercase tracking-wider mb-2">Поиск</label>
          <input
            type="text"
            defaultValue={current.search || ''}
            placeholder="Название, ниша..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('search', (e.target as HTMLInputElement).value)
            }}
            className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/12"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-white/25 text-[10px] font-bold uppercase tracking-wider mb-2">Ниша</label>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => navigate('category', '')}
              className={`text-left px-3 py-1.5 rounded-lg text-sm transition ${
                !current.category ? 'bg-accent/10 text-accent-pale font-semibold' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'
              }`}
            >
              Все ниши
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate('category', c.slug)}
                className={`text-left px-3 py-1.5 rounded-lg text-sm transition flex justify-between items-center ${
                  current.category === c.slug ? 'bg-accent/10 text-accent-pale font-semibold' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'
                }`}
              >
                <span className="truncate">{c.name}</span>
                {c.templates_count > 0 && (
                  <span className="text-white/12 text-xs ml-1">{c.templates_count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <label className="block text-white/25 text-[10px] font-bold uppercase tracking-wider mb-2">Платформа</label>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => navigate('platform', '')}
              className={`text-left px-3 py-1.5 rounded-lg text-sm transition ${
                !current.platform ? 'bg-accent/10 text-accent-pale font-semibold' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'
              }`}
            >
              Все
            </button>
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate('platform', p.slug)}
                className={`text-left px-3 py-1.5 rounded-lg text-sm transition ${
                  current.platform === p.slug ? 'bg-accent/10 text-accent-pale font-semibold' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-white/25 text-[10px] font-bold uppercase tracking-wider mb-2">Тип</label>
          <div className="flex flex-col gap-0.5">
            {typeOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => navigate('type', o.value)}
                className={`text-left px-3 py-1.5 rounded-lg text-sm transition ${
                  (current.type || '') === o.value ? 'bg-accent/10 text-accent-pale font-semibold' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-white/25 text-[10px] font-bold uppercase tracking-wider mb-2">Сортировка</label>
          <select
            value={current.sort || 'popular'}
            onChange={(e) => navigate('sort', e.target.value)}
            className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm outline-none appearance-auto"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Price range */}
        <div>
          <label className="block text-white/25 text-[10px] font-bold uppercase tracking-wider mb-2">Цена (₽)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="от"
              defaultValue={current.price_min || ''}
              onBlur={(e) => navigate('price_min', e.target.value)}
              className="w-1/2 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm outline-none placeholder:text-white/12"
            />
            <input
              type="number"
              placeholder="до"
              defaultValue={current.price_max || ''}
              onBlur={(e) => navigate('price_max', e.target.value)}
              className="w-1/2 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm outline-none placeholder:text-white/12"
            />
          </div>
        </div>

        {/* Reset */}
        {Object.keys(current).some(k => current[k]) && (
          <button
            onClick={() => router.push('/templates')}
            className="w-full text-center py-2 text-white/20 text-xs hover:text-white/50 transition"
          >
            Сбросить фильтры
          </button>
        )}
      </div>
    </aside>
  )
}
