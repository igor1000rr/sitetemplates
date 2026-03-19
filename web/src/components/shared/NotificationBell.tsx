'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/stores/auth'
import { notificationApi } from '@/lib/api'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
  url?: string
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Poll unread count
  useEffect(() => {
    if (!isAuthenticated) return
    const fetch = () => {
      notificationApi.unreadCount()
        .then(({ data }) => setUnread(data.count || 0)).catch(() => {})
        .catch(() => {})
    }
    fetch()
    const interval = setInterval(fetch, 60000) // every 60s
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const loadNotifications = async () => {
    if (loading) return
    setLoading(true)
    try {
      const { data } = await notificationApi.list()
      setNotifications(data.data || data || [])
    } catch {} finally { setLoading(false) }
  }

  const handleOpen = () => {
    setOpen(!open)
    if (!open) {
      loadNotifications()
      // Mark all as read
      if (unread > 0) {
        notificationApi.markRead().then(() => setUnread(0)).catch(() => {})
      }
    }
  }

  const iconFor = (type: string) => {
    switch (type) {
      case 'order_paid': return '✅'
      case 'order_created': return '🛒'
      case 'review_approved': return '⭐'
      case 'template_updated': return '🔄'
      case 'payout_completed': return '💰'
      case 'subscription_renewed': return '🔔'
      default: return '📬'
    }
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'только что'
    if (mins < 60) return `${mins} мин назад`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} ч назад`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} дн назад`
    return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  if (!isAuthenticated) return null

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen}
        className="relative w-9 h-9 rounded-lg bg-white/[0.03] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-[340px] bg-bg-card border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-up">
          <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
            <span className="text-sm font-bold">Уведомления</span>
            {unread > 0 && (
              <span className="text-[10px] text-accent-light bg-accent/[0.08] px-2 py-0.5 rounded-full">
                {unread} новых
              </span>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {loading && notifications.length === 0 && (
              <div className="p-6 text-center">
                <div className="w-5 h-5 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" />
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="p-6 text-center">
                <div className="text-white/10 text-2xl mb-2">🔔</div>
                <span className="text-white/20 text-xs">Пока нет уведомлений</span>
              </div>
            )}

            {notifications.map((n) => (
              <a
                key={n.id}
                href={n.url || '#'}
                className={`block px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition ${
                  !n.read ? 'bg-accent/[0.02]' : ''
                }`}
              >
                <div className="flex gap-3">
                  <span className="text-sm mt-0.5 shrink-0">{iconFor(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white/70 line-clamp-1">{n.title}</div>
                    <div className="text-[11px] text-white/30 line-clamp-2 mt-0.5">{n.message}</div>
                    <div className="text-[10px] text-white/15 mt-1">{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 bg-accent rounded-full shrink-0 mt-1.5" />
                  )}
                </div>
              </a>
            ))}
          </div>

          {notifications.length > 0 && (
            <a href="/account" className="block text-center py-2.5 text-[11px] text-accent-light/60 hover:text-accent-light border-t border-white/[0.03] transition">
              Все уведомления
            </a>
          )}
        </div>
      )}
    </div>
  )
}
