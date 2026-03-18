'use client'

import { useState, useEffect } from 'react'
import { ordersApi } from '@/lib/api'
import { statusLabel, statusColor } from '@/lib/utils'
import type { Order } from '@/types'
import Link from 'next/link'

export default function AccountPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  const loadOrders = (p: number) => {
    setLoading(true)
    ordersApi.list({ page: p, per_page: 10 }).then(({ data }) => {
      setOrders(data.data || [])
      setLastPage(data.meta?.last_page || 1)
      setPage(p)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { loadOrders(1) }, [])

  const handleDownload = async (orderId: number, templateId: number) => {
    const key = `${orderId}-${templateId}`
    setDownloading(key)
    try {
      const { data } = await ordersApi.download(orderId, templateId)
      window.open(data.download_url, '_blank')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка скачивания')
    } finally {
      setDownloading(null)
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-card rounded-xl border border-white/[0.05] p-5 animate-pulse">
            <div className="h-4 bg-white/[0.03] rounded w-1/3 mb-3" />
            <div className="h-3 bg-white/[0.03] rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
          </svg>
        </div>
        <h2 className="font-display text-lg font-bold mb-2">Покупок пока нет</h2>
        <p className="text-white/25 text-sm mb-5">Выберите шаблон и создайте сайт за 3 минуты</p>
        <Link href="/templates" className="inline-flex bg-accent text-white px-7 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
          Каталог шаблонов
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className={`bg-bg-card rounded-xl border border-white/[0.05] overflow-hidden ${loading ? 'opacity-50' : ''}`}>
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.04] flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <span className="text-white/50 text-sm font-semibold">{order.order_number}</span>
              <span className={`text-xs font-semibold ${statusColor(order.status)}`}>
                {statusLabel(order.status)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/25">
              <span>{order.created_at}</span>
              <span className="text-accent-pale font-bold">{order.total_rub.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          {/* Items */}
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.03] last:border-0">
              <div className="w-[80px] h-[50px] rounded-lg overflow-hidden bg-bg-surface shrink-0">
                {item.template?.image && <img src={item.template.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/templates/${item.template?.slug || ''}`} className="text-sm font-medium hover:text-accent-light transition line-clamp-1">
                  {item.template?.title || 'Шаблон'}
                </Link>
                <span className="text-white/15 text-xs">{item.template?.platform}</span>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <span className="text-white/30 text-sm">{item.price_rub.toLocaleString('ru-RU')} ₽</span>
                {order.status === 'paid' && (
                  <button
                    onClick={() => handleDownload(order.id, item.template_id)}
                    disabled={downloading === `${order.id}-${item.template_id}`}
                    className="flex items-center gap-1.5 bg-accent/10 text-accent-light px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-accent/20 transition disabled:opacity-50"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    {downloading === `${order.id}-${item.template_id}` ? '...' : 'Скачать'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => loadOrders(page - 1)}
            disabled={page <= 1}
            className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 disabled:opacity-30 hover:bg-white/[0.06] transition"
          >←</button>
          {Array.from({ length: lastPage }, (_, i) => i + 1)
            .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
            .map((p, idx, arr) => (
              <span key={p} className="contents">
                {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-white/15 text-xs px-1">…</span>}
                <button
                  onClick={() => loadOrders(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                    p === page
                      ? 'bg-accent/20 text-accent-pale border border-accent/30'
                      : 'bg-white/[0.03] border border-white/[0.06] text-white/30 hover:bg-white/[0.06]'
                  }`}
                >{p}</button>
              </span>
            ))
          }
          <button
            onClick={() => loadOrders(page + 1)}
            disabled={page >= lastPage}
            className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 disabled:opacity-30 hover:bg-white/[0.06] transition"
          >→</button>
        </div>
      )}
    </div>
  )
}
