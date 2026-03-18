'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/stores/auth'
import { useCompare } from '@/stores/compare'
import { subscriptionApi, wishlistApi, deployApi } from '@/lib/api'
import Link from 'next/link'
import DeployModal from '@/components/DeployModal'

interface Props {
  templateId: number
  templateTitle: string
  templateSlug: string
  previewImage?: string
}

export default function TemplateActions({ templateId, templateTitle, templateSlug, previewImage }: Props) {
  const { isAuthenticated } = useAuth()
  const { add: addCompare, items: compareItems } = useCompare()
  const [access, setAccess] = useState<{ has_access: boolean; purchased: boolean; has_subscription: boolean } | null>(null)
  const [inWishlist, setInWishlist] = useState(false)
  const [wishLoading, setWishLoading] = useState(false)
  const [showDeploy, setShowDeploy] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const inCompare = compareItems.some(i => i.id === templateId)

  useEffect(() => {
    if (!isAuthenticated) return
    // Check access
    subscriptionApi.checkAccess(templateId).then(({ data }) => setAccess(data)).catch(() => {})
    // Check wishlist
    wishlistApi.check([templateId]).then(({ data }) => setInWishlist(data[templateId] || false)).catch(() => {})
  }, [isAuthenticated, templateId])

  const toggleWishlist = async () => {
    if (!isAuthenticated) return
    setWishLoading(true)
    try {
      await wishlistApi.toggle(templateId)
      setInWishlist(!inWishlist)
    } catch {} finally { setWishLoading(false) }
  }

  const downloadBySubscription = async () => {
    setDownloading(true)
    try {
      const { data } = await subscriptionApi.downloadBySubscription(templateId)
      if (data.url) window.open(data.url, '_blank')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка скачивания')
    } finally { setDownloading(false) }
  }

  return (
    <>
      {/* Subscription badge */}
      {access?.has_subscription && (
        <div className="mb-3 px-3 py-2 bg-accent/[0.06] border border-accent/10 rounded-xl flex items-center gap-2">
          <span className="text-accent-light text-xs">✨</span>
          <span className="text-accent-pale/70 text-xs font-medium">Доступен по подписке</span>
        </div>
      )}

      {/* Download by subscription */}
      {access?.has_access && (
        <button onClick={downloadBySubscription} disabled={downloading}
          className="w-full mb-2 bg-green-600/80 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {downloading ? 'Скачивание...' : 'Скачать шаблон'}
        </button>
      )}

      {/* Deploy button */}
      {access?.has_access && (
        <button onClick={() => setShowDeploy(true)}
          className="w-full mb-3 bg-white/[0.04] border border-white/[0.06] text-white/50 py-2.5 rounded-xl text-xs font-semibold hover:text-white/70 hover:border-accent/10 transition flex items-center justify-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
          Установить на хостинг
        </button>
      )}

      {/* No access — CTA for subscription */}
      {isAuthenticated && access && !access.has_access && !access.purchased && (
        <Link href="/pricing"
          className="w-full mb-3 block text-center bg-white/[0.03] border border-dashed border-accent/15 text-accent-pale/60 py-2.5 rounded-xl text-xs font-medium hover:bg-accent/[0.04] transition">
          ✨ Или оформите подписку — безлимитный доступ
        </Link>
      )}

      {/* Wishlist + Compare */}
      <div className="flex gap-2 mt-1">
        <button onClick={toggleWishlist} disabled={wishLoading}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
            inWishlist
              ? 'bg-red-500/10 text-red-400 border border-red-500/15'
              : 'bg-white/[0.03] text-white/30 border border-white/[0.05] hover:text-white/50'
          }`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/>
          </svg>
          {inWishlist ? 'В избранном' : 'В избранное'}
        </button>

        <button
          onClick={() => addCompare({ id: templateId, title: templateTitle, slug: templateSlug, preview_image: previewImage || null })}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
            inCompare
              ? 'bg-accent/10 text-accent-pale border border-accent/15'
              : 'bg-white/[0.03] text-white/30 border border-white/[0.05] hover:text-white/50'
          }`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          {inCompare ? 'Сравнивается' : 'Сравнить'}
        </button>
      </div>

      {/* Deploy Modal */}
      {showDeploy && (
        <DeployModal templateId={templateId} templateTitle={templateTitle} onClose={() => setShowDeploy(false)} />
      )}
    </>
  )
}
