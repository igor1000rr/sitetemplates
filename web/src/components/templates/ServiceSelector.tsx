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

  if (!inCart) {
    return (
      <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white/80 mb-2">Дополнительные услуги</h3>
        <p className="text-xs text-white/40">
          Добавьте шаблон в корзину, чтобы выбрать доп. услуги: установка, SEO, наполнение и другие
        </p>
      </div>
    )
  }

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
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80">Дополнительные услуги</h3>
        {totalServices > 0 && (
          <span className="text-xs font-medium text-accent">
            +{totalServices.toLocaleString('ru-RU')} ₽
          </span>
        )}
      </div>

      <div className="space-y-2">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <p className="text-[11px] uppercase tracking-wider text-white/30 mb-1.5 px-1">
              {categoryIcons[cat]} {categoryLabels[cat] || cat}
            </p>
            {items.map((service) => {
              const isSelected = selectedServices.includes(service.id)
              return (
                <button
                  key={service.id}
                  onClick={() => toggleService(templateId, service.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all mb-1.5 ${
                    isSelected
                      ? 'bg-accent/10 border border-accent/30'
                      : 'bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition ${
                          isSelected ? 'bg-accent text-white' : 'bg-white/[0.06] border border-white/[0.12]'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
                        {service.name}
                      </span>
                      {service.is_popular && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                          Популярное
                        </span>
                      )}
                    </div>
                    {service.short_description && (
                      <p className="text-xs text-white/40 mt-0.5 ml-6 line-clamp-1">
                        {service.short_description}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <span className={`text-sm font-semibold ${isSelected ? 'text-accent' : 'text-white/60'}`}>
                      {service.price_rub.toLocaleString('ru-RU')} ₽
                    </span>
                    <p className="text-[10px] text-white/30">{service.estimated_days} дн.</p>
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
