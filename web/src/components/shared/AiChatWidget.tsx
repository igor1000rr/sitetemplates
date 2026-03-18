'use client'

import { useState, useRef, useEffect } from 'react'
import { aiApi } from '@/lib/api'
import { useCart } from '@/stores/cart'
import Link from 'next/link'

interface Message {
  role: 'user' | 'ai'
  text: string
  templates?: AiTemplate[]
  followUp?: string | null
}

interface AiTemplate {
  id: number
  title: string
  slug: string
  price_rub: number
  old_price_rub?: number | null
  category: string
  platform: string
  template_type: string
  image?: string
  demo_url?: string
  rating: number
  features: string[]
}

const quickActions = [
  'У меня салон красоты',
  'Нужен сайт для стоматологии',
  'Строительная компания',
  'Интернет-магазин',
]

export default function AiChatWidget() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: 'Привет! Я помогу подобрать шаблон для вашего бизнеса. Опишите, чем вы занимаетесь — или выберите нишу:',
    },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addItem, hasItem } = useCart()

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: 'user', text: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setMessage('')
    setLoading(true)

    const history = [...messages.slice(1), userMsg]
      .map(m => ({ role: m.role, text: m.text }))
      .slice(-20)

    try {
      const { data } = await aiApi.chat(text.trim(), history)

      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.message || 'Не удалось обработать запрос. Попробуйте описать бизнес другими словами.',
        templates: data.templates || [],
        followUp: data.follow_up || null,
      }])
    } catch (err: any) {
      const errorText = err?.response?.status === 429
        ? 'Слишком много запросов. Подождите минутку.'
        : 'Произошла ошибка. Попробуйте ещё раз.'
      setMessages(prev => [...prev, { role: 'ai', text: errorText }])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (t: AiTemplate) => {
    if (hasItem(t.id)) return
    addItem({
      id: t.id,
      title: t.title,
      slug: t.slug,
      price: t.price_rub * 100,
      price_rub: t.price_rub,
      old_price_rub: t.old_price_rub ?? undefined,
      image: t.image,
      platform: t.platform,
    })
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent shadow-[0_4px_20px_rgba(139,92,246,0.4)] flex items-center justify-center text-white hover:scale-105 transition-transform"
        aria-label="AI-помощник"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
        {!open && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-bg" />}
      </button>

      {/* Pulse */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-accent/30 animate-[chat-pulse_2s_ease-out_infinite]" />
        </div>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[540px] bg-bg-card border border-white/[0.06] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/[0.05] flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/30 to-purple-600/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold">AI-подбор шаблона</div>
              <div className="text-white/25 text-[11px]">Опишите бизнес — найду идеальный вариант</div>
            </div>
            {messages.length > 1 && (
              <button
                onClick={() => setMessages([messages[0]])}
                className="text-white/15 hover:text-white/40 transition p-1"
                title="Очистить чат"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                </svg>
              </button>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
            {messages.map((m, i) => (
              <div key={i}>
                <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-accent text-white rounded-br-md'
                      : 'bg-white/[0.04] text-white/60 rounded-bl-md'
                  }`}>
                    {m.text}
                  </div>
                </div>

                {/* Template cards */}
                {m.templates && m.templates.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {m.templates.map((t) => (
                      <MiniTemplateCard key={t.id} template={t} onAdd={handleAddToCart} inCart={hasItem(t.id)} />
                    ))}
                  </div>
                )}

                {/* Follow-up */}
                {m.followUp && (
                  <button
                    onClick={() => sendMessage(m.followUp!)}
                    className="mt-2 text-[11px] text-accent-light/60 hover:text-accent-light bg-accent/[0.05] hover:bg-accent/[0.1] px-3 py-1.5 rounded-lg transition border border-accent/[0.08]"
                  >
                    {m.followUp}
                  </button>
                )}
              </div>
            ))}

            {/* Quick actions at start */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {quickActions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-[11px] text-white/30 hover:text-white/60 bg-white/[0.03] hover:bg-white/[0.06] px-3 py-1.5 rounded-lg transition border border-white/[0.04]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Typing */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.04] px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-[bounce_1.2s_ease-in-out_infinite]" />
                  <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-[bounce_1.2s_ease-in-out_0.2s_infinite]" />
                  <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-[bounce_1.2s_ease-in-out_0.4s_infinite]" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/[0.04] shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(message)}
                placeholder="Опишите ваш бизнес..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(message)}
                disabled={loading || !message.trim()}
                className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shrink-0 hover:bg-accent-dark transition disabled:opacity-30"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ─── Mini template card inside chat ─── */

function MiniTemplateCard({ template: t, onAdd, inCart }: { template: AiTemplate; onAdd: (t: AiTemplate) => void; inCart: boolean }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden hover:border-accent/10 transition">
      <div className="flex gap-3 p-3">
        <div className="w-20 h-14 rounded-lg bg-bg-surface overflow-hidden shrink-0">
          {t.image ? (
            <img src={t.image} alt={t.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/templates/${t.slug}`} className="text-white/70 text-[12px] font-semibold hover:text-accent-pale transition line-clamp-1 block">
            {t.title}
          </Link>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-accent-light/60 bg-accent/[0.08] px-1.5 py-0.5 rounded">{t.platform}</span>
            <span className="text-[10px] text-white/20">{t.category}</span>
            {t.rating > 0 && (
              <span className="text-[10px] text-white/20 flex items-center gap-0.5">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="#a78bfa"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
                {t.rating}
              </span>
            )}
          </div>
          {t.features.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {t.features.slice(0, 3).map(f => (
                <span key={f} className="text-[9px] text-white/20 bg-white/[0.03] px-1.5 py-0.5 rounded">{f}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-2 border-t border-white/[0.04] bg-white/[0.01]">
        <div className="flex items-baseline gap-1.5">
          {t.old_price_rub && (
            <span className="text-[10px] text-white/15 line-through">{t.old_price_rub.toLocaleString('ru-RU')} ₽</span>
          )}
          <span className="text-accent-pale text-[14px] font-extrabold">{t.price_rub.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div className="flex items-center gap-1.5">
          {t.demo_url && (
            <Link href={`/preview/${t.slug}`} className="text-[10px] text-white/25 hover:text-white/50 transition px-2 py-1 rounded-md hover:bg-white/[0.04]">
              Preview
            </Link>
          )}
          <button
            onClick={() => onAdd(t)}
            disabled={inCart}
            className={`text-[10px] font-bold px-3 py-1 rounded-lg transition ${
              inCart
                ? 'bg-green-500/10 text-green-400 cursor-default'
                : 'bg-accent/15 text-accent-light hover:bg-accent/25'
            }`}
          >
            {inCart ? '✓ Добавлен' : 'В корзину'}
          </button>
        </div>
      </div>
    </div>
  )
}
