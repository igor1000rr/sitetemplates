'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('pending')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/reviews', { params: { status } })
      setReviews(data.data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [status])

  const moderate = async (id: number, newStatus: 'approved' | 'rejected') => {
    try {
      await api.put(`/admin/reviews/${id}`, { status: newStatus })
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch {}
  }

  return (
    <div>
      <h2 className="font-display text-lg font-bold mb-6">Модерация отзывов</h2>

      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              status === s ? 'bg-accent/10 text-accent-pale' : 'bg-white/[0.03] text-white/30 hover:text-white/60'
            }`}>
            {s === 'pending' ? 'На модерации' : s === 'approved' ? 'Одобренные' : 'Отклонённые'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-bg-card rounded-xl border border-white/[0.05] animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-white/20">Отзывов нет</div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-bg-card rounded-xl border border-white/[0.05] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white/60 text-sm font-semibold">{r.user?.name || r.user?.email}</span>
                    <span className="text-white/15">→</span>
                    <span className="text-accent-light text-sm">{r.template?.title}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= r.rating ? '#a78bfa' : 'rgba(255,255,255,0.1)'}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-white/40 text-sm">{r.text}</p>
                  <span className="text-white/15 text-xs mt-1 block">{r.created_at}</span>
                </div>

                {status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => moderate(r.id, 'approved')}
                      className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-500/20 transition">
                      ✓ Одобрить
                    </button>
                    <button onClick={() => moderate(r.id, 'rejected')}
                      className="px-3 py-1.5 bg-white/[0.03] text-white/25 rounded-lg text-xs hover:text-red-400 hover:bg-red-500/10 transition">
                      ✗ Отклонить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
