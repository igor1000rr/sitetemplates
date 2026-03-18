import Link from 'next/link'
import type { Metadata } from 'next'
import PricingCards from './PricingCards'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export const metadata: Metadata = {
  title: 'Тарифы — Подписка на все шаблоны',
  description: 'Безлимитный доступ ко всем шаблонам сайтов от 990 ₽/мес. Скачивайте, используйте, зарабатывайте.',
}

async function getPlans() {
  const res = await fetch(`${API_URL}/api/subscriptions/plans`, { next: { revalidate: 300 } })
  if (!res.ok) return []
  const data = await res.json()
  return data.data || []
}

export default async function PricingPage() {
  const plans = await getPlans()

  return (
    <main className="min-h-screen pt-[100px] pb-16">
      <div className="max-w-[1100px] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-accent-light text-[11px] font-bold tracking-[2px] uppercase mb-3">Тарифы</p>
          <h1 className="font-display text-[36px] md:text-[44px] font-bold tracking-tight leading-[1.1] mb-4">
            Все шаблоны.<br />Одна подписка.
          </h1>
          <p className="text-white/30 text-lg max-w-xl mx-auto">
            Скачивайте любые шаблоны без ограничений. Отменить можно в любой момент.
          </p>
        </div>

        {/* Plans */}
        <PricingCards plans={plans} />

        {/* FAQ */}
        <div className="mt-20 max-w-[700px] mx-auto">
          <h2 className="font-display text-2xl font-bold text-center mb-8">Частые вопросы</h2>
          {[
            {
              q: 'Что включает подписка?',
              a: 'Доступ ко всем шаблонам каталога. Вы можете скачивать и использовать любые шаблоны в рамках вашего тарифа.',
            },
            {
              q: 'Могу ли я отменить подписку?',
              a: 'Да, в любой момент. После отмены доступ сохраняется до конца оплаченного периода.',
            },
            {
              q: 'Что значит «расширенная лицензия»?',
              a: 'Тариф «Агентство» позволяет использовать шаблоны для сайтов клиентов без дополнительных лицензионных платежей.',
            },
            {
              q: 'Можно ли купить один шаблон без подписки?',
              a: 'Конечно! Все шаблоны доступны для разовой покупки. Подписка выгоднее, если вам нужно несколько шаблонов.',
            },
            {
              q: 'Как работает годовая оплата?',
              a: 'При годовой подписке вы платите за 12 месяцев сразу со скидкой ~17%. Это самый выгодный вариант.',
            },
          ].map((item, i) => (
            <div key={i} className="py-5 border-b border-white/[0.05]">
              <h3 className="text-[15px] font-semibold mb-2">{item.q}</h3>
              <p className="text-white/30 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-white/20 text-sm mb-3">Не уверены? Попробуйте купить один шаблон</p>
          <Link href="/templates" className="text-accent-light hover:text-accent-pale transition text-sm font-medium">
            Перейти в каталог →
          </Link>
        </div>
      </div>
    </main>
  )
}
