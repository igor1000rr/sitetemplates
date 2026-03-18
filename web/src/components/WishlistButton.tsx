'use client'

import { useState } from 'react'
import { wishlistApi } from '@/lib/api'
import { useAuth } from '@/stores/auth'
import { useRouter } from 'next/navigation'

interface Props {
  templateId: number
  initialInWishlist?: boolean
  size?: 'sm' | 'md'
}

export default function WishlistButton({ templateId, initialInWishlist = false, size = 'md' }: Props) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    try {
      const { data } = await wishlistApi.toggle(templateId)
      setInWishlist(data.in_wishlist)
    } catch {}
    setLoading(false)
  }

  const sz = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
  const iconSz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`${sz} rounded-lg flex items-center justify-center transition ${
        inWishlist
          ? 'bg-red-500/15 text-red-400'
          : 'bg-white/[0.05] text-white/20 hover:text-red-400 hover:bg-red-500/10'
      } disabled:opacity-50`}
      title={inWishlist ? 'Убрать из избранного' : 'В избранное'}
    >
      <svg className={iconSz} viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    </button>
  )
}
