'use client'

import { useEffect } from 'react'
import { trackView } from '@/components/shared/RecentlyViewed'

interface Props {
  template: {
    id: number
    title: string
    slug: string
    image?: string
    price_rub: number
    platform: string
  }
}

export default function TrackView({ template }: Props) {
  useEffect(() => {
    trackView(template)
  }, [template.id])

  return null
}
