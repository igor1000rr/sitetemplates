'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authorApi } from '@/lib/api'
import { useAuth } from '@/stores/auth'

export default function AuthorRegister() {
  const router = useRouter()
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    display_name: user?.name || '',
    bio: '',
    specialization: '',
    website: '',
  })

  if (user?.role === 'author' || user?.role === 'admin') {
    router.push('/author')
    return null
  }

  const submit = async () => {
    if (!form.display_name) { setError('Укажите имя'); return }
    setLoading(true); setError('')
    try {
      await authorApi.register(form)
      setUser({ ...user!, role: 'author' })
      router.push('/author')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка регистрации')
    } finally { setLoading(false) }
  }

  const inputCls = 'w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15'

  return (
    <main className="min-h-screen pt-[120px] pb-16">
      <div className="max-w-[500px] mx-auto px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight mb-2">Стать автором</h1>
          <p className="text-white/30 text-sm">Загружайте шаблоны и зарабатывайте 70% от каждой продажи</p>
        </div>

        <div className="bg-bg-card rounded-2xl border border-white/[0.05] p-6 space-y-5">
          {error && <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}

          <div>
            <label className="block text-white/40 text-xs mb-1.5">Имя или название студии *</label>
            <input className={inputCls} value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="Иван Петров" />
          </div>

          <div>
            <label className="block text-white/40 text-xs mb-1.5">О себе</label>
            <textarea className={`${inputCls} min-h-[80px]`} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Опыт разработки, компетенции..." />
          </div>

          <div>
            <label className="block text-white/40 text-xs mb-1.5">Специализация</label>
            <select className={inputCls} value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}>
              <option value="">Не выбрана</option>
              <option value="WordPress">WordPress</option>
              <option value="Tilda">Tilda</option>
              <option value="Оба">Оба</option>
            </select>
          </div>

          <div>
            <label className="block text-white/40 text-xs mb-1.5">Сайт / портфолио</label>
            <input className={inputCls} value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://" />
          </div>

          <button onClick={submit} disabled={loading}
            className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent-dark transition disabled:opacity-50">
            {loading ? 'Регистрация...' : 'Стать автором'}
          </button>

          <div className="text-center space-y-2 pt-2">
            <div className="flex items-center gap-3 justify-center text-white/20 text-xs">
              <span>💰 70% от продаж</span>
              <span>·</span>
              <span>📊 Статистика</span>
              <span>·</span>
              <span>💳 Вывод на карту</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
