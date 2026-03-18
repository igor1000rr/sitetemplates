'use client'

import { useCompare } from '@/stores/compare'
import Link from 'next/link'

export default function CompareBar() {
  const { items, remove, clear, isOpen } = useCompare()

  if (!isOpen || items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-card/95 backdrop-blur-lg border-t border-white/[0.05]">
      <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center gap-4">
        {/* Items */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-2 bg-white/[0.04] rounded-lg px-3 py-1.5 shrink-0">
              {item.preview_image && (
                <img src={item.preview_image} alt="" className="w-6 h-6 rounded object-cover" />
              )}
              <span className="text-sm text-white/50 max-w-[120px] truncate">{item.title}</span>
              <button onClick={() => remove(item.id)} className="text-white/15 hover:text-white/40 transition text-xs ml-1">✕</button>
            </div>
          ))}
          {items.length < 4 && (
            <span className="text-white/10 text-xs shrink-0">+{4 - items.length} ещё</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={clear} className="text-white/20 hover:text-white/40 text-xs transition">Очистить</button>
          <Link
            href={`/compare?ids=${items.map(i => i.id).join(',')}`}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
              items.length >= 2
                ? 'bg-accent text-white hover:bg-accent-dark'
                : 'bg-white/[0.05] text-white/20 pointer-events-none'
            }`}
          >
            Сравнить ({items.length})
          </Link>
        </div>
      </div>
    </div>
  )
}
