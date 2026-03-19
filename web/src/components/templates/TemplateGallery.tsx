'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import LaptopFrame from '@/components/shared/LaptopFrame'

interface GalleryImage {
  id: number
  path: string
  alt?: string
}

interface Props {
  images: GalleryImage[]
  title: string
}

export default function TemplateGallery({ images, title }: Props) {
  const [selected, setSelected] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const next = useCallback(() => setSelected(s => (s + 1) % images.length), [images.length])
  const prev = useCallback(() => setSelected(s => (s - 1 + images.length) % images.length), [images.length])

  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [lightbox, next, prev])

  if (!images.length) {
    return (
      <div className="rounded-2xl bg-bg-surface border border-white/[0.05] aspect-[16/10] flex items-center justify-center text-white/20">
        Нет изображения
      </div>
    )
  }

  return (
    <>
      {/* Main image in laptop frame */}
      <div className="mb-3">
        <LaptopFrame>
          <div
            className="relative aspect-[16/10] overflow-hidden cursor-zoom-in group"
            onClick={() => setLightbox(true)}
          >
            <Image
              src={images[selected].path}
              alt={images[selected].alt || title}
              width={800}
              height={500}
              className="w-full h-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-black/50 backdrop-blur-sm text-white/80 px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
                Увеличить
              </div>
            </div>
            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white/70 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                {selected + 1} / {images.length}
              </div>
            )}
          </div>
        </LaptopFrame>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelected(i)}
              className={`w-[72px] h-[48px] rounded-lg overflow-hidden shrink-0 transition-all border-2 ${
                i === selected
                  ? 'border-accent ring-1 ring-accent/30'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <Image src={img.path} alt={img.alt || ''} width={72} height={48} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center" onClick={() => setLightbox(false)}>
          {/* Close */}
          <button className="absolute top-5 right-5 text-white/40 hover:text-white transition z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition z-10"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}

          {/* Image */}
          <div className="max-w-[90vw] max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[selected].path}
              alt={images[selected].alt || title}
              width={1400}
              height={875}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              quality={90}
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition z-10"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white/60 px-4 py-1.5 rounded-full text-xs font-medium">
              {selected + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}
