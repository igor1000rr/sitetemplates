'use client'

import { useState } from 'react'
import { aiApi } from '@/lib/api'
import { useCart } from '@/stores/cart'
import Link from 'next/link'

const steps = [
  {
    question: 'Чем занимается ваш бизнес?',
    type: 'select' as const,
    options: [
      { label: '🏪 Услуги', value: 'услуги', desc: 'Салон красоты, ремонт, клининг...' },
      { label: '🛒 Интернет-магазин', value: 'интернет-магазин', desc: 'Продажа товаров онлайн' },
      { label: '🏗 Строительство', value: 'строительство', desc: 'Бани, дома, ремонт' },
      { label: '🏥 Медицина', value: 'медицина', desc: 'Клиника, стоматология, лаборатория' },
      { label: '💼 Агентство / IT', value: 'digital-агентство', desc: 'Маркетинг, веб-студия, SaaS' },
      { label: '🍽 Ресторан / Кафе', value: 'ресторан', desc: 'Еда, доставка, кейтеринг' },
      { label: '📚 Образование', value: 'образование', desc: 'Курсы, школа, коучинг' },
      { label: '🔧 Другое', value: 'другое', desc: 'Расскажу подробнее' },
    ],
  },
  {
    question: 'Какая платформа?',
    type: 'select' as const,
    options: [
      { label: 'WordPress', value: 'WordPress', desc: 'Максимум гибкости и SEO' },
      { label: 'Tilda', value: 'Tilda', desc: 'Простой и красивый конструктор' },
      { label: '🤷 Не знаю', value: 'любая', desc: 'AI подберёт лучший вариант' },
    ],
  },
  {
    question: 'Какой тип сайта?',
    type: 'select' as const,
    options: [
      { label: '📄 Лендинг', value: 'лендинг', desc: 'Одностраничник для продаж' },
      { label: '📑 Многостраничник', value: 'многостраничник', desc: 'Полноценный корпоративный сайт' },
      { label: '🛍 Магазин', value: 'магазин', desc: 'Каталог + корзина + оплата' },
      { label: '📝 Блог/Портфолио', value: 'блог', desc: 'Контентный проект' },
    ],
  },
  {
    question: 'Какой бюджет?',
    type: 'select' as const,
    options: [
      { label: 'До 3 000 ₽', value: 'до 3000 рублей' },
      { label: '3 000 – 7 000 ₽', value: '3000-7000 рублей' },
      { label: '7 000+ ₽', value: 'от 7000 рублей' },
      { label: '💎 Подписка', value: 'подписка', desc: 'Безлимитный доступ ко всем' },
    ],
  },
]

interface AiTemplate {
  id: number; title: string; slug: string; price_rub: number
  old_price_rub?: number | null; category: string; platform: string
  image?: string; demo_url?: string; rating: number; features: string[]
}

