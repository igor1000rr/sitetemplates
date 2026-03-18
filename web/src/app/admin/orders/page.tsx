'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { statusLabel, statusColor } from '@/lib/utils'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [meta, setMeta] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const load = async (page = 1) => {
    setLoading(true)
    const params: any = { page }
    if (status) params.status = status
    if (search) params.search = search
    try {
      const { data } = await api.get('/admin/orders', { params })
      setOrders(data.data || [])
      setMeta(data.meta || {})
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [status])

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${id}`, { status: newStatus })
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
    } catch {}
  }

  return (
    <div>
      <h2 className="font-display text-lg font-bold mb-6">Заказы</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1.5">
          {['', 'pending', 'paid', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                status === s ? 'bg-accent/10 text-accent-pale' : 'bg-white/[0.03] text-white/30 hover:text-white/60'
              }`}>
              {s === '' ? 'Все' : statusLabel(s)}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); load() }} className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Номер или email..."
            className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-white outline-none focus:border-accent/30 placeholder:text-white/15 w-48" />
          <button type="submit" className="px-3 py-1.5 bg-white/[0.04] rounded-lg text-xs text-white/40 hover:text-white/70 transition">Найти</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-bg-card rounded-xl border border-white/[0.05] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.05] text-left text-white/25 text-xs uppercase tracking-wider">
              <th className="px-5 py-3">Заказ</th>
              <th className="px-5 py-3">Клиент</th>
              <th className="px-5 py-3">Шаблоны</th>
              <th className="px-5 py-3">Сумма</th>
              <th className="px-5 py-3">Статус</th>
              <th className="px-5 py-3">Дата</th>
              <th className="px-5 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 bg-white/[0.03] rounded animate-pulse" /></td></tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-white/20">Заказы не найдены</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="hover:bg-white/[0.01]">
                <td className="px-5 py-3 text-white/60 font-medium">{o.order_number}</td>
                <td className="px-5 py-3 text-white/40">{o.user?.name || o.user?.email || '—'}</td>
                <td className="px-5 py-3 text-white/30">
                  {o.items?.map((i: any) => i.template?.title || 'Шаблон').join(', ') || '—'}
                </td>
                <td className="px-5 py-3 text-accent-pale font-semibold">{o.total_rub?.toLocaleString('ru-RU')} ₽</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold ${statusColor(o.status)}`}>{statusLabel(o.status)}</span>
                </td>
                <td className="px-5 py-3 text-white/25 text-xs">{o.created_at}</td>
                <td className="px-5 py-3 text-right">
                  {o.status === 'pending' && (
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => updateStatus(o.id, 'paid')}
                        className="px-2.5 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-500/20 transition">
                        Оплачен
                      </button>
                      <button onClick={() => updateStatus(o.id, 'cancelled')}
                        className="px-2.5 py-1 bg-white/[0.03] text-white/25 rounded-lg text-xs hover:text-red-400 transition">
                        Отменить
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
