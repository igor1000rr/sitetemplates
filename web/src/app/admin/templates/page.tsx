'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import Link from 'next/link'

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [meta, setMeta] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  const load = async (page = 1) => {
    setLoading(true)
    try {
      const params: any = { page }
      if (status) params.status = status
      const { data } = await api.get('/admin/templates', { params })
      setTemplates(data.data || [])
      setMeta(data.meta || {})
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [status])

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить шаблон?')) return
    try {
      await api.delete(`/admin/templates/${id}`)
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка удаления')
    }
  }

  const toggleStatus = async (id: number, current: string) => {
    const newStatus = current === 'published' ? 'draft' : 'published'
    try {
      await api.put(`/admin/templates/${id}`, { status: newStatus })
      setTemplates((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t))
    } catch {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg font-bold">Шаблоны</h2>
        <Link
          href="/admin/templates/new"
          className="bg-accent text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-accent-dark transition"
        >
          + Добавить
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['', 'published', 'draft', 'archived'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              status === s ? 'bg-accent/10 text-accent-pale' : 'bg-white/[0.03] text-white/30 hover:text-white/60'
            }`}
          >
            {s === '' ? 'Все' : s === 'published' ? 'Опубликованные' : s === 'draft' ? 'Черновики' : 'Архив'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-bg-card rounded-xl border border-white/[0.05] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.05] text-left text-white/25 text-xs uppercase tracking-wider">
                <th className="px-5 py-3">Шаблон</th>
                <th className="px-5 py-3">Платформа</th>
                <th className="px-5 py-3">Цена</th>
                <th className="px-5 py-3">Продажи</th>
                <th className="px-5 py-3">Статус</th>
                <th className="px-5 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-4"><div className="h-4 bg-white/[0.03] rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : templates.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-white/20">Шаблоны не найдены</td></tr>
              ) : templates.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.01] transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {t.main_image?.path ? (
                        <img src={t.main_image.path} alt="" className="w-12 h-8 rounded object-cover bg-bg-surface" />
                      ) : (
                        <div className="w-12 h-8 rounded bg-bg-surface" />
                      )}
                      <div>
                        <div className="text-white/70 font-medium line-clamp-1">{t.title}</div>
                        <div className="text-white/20 text-xs">{t.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-white/40">{t.platform?.name}</td>
                  <td className="px-5 py-3">
                    <span className="text-accent-pale font-semibold">{(t.price / 100).toLocaleString('ru-RU')} ₽</span>
                    {t.old_price && <span className="text-white/15 text-xs ml-1 line-through">{(t.old_price / 100).toLocaleString('ru-RU')}</span>}
                  </td>
                  <td className="px-5 py-3 text-white/40">{t.sales_count}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleStatus(t.id, t.status)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      t.status === 'published' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' :
                      t.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' :
                      'bg-white/[0.03] text-white/30'
                    }`}>
                      {t.status}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Link href={`/admin/templates/${t.id}`}
                        className="px-3 py-1.5 bg-white/[0.03] rounded-lg text-xs text-white/40 hover:text-white/70 transition">
                        Ред.
                      </Link>
                      <button onClick={() => handleDelete(t.id)}
                        className="px-3 py-1.5 bg-white/[0.03] rounded-lg text-xs text-white/25 hover:text-red-400 hover:bg-red-500/10 transition">
                        Удал.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => load(p)}
              className={`w-8 h-8 rounded-lg text-xs transition ${
                p === meta.current_page ? 'bg-accent text-white' : 'bg-white/[0.03] text-white/30 hover:text-white/60'
              }`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