export default function AiMatchPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [extra, setExtra] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<AiTemplate[]>([])
  const [aiComment, setAiComment] = useState('')
  const { addItem } = useCart()

  const selectOption = (value: string) => {
    const newAnswers = [...answers, value]
    setAnswers(newAnswers)

    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      runAiMatch(newAnswers)
    }
  }

  const runAiMatch = async (ans: string[]) => {
    setLoading(true)
    const prompt = `Подбери шаблон сайта:\n- Ниша: ${ans[0]}\n- Платформа: ${ans[1]}\n- Тип: ${ans[2]}\n- Бюджет: ${ans[3]}${extra ? `\n- Доп. пожелания: ${extra}` : ''}`

    try {
      const { data } = await aiApi.match({ message: prompt })
      setResults(data.templates || [])
      setAiComment(data.message || '')
    } catch {
      setAiComment('Не удалось подобрать шаблоны. Попробуйте каталог.')
    } finally {
      setLoading(false)
    }
  }

  const currentStep = steps[step]
  const progress = results.length > 0 ? 100 : ((step) / steps.length) * 100

  // Results screen
  if (results.length > 0 || (loading === false && step >= steps.length && answers.length >= steps.length)) {
    return (
      <main className="min-h-screen pt-[100px] pb-16">
        <div className="max-w-[900px] mx-auto px-8">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4 text-2xl">🎯</div>
            <h1 className="font-display text-[28px] font-bold mb-3">AI подобрал для вас</h1>
            {aiComment && <p className="text-white/30 text-sm max-w-xl mx-auto">{aiComment}</p>}
          </div>

          {results.length === 0 ? (
            <div className="text-center">
              <p className="text-white/25 mb-4">Ничего не нашлось по точным параметрам.</p>
              <Link href="/templates" className="text-accent-light">Посмотреть весь каталог →</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {results.map((t, i) => (
                <div key={t.id}
                  className={`relative p-5 rounded-2xl border transition ${i === 0 ? 'bg-gradient-to-b from-accent/[0.06] to-transparent border-accent/15' : 'bg-bg-card border-white/[0.05]'}`}>
                  {i === 0 && (
                    <div className="absolute -top-2.5 left-4 bg-accent text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Лучший выбор
                    </div>
                  )}

                  {t.image && (
                    <div className="rounded-xl overflow-hidden mb-3 bg-bg-surface">
                      <img src={t.image} alt={t.title} className="w-full aspect-[16/10] object-cover" />
                    </div>
                  )}

                  <h3 className="font-bold mb-1">{t.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-white/25 mb-3">
                    <span>{t.platform}</span>
                    <span>·</span>
                    <span>{t.category}</span>
                    {t.rating > 0 && <><span>·</span><span>⭐ {t.rating}</span></>}
                  </div>

                  {t.features?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {t.features.slice(0, 4).map((f, fi) => (
                        <span key={fi} className="text-[10px] bg-white/[0.04] text-white/30 px-2 py-0.5 rounded-md">{f}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold">{t.price_rub?.toLocaleString('ru-RU')} ₽</span>
                      {t.old_price_rub && (
                        <span className="text-white/15 text-sm line-through">{t.old_price_rub.toLocaleString('ru-RU')} ₽</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {t.demo_url && (
                        <a href={`/preview/${t.slug}`} className="px-3 py-1.5 bg-white/[0.04] text-white/40 rounded-lg text-xs hover:bg-white/[0.08] transition">
                          Preview
                        </a>
                      )}
                      <Link href={`/templates/${t.slug}`}
                        className="px-4 py-1.5 bg-accent text-white rounded-lg text-xs font-bold hover:bg-accent-dark transition">
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center flex gap-3 justify-center">
            <button onClick={() => { setStep(0); setAnswers([]); setResults([]); setAiComment('') }}
              className="px-5 py-2.5 bg-white/[0.05] text-white/40 rounded-xl text-sm hover:bg-white/[0.08] transition">
              Подобрать заново
            </button>
            <Link href="/templates" className="px-5 py-2.5 bg-white/[0.05] text-white/40 rounded-xl text-sm hover:bg-white/[0.08] transition">
              Весь каталог
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen pt-[100px] pb-16">
        <div className="max-w-[500px] mx-auto px-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">AI анализирует каталог...</h2>
          <p className="text-white/25 text-sm">Подбираем идеальные шаблоны под ваши задачи</p>
          <div className="mt-6 h-1 bg-white/[0.05] rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </main>
    )
  }

  // Wizard
  return (
    <main className="min-h-screen pt-[100px] pb-16">
      <div className="max-w-[600px] mx-auto px-8">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-1 bg-white/[0.05] rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-white/15 text-xs">{step + 1}/{steps.length}</span>
        </div>

        {/* Back */}
        {step > 0 && (
          <button onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)) }}
            className="text-white/20 text-sm hover:text-white/40 transition mb-4 flex items-center gap-1">
            ← Назад
          </button>
        )}

        {/* Question */}
        <h1 className="font-display text-[28px] md:text-[32px] font-bold tracking-tight mb-8">
          {currentStep.question}
        </h1>

        {/* Options */}
        <div className="grid gap-3">
          {currentStep.options.map((opt) => (
            <button key={opt.value} onClick={() => selectOption(opt.value)}
              className="w-full text-left p-4 rounded-xl border border-white/[0.05] bg-bg-card hover:border-accent/20 hover:bg-accent/[0.03] transition group">
              <div className="font-semibold text-sm group-hover:text-accent-pale transition">{opt.label}</div>
              {'desc' in opt && opt.desc && <div className="text-white/20 text-xs mt-0.5">{opt.desc}</div>}
            </button>
          ))}
        </div>

        {/* Extra wishes on last step */}
        {step === steps.length - 1 && (
          <div className="mt-5">
            <input
              value={extra}
              onChange={e => setExtra(e.target.value)}
              placeholder="Дополнительные пожелания (необязательно)..."
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white outline-none placeholder:text-white/15 focus:border-accent/20 transition"
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-white/10 text-xs">
            AI проанализирует {'>'}300 шаблонов и подберёт лучшие
          </p>
        </div>
      </div>
    </main>
  )
}
