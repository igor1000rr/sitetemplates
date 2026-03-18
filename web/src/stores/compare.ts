'use client'

import { create } from 'zustand'

interface CompareItem {
  id: number
  title: string
  preview_image?: string
}

interface CompareStore {
  items: CompareItem[]
  add: (item: CompareItem) => void
  remove: (id: number) => void
  clear: () => void
  has: (id: number) => boolean
  isOpen: boolean
  setOpen: (v: boolean) => void
}

export const useCompare = create<CompareStore>((set, get) => ({
  items: [],
  isOpen: false,

  add: (item) => {
    const { items } = get()
    if (items.length >= 4) return
    if (items.find(i => i.id === item.id)) return
    set({ items: [...items, item], isOpen: true })
  },

  remove: (id) => {
    const items = get().items.filter(i => i.id !== id)
    set({ items, isOpen: items.length > 0 })
  },

  clear: () => set({ items: [], isOpen: false }),

  has: (id) => get().items.some(i => i.id === id),

  setOpen: (v) => set({ isOpen: v }),
}))
