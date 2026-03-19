'use client'

import { useCart } from '@/stores/cart'
import { trackAddToCart } from '@/components/seo/Analytics'
import type { CartItem } from '@/types'

interface Props {
  item: CartItem
}

export default function AddToCartButton({ item }: Props) {
  const { addItem, removeItem, hasItem } = useCart()
  const inCart = hasItem(item.id)

  const handleAdd = () => {
    addItem(item)
    trackAddToCart({ id: item.id, name: item.title, price: item.price_rub, category: item.platform })
  }

  if (inCart) {
    return (
      <button
        onClick={() => removeItem(item.id)}
        className="w-full bg-white/[0.06] border border-white/[0.08] text-white/60 py-3.5 rounded-xl text-sm font-bold transition hover:border-red-500/20 hover:text-red-400"
      >
        ✓ В корзине · Убрать
      </button>
    )
  }

  return (
    <button
      onClick={handleAdd}
      className="w-full relative bg-accent hover:bg-accent-dark text-white py-4 rounded-xl text-[15px] font-bold transition-all duration-200 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-[0.98]"
    >
      <span className="absolute inset-0 rounded-xl bg-accent/30 animate-ping opacity-20 pointer-events-none" style={{ animationDuration: '2s' }} />
      В корзину
    </button>
  )
}
