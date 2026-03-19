'use client'

import { useState, useEffect } from 'react'
import { subscriptionApi } from '@/lib/api'
import Link from 'next/link'

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'Активна', color: 'text-green-400' },
  cancelled: { label: 'Отменена', color: 'text-yellow-400' },
  expired: { label: 'Истекла', color: 'text-white/30' },
  past_due: { label: 'Просрочена', color: 'text-red-400' },
}

export default function AccountSubscription() {
  const [sub, setSub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    subscriptionApi.my().then(({ data }) => { setSub(data.subscription); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const cancelSub = async () => {
    if (!confirm('Отменить подписку? Доступ сохранится до конца оплаченного периода.')) return
    setCancelling(true)
    try {
      const { data } = await subscriptionApi.cancel()
      alert(data.message)
      // Refresh
      const { data: d2 } = await subscriptionApi.my()
      setSub(d2.subscription)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка')
    } finally { setCancelling(false) }
  }

  if (loading) return <div className="animate-pulse text-white/20">Загрузка...</div>

  // Нет подписки
  if (!sub) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h2 className="text-lg font-bold mb-2">Подписка не оформлена</h2>
        <p className="text-white/25 text-sm mb-4">Оформите подписку для безлимитного доступа ко всем шаблонам</p>
        <Link href="/pricing" className="inline-block bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
          Выбрать тариф
        </Link>
      </div>
    )
  }

  const st = statusLabels[sub.status] || { label: sub.status, color: '' }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Подписка</h2>

      {/* Status card */}
      <div className="p-6 bg-bg-card rounded-2xl border border-white/[0.05]">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xl font-bold">{sub.plan.name}</span>
              <span className={`text-xs font-medium ${st.color}`}>{st.label}</span>
            </div>
            <div className="text-white/25 text-sm">
              {sub.billing_cycle === 'annual' ? 'Годовая' : 'Ежемесячная'} · {sub.price_paid_rub.toLocaleString('ru-RU')} ₽
            </div>
          </div>
          {sub.is_active && sub.status !== 'cancelled' && (
            <button onClick={cancelSub} disabled={cancelling}
              className="text-red-400/50 hover:text-red-400 text-xs transition disabled:opacity-50">
              Отменить
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-white/[0.02] rounded-xl">
            <div className="text-white/20 text-[10px] uppercase tracking-wider mb-1">Статус</div>
            <div className={`text-sm font-bold ${st.color}`}>{st.label}</div>
          </div>
          <div className="p-3 bg-white/[0.02] rounded-xl">
            <div className="text-white/20 text-[10px] uppercase tracking-wider mb-1">До</div>
            <div className="text-sm font-bold">{sub.current_period_end || '—'}</div>
          </div>
          <div className="p-3 bg-white/[0.02] rounded-xl">
            <div className="text-white/20 text-[10px] uppercase tracking-wider mb-1">Осталось дней</div>
            <div className="text-sm font-bold">{sub.days_left}</div>
          </div>
          <div className="p-3 bg-white/[0.02] rounded-xl">
            <div className="text-white/20 text-[10px] uppercase tracking-wider mb-1">Скачиваний</div>
            <div className="text-sm font-bold">
              {sub.plan.downloads_per_month === -1
                ? `${sub.downloads_used} / ∞`
                : `${sub.downloads_used} / ${sub.plan.downloads_per_month}`}
            </div>
          </div>
        </div>

        {sub.status === 'cancelled' && sub.is_active && (
          <div className="mt-4 p-3 bg-yellow-500/[0.06] border border-yellow-500/10 rounded-xl text-yellow-400 text-sm">
            Подписка отменена. Доступ сохраняется до {sub.current_period_end}.
          </div>
        )}

        {!sub.is_active && (
          <div className="mt-4 text-center">
            <Link href="/pricing" className="text-accent-light hover:text-accent-pale transition text-sm">
              Возобновить подписку →
            </Link>
          </div>
        )}
      </div>

      {/* Quick access */}
      {sub.is_active && (
        <div className="p-5 bg-accent/[0.04] border border-accent/10 rounded-2xl text-center">
          <p className="text-white/30 text-sm mb-3">Скачивайте любые шаблоны из каталога</p>
          <Link href="/templates" className="inline-block bg-accent text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
            Перейти в каталог
          </Link>
        </div>
      )}
    </div>
  )
}
