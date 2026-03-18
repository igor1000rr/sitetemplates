'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    code: '', discount_type: 'percent', discount_value: '',
    min_order: '', max_uses: '', expires_at: '',
  })

  const load = async () => {
    try {
      // Используем admin endpoint для промокодов
      const { data } = await api.get('/admin/promo')
      setPromos(data.data || data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/admin/promo', {
        ...form,
        code: form.code.toUpperCase(),
        discount_value: parseInt(form.discount_value) * (form.discount_type === 'fixed' ? 100 : 1),
        min_order: form.min_order ? parseInt(form.min_order) * 100 : null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
      })
      setShowForm(false)
      setForm({ code: '', discount_type: 'percent', discount_value: '', min_order: '', max_uses: '', expires_at: '' })
      load()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка создания')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg font-bold">Промокоды</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-accent text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
          {showForm ? 'Отмена' : '+ Создать'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-bg-card rounded-xl border border-white/[0.05] p-5 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-white/25 text-[10px] uppercase tracking-wider mb-1">Код</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required
                className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm outline-none" placeholder="СКИДКА20" />
            </div>
            <div>
              <label className="block text-white/25 text-[10px] uppercase tracking-wider mb-1">Тип</label>
              <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))}
                className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm">
                <option value="percent">Процент</option>
                <option value="fixed">Фикс. сумма (₽)</option>
              </select>
            </div>
            <div>
              <label className="block text-white/25 text-[10px] uppercase tracking-wider mb-1">
                Значение {form.discount_type === 'percent' ? '(%)' : '(₽)'}
              </label>
              <input type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))} required
                className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm outline-none" placeholder="20" />
            </div>
            <div>
              <label className="block text-white/25 text-[10px] uppercase tracking-wider mb-1">Мин. заказ (₽)</label>
              <input type="number" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))}
                className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm outline-none" placeholder="Без ограничения" />
            </div>
            <div>
              <label className="block text-white/25 text-[10px] uppercase tracking-wider mb-1">Макс. использований</label>
              <input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm outline-none" placeholder="Безлимит" />
            </div>
            <div>
              <label className="block text-white/25 text-[10px] uppercase tracking-wider mb-1">Истекает</label>
              <input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm outline-none" />
            </div>
          </div>
          <button type="submit" className="bg-accent text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
            Создать промокод
          </button>
        </form>
      )}

      {/* List */}
      <div className="bg-bg-card rounded-xl border border-white/[0.05] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.05] text-left text-white/25 text-xs uppercase tracking-wider">
              <th className="px-5 py-3">Код</th>
              <th className="px-5 py-3">Скидка</th>
              <th className="px-5 py-3">Использований</th>
              <th className="px-5 py-3">Истекает</th>
              <th className="px-5 py-3">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-white/20">Загрузка...</td></tr>
            ) : promos.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-white/20">Промокодов нет</td></tr>
            ) : promos.map((p: any) => (
              <tr key={p.id}>
                <td className="px-5 py-3 text-accent-pale font-mono font-bold">{p.code}</td>
                <td className="px-5 py-3 text-white/50">
                  {p.discount_type === 'percent' ? `${p.discount_value}%` : `${p.discount_value / 100} ₽`}
                </td>
                <td className="px-5 py-3 text-white/30">{p.used_count} {p.max_uses ? `/ ${p.max_uses}` : ''}</td>
                <td className="px-5 py-3 text-white/25 text-xs">{p.expires_at || '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold ${p.is_active ? 'text-green-400' : 'text-white/20'}`}>
                    {p.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
