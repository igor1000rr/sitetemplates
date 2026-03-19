'use client'

import { useState, useEffect } from 'react'
import { authorApi } from '@/lib/api'

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Ожидает', color: 'text-yellow-400' },
  processing: { label: 'В обработке', color: 'text-blue-400' },
  completed: { label: 'Выполнена', color: 'text-green-400' },
  rejected: { label: 'Отклонена', color: 'text-red-400' },
}

export default function AuthorPayouts() {
  const [payouts, setPayouts] = useState<any[]>([])
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const load = () => {
    Promise.all([authorApi.payouts(), authorApi.dashboard()])
      .then(([pRes, dRes]) => {
        setPayouts(pRes.data.data || [])
        setBalance(dRes.data.stats.balance_rub)
        setLoading(false)
      }).catch(() => setLoading(false))
  }

  useEffect(load, [])

  const requestPayout = async () => {
    setMessage({ text: '', type: '' })
    const amountKop = Math.round(parseFloat(amount) * 100)
    if (!amountKop || amountKop < 100000) {
      setMessage({ text: 'Минимальная сумма вывода — 1 000 ₽', type: 'error' })
      return
    }
    setSubmitting(true)
    try {
      const { data } = await authorApi.requestPayout(amountKop)
      setMessage({ text: data.message, type: 'success' })
      setAmount('')
      load()
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Ошибка', type: 'error' })
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="animate-pulse text-white/20">Загрузка...</div>

  return (
    <div className="space-y-8">
      {/* Balance + Request */}
      <div className="p-6 bg-bg-card rounded-2xl border border-white/[0.05]">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-white/25 text-xs uppercase tracking-wider mb-1">Доступный баланс</div>
            <div className="text-3xl font-extrabold text-accent-pale">{balance.toLocaleString('ru-RU')} ₽</div>
          </div>
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-white/30 text-xs mb-1.5">Сумма вывода (₽)</label>
            <input
              type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="1000" min="1000"
              className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15"
            />
          </div>
          <button onClick={requestPayout} disabled={submitting}
            className="bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dark transition disabled:opacity-50 shrink-0">
            {submitting ? 'Отправка...' : 'Вывести'}
          </button>
        </div>

        {message.text && (
          <div className={`mt-3 text-sm px-4 py-2 rounded-xl ${message.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
            {message.text}
          </div>
        )}

        <p className="text-white/10 text-xs mt-3">Мин. сумма: 1 000 ₽. Обработка: 1-3 рабочих дня. Убедитесь что реквизиты указаны в профиле.</p>
      </div>

      {/* History */}
      <div>
        <h3 className="text-sm font-bold mb-4">История выводов</h3>
        {payouts.length === 0 ? (
          <div className="text-white/15 text-sm text-center py-8 bg-bg-card rounded-xl border border-white/[0.05]">
            Заявок на вывод пока нет
          </div>
        ) : (
          <div className="space-y-2">
            {payouts.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-bg-card rounded-xl border border-white/[0.05]">
                <div>
                  <div className="text-sm font-semibold">{p.amount_rub.toLocaleString('ru-RU')} ₽</div>
                  <div className="text-white/20 text-xs">{p.method} · {p.details} · {p.created_at}</div>
                  {p.admin_note && <div className="text-white/25 text-xs mt-1">💬 {p.admin_note}</div>}
                </div>
                <span className={`text-xs font-medium ${statusMap[p.status]?.color || ''}`}>
                  {statusMap[p.status]?.label || p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
