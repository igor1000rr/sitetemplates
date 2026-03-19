'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  processing: 'bg-blue-500/10 text-blue-400',
  completed: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
}

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<any[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [pendingTotal, setPendingTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const load = () => {
    adminApi.payouts({ status: filter || undefined }).then(({ data }) => {
      setPayouts(data.data || [])
      setPendingCount(data.pending_count)
      setPendingTotal(data.pending_total_rub)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(load, [filter])

  const updateStatus = async (id: number, status: string, note?: string) => {
    await adminApi.payoutUpdate(id, { status, admin_note: note })
    load()
  }

  if (loading) return <div className="animate-pulse text-white/20">Загрузка...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold">Выплаты авторам</h2>
          {pendingCount > 0 && (
            <p className="text-yellow-400 text-xs mt-1">{pendingCount} ожидают · {pendingTotal.toLocaleString('ru-RU')} ₽</p>
          )}
        </div>
        <div className="flex gap-1">
          {['', 'pending', 'processing', 'completed', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs transition ${filter === s ? 'bg-accent/15 text-accent-pale' : 'text-white/25 hover:text-white/50'}`}>
              {s === '' ? 'Все' : s === 'pending' ? 'Ожидают' : s === 'processing' ? 'В работе' : s === 'completed' ? 'Готово' : 'Отклонены'}
            </button>
          ))}
        </div>
      </div>

      {payouts.length === 0 ? (
        <div className="text-white/15 text-sm text-center py-12">Нет заявок</div>
      ) : (
        <div className="space-y-3">
          {payouts.map((p: any) => (
            <div key={p.id} className="p-4 bg-bg-card rounded-xl border border-white/[0.05]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">{p.amount_rub.toLocaleString('ru-RU')} ₽</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${statusColors[p.status]}`}>{p.status}</span>
                  </div>
                  <div className="text-white/30 text-xs">
                    {p.author.name} ({p.author.email}) · {p.method} · {p.details}
                  </div>
                  <div className="text-white/15 text-xs mt-1">{p.created_at}</div>
                  {p.admin_note && <div className="text-white/25 text-xs mt-1">💬 {p.admin_note}</div>}
                </div>

                {p.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => updateStatus(p.id, 'processing')}
                      className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition">
                      В работу
                    </button>
                    <button onClick={() => updateStatus(p.id, 'rejected', prompt('Причина отклонения:') || '')}
                      className="bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/20 transition">
                      Отклонить
                    </button>
                  </div>
                )}

                {p.status === 'processing' && (
                  <button onClick={() => updateStatus(p.id, 'completed')}
                    className="bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-500/20 transition shrink-0">
                    Выплачено ✓
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
