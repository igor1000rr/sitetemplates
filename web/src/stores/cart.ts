import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

// Debounced abandoned cart sync (fires 5s after last change)
let syncTimeout: ReturnType<typeof setTimeout> | null = null

function syncAbandonedCart(items: CartItem[]) {
  if (syncTimeout) clearTimeout(syncTimeout)
  syncTimeout = setTimeout(async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token || items.length === 0) return

      const { default: api } = await import('@/lib/api')
      await (api as any).post('/cart/save', {
        items: items.map(i => ({
          template_id: i.id,
          title: i.title,
          price: Math.round(i.price_rub * 100),
        })),
        total: Math.round(items.reduce((s, i) => s + i.price_rub, 0) * 100),
      })
    } catch {}
  }, 5000)
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: number) => void
  clearCart: () => void
  hasItem: (id: number) => boolean
  totalRub: () => number
  count: () => number
  toggleService: (templateId: number, serviceId: number) => void
  getItemServices: (templateId: number) => number[]
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (get().items.find((i) => i.id === item.id)) return
        set((s) => ({ items: [...s.items, item] }))
        syncAbandonedCart([...get().items, item])
      },

      removeItem: (id) => {
        set((s) => ({ items: s.items.filter((i) => i.id !== id) }))
        syncAbandonedCart(get().items.filter(i => i.id !== id))
      },

      clearCart: () => set({ items: [] }),

      hasItem: (id) => get().items.some((i) => i.id === id),

      totalRub: () => get().items.reduce((sum, i) => sum + i.price_rub, 0),

      count: () => get().items.length,

      toggleService: (templateId, serviceId) => {
        set((s) => ({
          items: s.items.map((item) => {
            if (item.id !== templateId) return item
            const services = item.services || []
            const has = services.includes(serviceId)
            return {
              ...item,
              services: has
                ? services.filter((id) => id !== serviceId)
                : [...services, serviceId],
            }
          }),
        }))
      },

      getItemServices: (templateId) => {
        return get().items.find((i) => i.id === templateId)?.services || []
      },
    }),
    {
      name: 'aitempl-cart',
    }
  )
)
