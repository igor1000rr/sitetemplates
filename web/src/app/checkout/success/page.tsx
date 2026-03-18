'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ordersApi } from '@/lib/api'
import { useCart } from '@/stores/cart'
import Link from 'next/link'
import type { Order } from '@/types'
import { trackPurchase } from '@/components/seo/Analytics'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<number | null>(null)
  const clearCart = useCart((s) => s.clearCart)

  useEffect(() => {
    if (!orderNumber) { setLoading(false); return }

    // Очищаем корзину после успешного редиректа
    clearCart()

    // Пробуем загрузить заказ с retry (webhook может ещё не дойти)
    let cancelled = false
    const loadOrder = async () => {
      for (let attempt = 0; attempt < 6; attempt++) {
        if (cancelled) return
        try {
          const { data } = await ordersApi.findByNumber(orderNumber)
          const found = data.data || data
          if (found) {
            setOrder(found)
            if (found.status === 'paid') {
              // Track ecommerce purchase
              trackPurchase({
                id: found.order_number,
                total: found.total_rub,
                items: (found.items || []).map((i: any) => ({
                  id: i.template_id, name: i.template?.title || 'Template', price: i.price_rub,
                })),
              })
              setLoading(false); return
            }
          }
        } catch {}
        if (attempt < 5) await new Promise((r) => setTimeout(r, 3000))
      }
      setLoading(false)
    }
    loadOrder()

    return () => { cancelled = true }
  }, [orderNumber])

  const handleDownload = async (templateId: number) => {
    if (!order) return
    setDownloading(templateId)
    try {
      const { data } = await ordersApi.download(order.id, templateId)
      window.open(data.download_url, '_blank')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка скачивания')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen pt-[160px] text-center">
        <div className="w-12 h-12 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/30 text-sm">Проверяем оплату...</p>
        <p className="text-white/15 text-xs mt-2">Обычно это занимает несколько секунд</p>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen pt-[160px] text-center px-4">
        <h1 className="font-display text-xl font-bold mb-3">Заказ не найден</h1>
        <p className="text-white/25 text-sm mb-5">Возможно, вы не авторизованы или ссылка устарела</p>
        <Link href="/account" className="text-accent-light text-sm">Перейти в личный кабинет →</Link>
      </main>
    )
  }

  const isPaid = order.status === 'paid'

  return (
    <main className="min-h-screen pt-[120px] pb-16">
      <div className="max-w-[600px] mx-auto px-4 text-center">
        {/* Status icon */}
        <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
          isPaid ? 'bg-green-500/10' : 'bg-yellow-500/10'
        }`}>
          {isPaid ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          )}
        </div>

        <h1 className="font-display text-2xl font-bold mb-2">
          {isPaid ? 'Спасибо за покупку!' : 'Ожидаем подтверждение оплаты'}
        </h1>
        <p className="text-white/30 text-sm mb-8">
          Заказ {order.order_number}
          {isPaid && order.paid_at && ` · Оплачен ${order.paid_at}`}
          {!isPaid && ' · Обновите страницу через минуту'}
        </p>

        {/* Items + Download */}
        <div className="bg-bg-card rounded-2xl border border-white/[0.05] overflow-hidden mb-8">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-5 border-b border-white/[0.04] last:border-0">
              <div className="w-[80px] h-[50px] rounded-lg overflow-hidden bg-bg-surface shrink-0">
                {item.template?.image && <img src={item.template.image} alt="" className="w-full h-full object-cover"/>}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-semibold line-clamp-1">{item.template?.title || 'Шаблон'}</div>
                <div className="text-white/20 text-xs">{item.template?.platform}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-accent-pale text-sm font-bold mb-1">{item.price_rub.toLocaleString('ru-RU')} ₽</div>
                {isPaid && (
                  <button
                    onClick={() => handleDownload(item.template_id)}
                    disabled={downloading === item.template_id}
                    className="text-xs text-accent-light hover:text-accent-pale transition flex items-center gap-1 ml-auto"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    {downloading === item.template_id ? '...' : 'Скачать'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="text-sm text-white/30 mb-8">
          Итого: <span className="text-accent-pale font-bold text-lg">{order.total_rub.toLocaleString('ru-RU')} ₽</span>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/account" className="bg-white/[0.04] border border-white/[0.06] text-white/50 px-6 py-2.5 rounded-xl text-sm font-semibold hover:text-white/80 transition">
            Мои покупки
          </Link>
          <Link href="/templates" className="bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
            Ещё шаблоны
          </Link>
        </div>

        {/* Referral sharing */}
        {isPaid && (
          <div className="mt-8 p-5 bg-bg-card rounded-2xl border border-white/[0.05] text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎁</span>
              <span className="font-bold text-sm">Пригласите друга — получите 10%</span>
            </div>
            <p className="text-white/25 text-xs mb-3">
              Поделитесь ссылкой с друзьями. С каждой их покупки вы получаете 10% на баланс.
            </p>
            <Link href="/account/referral"
              className="inline-flex text-accent-light text-xs font-semibold hover:text-accent-pale transition">
              Получить реферальную ссылку →
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
