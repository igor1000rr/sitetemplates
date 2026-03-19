'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/stores/cart'
import { useAuth } from '@/stores/auth'
import { promoApi, ordersApi, servicesApi } from '@/lib/api'
import type { Service } from '@/types'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, totalRub, clearCart, toggleService } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [promo, setPromo] = useState('')
  const [promoResult, setPromoResult] = useState<any>(null)
  const [promoError, setPromoError] = useState('')
  const [loading, setLoading] = useState(false)
  const [allServices, setAllServices] = useState<Service[]>([])

  useEffect(() => {
    servicesApi.list()
      .then(({ data }) => setAllServices(data)).catch(() => {})
      .catch(() => {})
  }, [])

  const servicesTotalRub = items.reduce((sum, item) => {
    return sum + (item.services || []).reduce((s, sId) => {
      const svc = allServices.find((sv) => sv.id === sId)
      return s + (svc?.price_rub || 0)
    }, 0)
  }, 0)

  const checkPromo = async () => {
    if (!promo.trim()) return
    setPromoError('')
    setPromoResult(null)
    try {
      const { data } = await promoApi.validate(promo)
      setPromoResult(data)
    } catch (err: any) {
      setPromoError(err.response?.data?.message || 'Промокод не найден')
    }
  }

  const discount = promoResult?.valid
    ? promoResult.discount_type === 'percent'
      ? Math.round((totalRub() + servicesTotalRub) * promoResult.discount_value / 100)
      : promoResult.discount_value / 100
    : 0

  const finalTotal = Math.max(totalRub() + servicesTotalRub - discount, 0)

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    setLoading(true)
    try {
      const { data } = await ordersApi.create({
        items: items.map((i) => ({
          template_id: i.id,
          services: i.services || [],
        })),
        promo_code: promoResult?.valid ? promo : undefined,
      })
      clearCart()
      // Редирект на оплату ЮKassa
      if (data.payment_url) {
        window.location.href = data.payment_url
      } else {
        router.push(`/checkout/success?order=${data.order.order_number}`)
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка при создании заказа')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-[130px] pb-16 text-center">
        <div className="max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
          </div>
          <h1 className="font-display text-xl font-bold mb-2">Корзина пуста</h1>
          <p className="text-white/30 text-sm mb-6">Добавьте шаблоны из каталога</p>
          <Link href="/templates" className="inline-flex bg-accent text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
            Перейти в каталог
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-[110px] pb-16">
      <div className="max-w-[900px] mx-auto px-8">
        <h1 className="font-display text-2xl font-bold tracking-tight mb-8">
          Корзина <span className="text-white/20 text-lg font-normal">({items.length})</span>
        </h1>

        <div className="flex gap-8 flex-wrap lg:flex-nowrap">
          {/* Items */}
          <div className="flex-1 flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.id} className="bg-bg-card rounded-xl border border-white/[0.05] p-4 flex items-center gap-4">
                <div className="w-[120px] h-[75px] rounded-lg overflow-hidden bg-bg-surface shrink-0">
                  {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/templates/${item.slug}`} className="text-sm font-semibold hover:text-accent-light transition line-clamp-1">
                    {item.title}
                  </Link>
                  <span className="text-white/20 text-xs block mt-1">{item.platform}</span>
                  {(item.services || []).length > 0 && allServices.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {(item.services || []).map((sId) => {
                        const svc = allServices.find((sv) => sv.id === sId)
                        if (!svc) return null
                        return (
                          <span key={sId} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent/70">
                            {svc.name}
                            <button onClick={() => toggleService(item.id, sId)} className="text-accent/40 hover:text-red-400 ml-0.5">&times;</button>
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-accent-pale text-lg font-bold">{item.price_rub.toLocaleString('ru-RU')} ₽</div>
                  {item.old_price_rub && (
                    <div className="text-white/15 text-xs line-through">{item.old_price_rub.toLocaleString('ru-RU')} ₽</div>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="w-full lg:w-[300px] shrink-0">
            <div className="bg-bg-card rounded-2xl border border-white/[0.05] p-6 sticky top-[110px]">
              {/* Promo */}
              <div className="mb-5">
                <label className="block text-white/25 text-xs uppercase tracking-wider mb-2">Промокод</label>
                <div className="flex gap-2">
                  <input
                    type="text" value={promo} onChange={(e) => setPromo(e.target.value.toUpperCase())}
                    placeholder="СКИДКА20"
                    className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/12"
                  />
                  <button onClick={checkPromo} className="px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-white/40 text-xs font-semibold hover:text-white/70 transition">
                    ОК
                  </button>
                </div>
                {promoError && <p className="text-red-400 text-xs mt-1">{promoError}</p>}
                {promoResult?.valid && (
                  <p className="text-green-400 text-xs mt-1">
                    Скидка {promoResult.discount_type === 'percent' ? `${promoResult.discount_value}%` : `${promoResult.discount_value / 100} ₽`}
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-5 text-sm">
                <div className="flex justify-between text-white/40">
                  <span>Шаблоны</span>
                  <span>{totalRub().toLocaleString('ru-RU')} ₽</span>
                </div>
                {servicesTotalRub > 0 && (
                  <div className="flex justify-between text-white/40">
                    <span>Услуги</span>
                    <span>{servicesTotalRub.toLocaleString('ru-RU')} ₽</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Скидка</span>
                    <span>−{discount.toLocaleString('ru-RU')} ₽</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-white/[0.05]">
                  <span>Итого</span>
                  <span className="text-accent-pale">{finalTotal.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-dark text-white py-3.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
              >
                {loading ? 'Создаём заказ...' : isAuthenticated ? 'Оплатить' : 'Войти и оплатить'}
              </button>

              <p className="text-white/15 text-[10px] text-center mt-3">
                Оплата через ЮKassa. Банковская карта, СБП, ЮMoney.
              </p>

              {/* Subscription upsell */}
              <div className="mt-5 p-3 bg-accent/[0.04] border border-accent/10 rounded-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs">✨</span>
                  <span className="text-accent-pale/80 text-[11px] font-bold">Подписка — выгоднее</span>
                </div>
                <p className="text-white/20 text-[10px] leading-relaxed mb-2">
                  Безлимит шаблонов от 990 ₽/мес. Не нужно платить за каждый.
                </p>
                <Link href="/pricing" className="text-accent-light text-[10px] font-semibold hover:text-accent-pale transition">
                  Смотреть тарифы →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
