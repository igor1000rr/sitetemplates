'use client'

import { useState } from 'react'
import { contactApi } from '@/lib/api'
import Link from 'next/link'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [consent, setConsent] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await contactApi.send(form)
      setSent(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка отправки. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen pt-[130px] pb-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="font-display text-xl font-bold mb-2">Сообщение отправлено</h1>
        <p className="text-white/30 text-sm mb-5">Мы ответим в течение 24 часов на {form.email}</p>
        <Link href="/" className="text-accent-light text-sm">← На главную</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-[100px] pb-16">
      <div className="max-w-[900px] mx-auto px-8">
        <div className="text-center mb-10">
          <p className="text-accent-light text-[11px] font-bold tracking-[2px] uppercase mb-3">Поддержка</p>
          <h1 className="font-display text-[32px] font-bold tracking-tight mb-3">Свяжитесь с нами</h1>
          <p className="text-white/30 text-sm">Ответим в течение 24 часов. Или спросите в AI-чате прямо сейчас.</p>
        </div>

        <div className="flex gap-8 flex-wrap lg:flex-nowrap">
          {/* Form */}
          <div className="flex-1 min-w-[300px]">
            <form onSubmit={handleSubmit} className="bg-bg-card rounded-2xl border border-white/[0.05] p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">Имя</label>
                  <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15"
                    placeholder="Ваше имя" />
                </div>
                <div>
                  <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15"
                    placeholder="email@example.com" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">Тема</label>
                <select value={form.subject} onChange={e => set('subject', e.target.value)} required
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition">
                  <option value="" className="bg-bg-card text-white/30">Выберите тему</option>
                  <option value="Вопрос по шаблону" className="bg-bg-card">Вопрос по шаблону</option>
                  <option value="Проблема с оплатой" className="bg-bg-card">Проблема с оплатой</option>
                  <option value="Помощь с установкой" className="bg-bg-card">Помощь с установкой</option>
                  <option value="Подписка" className="bg-bg-card">Подписка</option>
                  <option value="Стать автором" className="bg-bg-card">Стать автором</option>
                  <option value="Предложение / Идея" className="bg-bg-card">Предложение / Идея</option>
                  <option value="Другое" className="bg-bg-card">Другое</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">Сообщение</label>
                <textarea value={form.message} onChange={e => set('message', e.target.value)} required rows={5}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition resize-none placeholder:text-white/15"
                  placeholder="Опишите ваш вопрос..." />
              </div>

              <label className="flex items-start gap-2.5 mb-5 cursor-pointer group">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border border-white/[0.12] bg-white/[0.03] accent-accent flex-shrink-0" />
                <span className="text-white/30 text-xs leading-relaxed group-hover:text-white/40 transition">
                  Даю согласие на обработку персональных данных в соответствии с{' '}
                  <Link href="/legal/privacy" target="_blank" className="text-accent-light/60 hover:text-accent-light">политикой конфиденциальности</Link>
                </span>
              </label>

              <button type="submit" disabled={loading || !consent}
                className="w-full bg-accent hover:bg-accent-dark text-white py-3.5 rounded-xl text-sm font-bold transition disabled:opacity-50">
                {loading ? 'Отправляем...' : 'Отправить'}
              </button>
            </form>
          </div>

          {/* Info sidebar */}
          <div className="w-full lg:w-[280px] shrink-0 space-y-4">
            <div className="bg-bg-card rounded-xl border border-white/[0.05] p-5">
              <h3 className="font-bold text-sm mb-3">Быстрые ответы</h3>
              <div className="space-y-2">
                <Link href="/faq" className="text-accent-light text-xs hover:text-accent-pale transition block">FAQ — частые вопросы →</Link>
                <Link href="/faq#installation" className="text-accent-light text-xs hover:text-accent-pale transition block">Как установить шаблон →</Link>
                <Link href="/faq#subscription" className="text-accent-light text-xs hover:text-accent-pale transition block">Как работает подписка →</Link>
              </div>
            </div>

            <div className="bg-bg-card rounded-xl border border-white/[0.05] p-5">
              <h3 className="font-bold text-sm mb-3">Контакты</h3>
              <div className="space-y-3 text-sm text-white/40">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/20">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  support@templatename.ru
                </div>
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/20">
                    <path d="M11.944 0A12 12 0 000 12a12 12 0 0024 0A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  @templatename_support
                </div>
              </div>
            </div>

            <div className="bg-accent/[0.04] rounded-xl border border-accent/10 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">⏱</span>
                <span className="font-bold text-sm text-accent-pale/80">Время ответа</span>
              </div>
              <p className="text-white/25 text-xs leading-relaxed">
                Обычно отвечаем в течение нескольких часов в рабочее время (10:00–19:00 МСК).
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
