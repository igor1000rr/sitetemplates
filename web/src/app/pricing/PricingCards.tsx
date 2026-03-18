'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { subscriptionApi } from '@/lib/api'
import { useAuth } from '@/stores/auth'

interface Plan {
  id: number
  name: string
  slug: string
  description: string
  price_rub: number
  annual_price_rub: number | null
  monthly_from_annual: number | null
  downloads_per_month: number
  features: string[]
  is_popular: boolean
}

export default function PricingCards() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [annual, setAnnual] = useState(false)
  const [loading, setLoading] = useState<number | null>(null)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    subscriptionApi.plans()
      .then(({ data }) => setPlans(data.data || data || []))
      .catch(() => {})
      .finally(() => setPlansLoading(false))
  }, [])

  const subscribe = async (planId: number) => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    setLoading(planId)
    try {
      const { data } = await subscriptionApi.subscribe(planId, annual ? 'annual' : 'monthly')
      if (data.confirmation_url) {
        window.location.href = data.confirmation_url
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка оформления подписки')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      {plansLoading ? (
        <div className="grid md:grid-cols-3 gap-5 max-w-[960px] mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/[0.05] bg-bg-card animate-pulse">
              <div className="h-5 w-24 bg-white/[0.05] rounded mb-2" />
              <div className="h-3 w-40 bg-white/[0.03] rounded mb-6" />
              <div className="h-10 w-32 bg-white/[0.05] rounded mb-6" />
              <div className="h-10 w-full bg-white/[0.05] rounded mb-6" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => <div key={j} className="h-3 w-full bg-white/[0.03] rounded" />)}
              </div>
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <p className="text-center text-white/20 py-12">Тарифные планы загружаются...</p>
      ) : (
      <>
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <span className={`text-sm transition ${!annual ? 'text-white' : 'text-white/30'}`}>Ежемесячно</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-14 h-7 rounded-full transition ${annual ? 'bg-accent' : 'bg-white/[0.08]'}`}
        >
          <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all ${annual ? 'left-[30px]' : 'left-0.5'}`} />
        </button>
        <span className={`text-sm transition ${annual ? 'text-white' : 'text-white/30'}`}>
          Ежегодно
          <span className="ml-1.5 text-green-400 text-xs font-bold">-17%</span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-5 max-w-[960px] mx-auto">
        {plans.map((plan) => {
          const price = annual && plan.monthly_from_annual ? plan.monthly_from_annual : plan.price_rub
          const totalAnnual = annual ? plan.annual_price_rub : null

          return (
            <div
              key={plan.id}
              className={`relative p-6 rounded-2xl border transition ${
                plan.is_popular
                  ? 'bg-gradient-to-b from-accent/[0.08] to-transparent border-accent/20 scale-[1.02]'
                  : 'bg-bg-card border-white/[0.05]'
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Популярный
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-white/25 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-[36px] font-extrabold tracking-tight">{price.toLocaleString('ru-RU')}</span>
                  <span className="text-white/25 text-sm">₽/мес</span>
                </div>
                {annual && totalAnnual && (
                  <div className="text-white/15 text-xs mt-1">
                    {totalAnnual.toLocaleString('ru-RU')} ₽/год
                  </div>
                )}
                {!annual && plan.monthly_from_annual && (
                  <div className="text-green-400/50 text-xs mt-1">
                    от {plan.monthly_from_annual.toLocaleString('ru-RU')} ₽/мес при годовой
                  </div>
                )}
              </div>

              <button
                onClick={() => subscribe(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3 rounded-xl text-sm font-bold transition disabled:opacity-50 ${
                  plan.is_popular
                    ? 'bg-accent text-white hover:bg-accent-dark'
                    : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.08]'
                }`}
              >
                {loading === plan.id ? 'Перенаправляем...' : 'Оформить подписку'}
              </button>

              <div className="mt-6 space-y-2.5">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[13px]">
                    <svg className="w-4 h-4 text-accent-light shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-white/40">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      </>
      )}
    </div>
  )
}
