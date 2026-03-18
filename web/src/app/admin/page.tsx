'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import Link from 'next/link'

interface DashboardData {
  stats: {
    total_revenue: number
    month_revenue: number
    today_revenue: number
    total_orders: number
    month_orders: number
    today_orders: number
    total_users: number
    month_users: number
    total_templates: number
    total_downloads: number
    pending_orders: number
    pending_reviews: number
  }
  recent_orders: any[]
  top_templates: any[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => {
      setData(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return <div className="animate-pulse space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-20 bg-bg-card rounded-xl border border-white/[0.05]" />)}
    </div>
  }

  const { stats } = data
  const fmt = (v: number) => (v / 100).toLocaleString('ru-RU')

  return (
    <div>
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Выручка за всё время', value: `${fmt(stats.total_revenue)} ₽`, accent: true },
          { label: 'Выручка за месяц', value: `${fmt(stats.month_revenue)} ₽` },
          { label: 'Выручка сегодня', value: `${fmt(stats.today_revenue)} ₽` },
          { label: 'Всего заказов', value: stats.total_orders },
          { label: 'Заказов за месяц', value: stats.month_orders },
          { label: 'Заказов сегодня', value: stats.today_orders },
          { label: 'Пользователей', value: stats.total_users },
          { label: 'Скачиваний', value: stats.total_downloads },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.accent ? 'bg-accent/[0.04] border-accent/15' : 'bg-bg-card border-white/[0.05]'}`}>
            <div className="text-white/25 text-[11px] uppercase tracking-wider mb-1">{s.label}</div>
            <div className={`text-xl font-bold tracking-tight ${s.accent ? 'text-accent-pale' : 'text-white/80'}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(stats.pending_orders > 0 || stats.pending_reviews > 0) && (
        <div className="flex gap-3 mb-8">
          {stats.pending_orders > 0 && (
            <Link href="/admin/orders?status=pending" className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-500/15 transition">
              ⏳ {stats.pending_orders} неоплаченных заказов
            </Link>
          )}
          {stats.pending_reviews > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-xl text-sm font-semibold">
              💬 {stats.pending_reviews} отзывов на модерации
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-bg-card rounded-xl border border-white/[0.05]">
          <div className="px-5 py-4 border-b border-white/[0.04] flex justify-between items-center">
            <h3 className="text-sm font-bold">Последние заказы</h3>
            <Link href="/admin/orders" className="text-accent-light text-xs hover:text-accent-pale transition">Все →</Link>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {data.recent_orders.map((o: any) => (
              <div key={o.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <span className="text-white/60 text-sm font-medium">{o.order_number}</span>
                  <span className="text-white/20 text-xs ml-2">{o.user}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${
                    o.status === 'paid' ? 'text-green-400' :
                    o.status === 'pending' ? 'text-yellow-400' : 'text-white/30'
                  }`}>{o.status}</span>
                  <span className="text-white/50 text-sm font-bold">{o.total_rub.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top templates */}
        <div className="bg-bg-card rounded-xl border border-white/[0.05]">
          <div className="px-5 py-4 border-b border-white/[0.04] flex justify-between items-center">
            <h3 className="text-sm font-bold">Топ шаблонов</h3>
            <Link href="/admin/templates" className="text-accent-light text-xs hover:text-accent-pale transition">Все →</Link>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {data.top_templates.map((t: any, i: number) => (
              <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-accent-pale/50 text-xs font-bold w-5">#{i + 1}</span>
                  <span className="text-white/60 text-sm">{t.title}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span>{t.sales_count} продаж</span>
                  <span>⭐ {t.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
