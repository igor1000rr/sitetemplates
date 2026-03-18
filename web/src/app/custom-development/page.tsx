'use client'

import { useState } from 'react'
import { customRequestApi } from '@/lib/api'
import Link from 'next/link'

const steps = [
  { icon: '💬', title: 'Расскажите о проекте', desc: 'Заполните форму — что за бизнес, какой нужен сайт' },
  { icon: '📋', title: 'Получите предложение', desc: 'Мы оценим стоимость и сроки в течение 24 часов' },
  { icon: '🎨', title: 'Согласуем дизайн', desc: 'Покажем макеты, внесём правки до идеала' },
  { icon: '🚀', title: 'Запускаем', desc: 'Готовый сайт с настроенным хостингом и SEO' },
]

const includes = [
  'Уникальный дизайн под ваш бренд',
  'Адаптация под мобильные устройства',
  'Базовая SEO-оптимизация',
  'Настройка хостинга и домена',
  'SSL-сертификат',
  'Подключение аналитики (Метрика + GA)',
  'Обучение по управлению сайтом',
  'Техподдержка 30 дней после запуска',
]

export default function CustomDevelopmentPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    business_type: '',
    budget_range: '',
    deadline: '',
    description: '',
    reference_urls: '',
    preferred_platform: '',
  })
  const [loading, setLoading] = useState(false)
  const [consent, setConsent] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.description) {
      setError('Заполните обязательные поля: имя, email, описание')
      return
    }
    setLoading(true)
    setError('')
    try {
      await customRequestApi.submit(form)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка отправки. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen pt-[130px] pb-16 text-center">
        <div className="max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6 text-3xl">
            ✓
          </div>
          <h1 className="font-display text-2xl font-bold mb-3">Заявка отправлена!</h1>
          <p className="text-white/50 text-sm mb-6">
            Мы свяжемся с вами в течение 24 часов для обсуждения проекта.
          </p>
          <Link
            href="/"
            className="inline-flex px-6 py-3 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-xl transition"
          >
            На главную
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-[110px] pb-16">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-8">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">
            Индивидуальная разработка
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Разработка сайта <span className="text-accent">под ключ</span>
          </h1>
          <p className="text-white/50 max-w-lg mx-auto text-sm sm:text-base">
            Не нашли подходящий шаблон? Мы создадим уникальный сайт с нуля — 
            под ваш бизнес, с вашим стилем, с вашим контентом.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          {steps.map((step, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{step.icon}</div>
              <p className="text-xs font-semibold text-white/80 mb-1">{step.title}</p>
              <p className="text-[11px] text-white/30 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-8 flex-wrap lg:flex-nowrap">
          {/* Form */}
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-bold mb-6">Расскажите о проекте</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">Ваше имя *</label>
                  <input
                    type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15"
                    placeholder="Иван Петров"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">Email *</label>
                  <input
                    type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15"
                    placeholder="ivan@company.ru"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">Телефон</label>
                  <input
                    type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">Компания</label>
                  <input
                    type="text" value={form.company} onChange={(e) => update('company', e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15"
                    placeholder="ООО «Ромашка»"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/40 text-xs mb-1.5">Тип бизнеса</label>
                <input
                  type="text" value={form.business_type} onChange={(e) => update('business_type', e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15"
                  placeholder="Стоматология, автосервис, интернет-магазин..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">Бюджет</label>
                  <select
                    value={form.budget_range} onChange={(e) => update('budget_range', e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition appearance-none"
                  >
                    <option value="" className="bg-[#0d0d1a]">Не определён</option>
                    <option value="30000-50000" className="bg-[#0d0d1a]">30 000 — 50 000 ₽</option>
                    <option value="50000-100000" className="bg-[#0d0d1a]">50 000 — 100 000 ₽</option>
                    <option value="100000-200000" className="bg-[#0d0d1a]">100 000 — 200 000 ₽</option>
                    <option value="200000+" className="bg-[#0d0d1a]">200 000+ ₽</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">Сроки</label>
                  <select
                    value={form.deadline} onChange={(e) => update('deadline', e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition appearance-none"
                  >
                    <option value="" className="bg-[#0d0d1a]">Не срочно</option>
                    <option value="1-2 недели" className="bg-[#0d0d1a]">1–2 недели</option>
                    <option value="2-4 недели" className="bg-[#0d0d1a]">2–4 недели</option>
                    <option value="1-2 месяца" className="bg-[#0d0d1a]">1–2 месяца</option>
                    <option value="Не срочно" className="bg-[#0d0d1a]">Не торопимся</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">Платформа</label>
                  <select
                    value={form.preferred_platform} onChange={(e) => update('preferred_platform', e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition appearance-none"
                  >
                    <option value="" className="bg-[#0d0d1a]">Не важно</option>
                    <option value="WordPress" className="bg-[#0d0d1a]">WordPress</option>
                    <option value="Tilda" className="bg-[#0d0d1a]">Tilda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/40 text-xs mb-1.5">Опишите проект *</label>
                <textarea
                  value={form.description} onChange={(e) => update('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15 resize-none"
                  placeholder="Расскажите что за сайт нужен, какие разделы, есть ли контент, логотип, фирменный стиль..."
                />
              </div>

              <div>
                <label className="block text-white/40 text-xs mb-1.5">Примеры сайтов которые нравятся</label>
                <input
                  type="text" value={form.reference_urls} onChange={(e) => update('reference_urls', e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15"
                  placeholder="https://example.com, https://..."
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border border-white/[0.12] bg-white/[0.03] accent-accent flex-shrink-0" />
                <span className="text-white/30 text-xs leading-relaxed group-hover:text-white/40 transition">
                  Даю согласие на обработку персональных данных в соответствии с{' '}
                  <a href="/legal/privacy" target="_blank" className="text-accent-light/60 hover:text-accent-light">политикой конфиденциальности</a>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !consent}
                className="w-full sm:w-auto px-8 py-3.5 bg-accent hover:bg-accent-dark text-white text-sm font-bold rounded-xl transition disabled:opacity-50"
              >
                {loading ? 'Отправляем...' : 'Отправить заявку'}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="bg-bg-card rounded-2xl border border-white/[0.05] p-6 sticky top-[110px]">
              <h3 className="font-display text-sm font-bold mb-4">Что входит в разработку</h3>
              <ul className="space-y-2.5">
                {includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-white/50">
                    <svg className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-5 border-t border-white/[0.05]">
                <p className="text-white/25 text-xs mb-2">Стоимость от</p>
                <p className="text-2xl font-bold text-accent-pale">30 000 ₽</p>
                <p className="text-white/25 text-[10px] mt-1">Зависит от сложности и объёма</p>
              </div>

              <div className="mt-5 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                <p className="text-white/30 text-[11px] leading-relaxed">
                  Или выберите <Link href="/templates" className="text-accent hover:text-accent-light transition">готовый шаблон</Link> от 990 ₽ с доп. услугами: установка, SEO, наполнение контентом.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
