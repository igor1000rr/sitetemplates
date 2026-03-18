'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useCart } from '@/stores/cart'
import { templatesApi } from '@/lib/api'
import Link from 'next/link'

type Device = 'desktop' | 'tablet' | 'mobile'

const devices: { key: Device; label: string; width: string; icon: string; shortcut: string }[] = [
  {
    key: 'desktop',
    label: 'Desktop',
    width: '100%',
    shortcut: '1',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    key: 'tablet',
    label: 'Tablet',
    width: '768px',
    shortcut: '2',
    icon: 'M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  },
  {
    key: 'mobile',
    label: 'Mobile',
    width: '375px',
    shortcut: '3',
    icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  },
]

export default function PreviewPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [device, setDevice] = useState<Device>('desktop')
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const [toolbarVisible, setToolbarVisible] = useState(true)
  const [toolbarPinned, setToolbarPinned] = useState(true)

  const { addItem, removeItem, hasItem } = useCart()

  // Загружаем данные шаблона
  useEffect(() => {
    templatesApi.show(slug).then(({ data }) => {
      const t = data.template || data
      setTemplate(t)
      setLoading(false)
    }).catch(() => {
      router.push('/templates')
    })
  }, [slug])

  // Таймаут на загрузку iframe (15 сек) — если сайт блокирует iframe
  useEffect(() => {
    if (!template?.demo_url || iframeLoaded) return
    const t = setTimeout(() => {
      if (!iframeLoaded) setIframeError(true)
    }, 15000)
    return () => clearTimeout(t)
  }, [template, iframeLoaded])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back()
      if (e.key === '1') setDevice('desktop')
      if (e.key === '2') setDevice('tablet')
      if (e.key === '3') setDevice('mobile')
      if (e.key === 'h' || e.key === 'р') setToolbarPinned(p => !p)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Auto-hide toolbar
  useEffect(() => {
    if (toolbarPinned) { setToolbarVisible(true); return }
    let timeout: NodeJS.Timeout
    const show = () => { setToolbarVisible(true); clearTimeout(timeout); timeout = setTimeout(() => setToolbarVisible(false), 3000) }
    window.addEventListener('mousemove', show)
    timeout = setTimeout(() => setToolbarVisible(false), 3000)
    return () => { window.removeEventListener('mousemove', show); clearTimeout(timeout) }
  }, [toolbarPinned])

  const inCart = template ? hasItem(template.id) : false

  const toggleCart = useCallback(() => {
    if (!template) return
    if (inCart) {
      removeItem(template.id)
    } else {
      addItem({
        id: template.id,
        title: template.title,
        slug: template.slug,
        price: template.price,
        price_rub: template.price_rub,
        old_price_rub: template.old_price_rub,
        image: template.images?.[0]?.path || null,
        platform: template.platform?.name || 'WordPress',
      })
    }
  }, [template, inCart])

  const currentDevice = devices.find(d => d.key === device)!

  if (loading) {
    return (
      <div className="fixed inset-0 bg-bg-primary z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/30 text-sm">Загружаем превью...</p>
        </div>
      </div>
    )
  }

  if (!template?.demo_url) {
    return (
      <div className="fixed inset-0 bg-bg-primary z-50 flex items-center justify-center">
        <div className="text-center max-w-md px-8">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 className="font-display text-lg font-bold mb-2">Превью недоступно</h2>
          <p className="text-white/30 text-sm mb-5">У этого шаблона пока нет демо-сайта</p>
          <Link href={`/templates/${slug}`} className="text-accent-light text-sm hover:text-accent-pale transition">
            ← Вернуться к шаблону
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a12] z-50 flex flex-col">
      {/* ═══ Toolbar ═══ */}
      <div className={`shrink-0 transition-all duration-300 ${
        toolbarVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="h-[56px] bg-bg-primary/95 backdrop-blur-xl border-b border-white/[0.06] px-4 flex items-center gap-3">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition shrink-0"
            title="Назад (Esc)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>

          {/* Template info */}
          <Link href={`/templates/${slug}`} className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition">
            {template.images?.[0]?.path && (
              <img src={template.images[0].path} alt="" className="w-7 h-7 rounded-md object-cover shrink-0" />
            )}
            <div className="min-w-0">
              <h1 className="text-white/80 text-[13px] font-semibold truncate leading-tight">{template.title}</h1>
              <span className="text-white/25 text-[11px]">{template.platform?.name} · {template.template_type}</span>
            </div>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Device switcher */}
          <div className="flex items-center bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.05]">
            {devices.map((d) => (
              <button
                key={d.key}
                onClick={() => setDevice(d.key)}
                title={`${d.label} (${d.shortcut})`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition ${
                  device === d.key
                    ? 'bg-accent/15 text-accent-pale'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={d.icon} />
                </svg>
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            ))}
          </div>

          {/* Pin toolbar */}
          <button
            onClick={() => setToolbarPinned(p => !p)}
            title={`${toolbarPinned ? 'Скрывать' : 'Закрепить'} панель (H)`}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              toolbarPinned ? 'bg-accent/10 text-accent-light' : 'bg-white/[0.03] text-white/20 hover:text-white/50'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={toolbarPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px h-7 bg-white/[0.06]" />

          {/* Price + Cart */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              {template.old_price_rub && (
                <span className="text-white/15 text-[11px] line-through mr-1.5">{template.old_price_rub.toLocaleString('ru-RU')} ₽</span>
              )}
              <span className="text-accent-pale text-[15px] font-extrabold">
                {template.price_rub.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <button
              onClick={toggleCart}
              className={`px-4 py-2 rounded-lg text-[12px] font-bold transition whitespace-nowrap ${
                inCart
                  ? 'bg-green-500/15 text-green-400 hover:bg-red-500/10 hover:text-red-400'
                  : 'bg-accent hover:bg-accent-dark text-white'
              }`}
            >
              {inCart ? '✓ В корзине' : 'В корзину'}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Iframe area ═══ */}
      <div className="flex-1 relative overflow-hidden flex items-start justify-center">
        {/* Loading / Error overlay */}
        {(!iframeLoaded || iframeError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary z-10">
            {iframeError ? (
              <div className="text-center max-w-sm px-6">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <h3 className="text-white/70 text-sm font-semibold mb-2">Сайт не загружается во фрейме</h3>
                <p className="text-white/30 text-xs mb-4">Некоторые сайты блокируют отображение в iframe. Откройте демо в новой вкладке:</p>
                <a
                  href={template.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dark transition"
                >
                  Открыть демо ↗
                </a>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white/20 text-xs">Загружаем сайт...</p>
              </div>
            )}
          </div>
        )}

        {/* Device frame */}
        <div
          className="h-full transition-all duration-500 ease-out relative"
          style={{
            width: currentDevice.width,
            maxWidth: '100%',
          }}
        >
          {/* Device border for tablet/mobile */}
          {device !== 'desktop' && (
            <div className="absolute inset-y-0 -left-px -right-px border-x border-white/[0.08] pointer-events-none z-10" />
          )}

          <iframe
            src={template.demo_url}
            className="w-full h-full border-0"
            onLoad={() => setIframeLoaded(true)}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            title={`Превью: ${template.title}`}
          />
        </div>

        {/* Side gradient for non-desktop */}
        {device !== 'desktop' && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0a12] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0a12] to-transparent pointer-events-none" />
          </>
        )}

        {/* Viewport size indicator */}
        <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white/40 px-3 py-1.5 rounded-full text-[11px] transition-opacity duration-300 ${
          iframeLoaded ? 'opacity-0 hover:opacity-100' : 'opacity-0'
        }`}>
          {currentDevice.label} · {currentDevice.width}
        </div>
      </div>

      {/* ═══ Bottom floating bar (mobile/compact) ═══ */}
      <div className="sm:hidden shrink-0 bg-bg-primary/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-white/70 text-sm font-semibold truncate max-w-[200px]">{template.title}</div>
          <span className="text-accent-pale text-lg font-extrabold">{template.price_rub.toLocaleString('ru-RU')} ₽</span>
        </div>
        <button
          onClick={toggleCart}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${
            inCart
              ? 'bg-green-500/15 text-green-400'
              : 'bg-accent hover:bg-accent-dark text-white'
          }`}
        >
          {inCart ? '✓ В корзине' : 'Купить'}
        </button>
      </div>
    </div>
  )
}
