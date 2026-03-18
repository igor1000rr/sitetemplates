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
      className="w-full bg-accent hover:bg-accent-dark text-white py-3.5 rounded-xl text-sm font-bold transition"
    >
      В корзину
    </button>
  )
}
