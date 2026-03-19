'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/stores/cart'
import { servicesApi } from '@/lib/api'
import type { Service } from '@/types'

interface Props {
  templateId: number
}

const categoryLabels: Record<string, string> = {
  installation: 'Установка',
  seo: 'SEO',
  content: 'Контент',
  analytics: 'Аналитика',
  support: 'Поддержка',
  other: 'Другое',
}

const categoryIcons: Record<string, string> = {
  installation: '🔧',
  seo: '🔍',
  content: '✍️',
  analytics: '📊',
  support: '🛡️',
  other: '⚙️',
}

export default function ServiceSelector({ templateId }: Props) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const { hasItem, toggleService, getItemServices } = useCart()
  const inCart = hasItem(templateId)
  const selectedServices = getItemServices(templateId)

  useEffect(() => {
    servicesApi.list()
      .then(({ data }) => setServices(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || services.length === 0) return null

  const grouped = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {} as Record<string, Service[]>)

  const totalServices = selectedServices.reduce((sum, sId) => {
    const s = services.find((sv) => sv.id === sId)
    return sum + (s?.price_rub || 0)
  }, 0)

  return (
    <div className="mt-5 pt-5 border-t border-white/[0.05]">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <h3 className="text-sm font-bold text-white/90">Дополнительные услуги</h3>
        </div>
        {totalServices > 0 && (
          <span className="text-sm font-bold text-accent animate-pulse-slow">
            +{totalServices.toLocaleString('ru-RU')} ₽
          </span>
        )}
      </div>

      {/* Подсказка если не в корзине */}
      {!inCart && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-accent/[0.06] border border-accent/15">
          <p className="text-[11px] text-accent-pale/70">
            ☝️ Добавьте шаблон в корзину, чтобы выбрать услуги
          </p>
        </div>
      )}

      {/* Услуги */}
      <div className="space-y-2">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <p className="text-[10px] uppercase tracking-wider text-white/25 mb-1.5 px-1 font-semibold">
              {categoryIcons[cat]} {categoryLabels[cat] || cat}
            </p>
            {items.map((service) => {
              const isSelected = selectedServices.includes(service.id)
              return (
                <button
                  key={service.id}
                  disabled={!inCart}
                  onClick={() => toggleService(templateId, service.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200 mb-1.5 group ${
                    isSelected
                      ? 'bg-accent/10 border border-accent/30 shadow-[0_0_15px_rgba(139,92,246,0.08)]'
                      : inCart
                        ? 'bg-white/[0.02] border border-white/[0.06] hover:border-accent/20 hover:bg-accent/[0.03]'
                        : 'bg-white/[0.02] border border-white/[0.04] opacity-60'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                          isSelected
                            ? 'bg-accent text-white scale-110'
                            : 'bg-white/[0.06] border border-white/[0.15] group-hover:border-accent/30'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className={`text-[13px] font-semibold ${isSelected ? 'text-white' : 'text-white/70'}`}>
                          {service.name}
                        </span>
                        {service.is_popular && (
                          <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold uppercase tracking-wider">
                            Хит
                          </span>
                        )}
                        {service.short_description && (
                          <p className="text-[11px] text-white/30 mt-0.5 line-clamp-1">
                            {service.short_description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <span className={`text-[14px] font-bold ${isSelected ? 'text-accent-pale' : 'text-white/50'}`}>
                      +{service.price_rub.toLocaleString('ru-RU')} ₽
                    </span>
                    <p className="text-[10px] text-white/20">{service.estimated_days} дн.</p>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
