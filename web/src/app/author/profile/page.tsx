'use client'

import { useState, useEffect } from 'react'
import { authorApi } from '@/lib/api'

export default function AuthorProfile() {
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    authorApi.profile().then(({ data }) => { setForm(data.profile); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true); setMessage('')
    try {
      await authorApi.updateProfile(form)
      setMessage('Профиль сохранён')
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Ошибка')
    } finally { setSaving(false) }
  }

  if (loading || !form) return <div className="animate-pulse text-white/20">Загрузка...</div>

  const inputCls = 'w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15'

  return (
    <div className="max-w-[600px] space-y-6">
      <h2 className="text-lg font-bold">Профиль автора</h2>

      {message && <div className={`text-sm px-4 py-2 rounded-xl ${message.includes('Ошибка') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{message}</div>}

      <div>
        <label className="block text-white/40 text-xs mb-1.5">Имя / Название</label>
        <input className={inputCls} value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} />
      </div>

      <div>
        <label className="block text-white/40 text-xs mb-1.5">О себе</label>
        <textarea className={`${inputCls} min-h-[80px]`} value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Расскажите о себе..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/40 text-xs mb-1.5">Специализация</label>
          <select className={inputCls} value={form.specialization || ''} onChange={e => setForm({ ...form, specialization: e.target.value })}>
            <option value="">Не выбрана</option>
            <option value="WordPress">WordPress</option>
            <option value="Tilda">Tilda</option>
            <option value="Оба">Оба</option>
          </select>
        </div>
        <div>
          <label className="block text-white/40 text-xs mb-1.5">Сайт</label>
          <input className={inputCls} value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://" />
        </div>
      </div>

      <div>
        <label className="block text-white/40 text-xs mb-2">Соцсети</label>
        <div className="space-y-2">
          <input className={inputCls} value={form.social_links?.telegram || ''} placeholder="Telegram @username"
            onChange={e => setForm({ ...form, social_links: { ...form.social_links, telegram: e.target.value } })} />
          <input className={inputCls} value={form.social_links?.vk || ''} placeholder="VK ссылка"
            onChange={e => setForm({ ...form, social_links: { ...form.social_links, vk: e.target.value } })} />
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.05]">
        <h3 className="text-sm font-bold mb-3">Реквизиты для вывода</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/40 text-xs mb-1.5">Способ</label>
            <select className={inputCls} value={form.payout_method || 'card'} onChange={e => setForm({ ...form, payout_method: e.target.value })}>
              <option value="card">Банковская карта</option>
              <option value="sbp">СБП (по номеру тел.)</option>
              <option value="yoomoney">ЮMoney</option>
            </select>
          </div>
          <div>
            <label className="block text-white/40 text-xs mb-1.5">Номер карты / телефон / кошелёк</label>
            <input className={inputCls} value={form.payout_details || ''} onChange={e => setForm({ ...form, payout_details: e.target.value })}
              placeholder={form.payout_method === 'sbp' ? '+7 999 123 4567' : form.payout_method === 'yoomoney' ? '4100...' : '4276 **** **** ****'} />
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent-dark transition disabled:opacity-50">
        {saving ? 'Сохраняем...' : 'Сохранить'}
      </button>
    </div>
  )
}
