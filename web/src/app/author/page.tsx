'use client'

import { useState, useEffect } from 'react'
import { authorApi } from '@/lib/api'
import Link from 'next/link'

export default function AuthorDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authorApi.dashboard().then(({ data }) => { setData(data); setLoading(false) })
  }, [])

  if (loading) return <div className="animate-pulse text-white/20">Загрузка...</div>

  const { stats, recent_sales, top_templates, profile, chart } = data

  const statCards = [
    { label: 'Баланс', value: `${stats.balance_rub.toLocaleString('ru-RU')} ₽`, accent: true },
    { label: 'Заработано всего', value: `${stats.total_earned_rub.toLocaleString('ru-RU')} ₽` },
    { label: 'За месяц', value: `${stats.month_earnings_rub.toLocaleString('ru-RU')} ₽` },
    { label: 'Продаж всего', value: stats.total_sales },
    { label: 'Продаж за месяц', value: stats.month_sales },
    { label: 'Шаблонов', value: `${stats.published_templates} / ${stats.total_templates}` },
  ]

  return (
    <div className="space-y-8">
      {/* Profile bar */}
      <div className="flex items-center gap-4 p-4 bg-bg-card rounded-2xl border border-white/[0.05]">
        <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center text-accent-pale font-bold text-lg">
          {profile.display_name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-semibold flex items-center gap-2">
            {profile.display_name}
            {profile.is_verified && <span className="text-green-400 text-xs">✓ Верифицирован</span>}
          </div>
          <div className="text-white/25 text-xs">Комиссия: {profile.commission}% от продаж</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.accent ? 'bg-accent/[0.06] border-accent/15' : 'bg-bg-card border-white/[0.05]'}`}>
            <div className="text-white/25 text-[11px] uppercase tracking-wider mb-1">{s.label}</div>
            <div className={`text-xl font-bold ${s.accent ? 'text-accent-pale' : ''}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Pending */}
      {(stats.pending_templates > 0 || stats.pending_payouts_rub > 0) && (
        <div className="flex gap-3 flex-wrap">
          {stats.pending_templates > 0 && (
            <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-xl text-sm">
              <span className="w-2 h-2 bg-yellow-400 rounded-full" />
              {stats.pending_templates} шаблон(ов) на модерации
            </div>
          )}
          {stats.pending_payouts_rub > 0 && (
            <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl text-sm">
              Ожидает вывода: {stats.pending_payouts_rub.toLocaleString('ru-RU')} ₽
            </div>
          )}
        </div>
      )}

      {/* Earnings chart */}
      {chart && chart.length > 0 && (() => {
        const maxVal = Math.max(...chart.map((c: any) => c.total_rub), 1)
        return (
          <div className="bg-bg-card rounded-2xl border border-white/[0.05] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Доход по месяцам</h3>
              <span className="text-white/20 text-xs">Последние 6 мес</span>
            </div>
            <div className="flex items-end gap-2 h-[140px]">
              {chart.map((c: any) => {
                const pct = maxVal > 0 ? (c.total_rub / maxVal) * 100 : 0
                return (
                  <div key={c.month} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="text-[10px] text-white/0 group-hover:text-accent-pale transition font-bold">
                      {c.total_rub > 0 ? `${c.total_rub.toLocaleString('ru-RU')} ₽` : '–'}
                    </div>
                    <div className="w-full flex justify-center flex-1 items-end">
                      <div
                        className="w-full max-w-[40px] rounded-t-lg bg-accent/20 group-hover:bg-accent/40 transition-all relative"
                        style={{ height: `${Math.max(pct, 3)}%` }}
                      >
                        {c.sales > 0 && (
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-white/0 group-hover:text-white/40 transition whitespace-nowrap">
                            {c.sales} продаж
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] text-white/25 mt-1">{c.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent sales */}
        <div>
          <h3 className="text-sm font-bold mb-3">Последние продажи</h3>
          {recent_sales.length === 0 ? (
            <div className="text-white/15 text-sm p-6 bg-bg-card rounded-xl border border-white/[0.05] text-center">Продаж пока нет</div>
          ) : (
            <div className="space-y-2">
              {recent_sales.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-bg-card rounded-xl border border-white/[0.05]">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{s.template}</div>
                    <div className="text-white/20 text-xs">{s.date}</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-accent-pale text-sm font-bold">+{s.author_amount_rub.toLocaleString('ru-RU')} ₽</div>
                    <div className="text-white/15 text-[10px]">из {s.sale_amount_rub.toLocaleString('ru-RU')} ₽</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top templates */}
        <div>
          <h3 className="text-sm font-bold mb-3">Топ шаблоны</h3>
          {top_templates.length === 0 ? (
            <div className="text-white/15 text-sm p-6 bg-bg-card rounded-xl border border-white/[0.05] text-center">
              <Link href="/author/templates/new" className="text-accent-light hover:text-accent-pale transition">Загрузите первый шаблон →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {top_templates.map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-bg-card rounded-xl border border-white/[0.05]">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-white/15 text-xs font-bold w-5">#{i + 1}</span>
                    <div className="text-sm font-medium truncate">{t.template}</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-sm font-bold">{t.total_rub.toLocaleString('ru-RU')} ₽</div>
                    <div className="text-white/20 text-xs">{t.sales} продаж</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
