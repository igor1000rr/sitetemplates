'use client'

import { useEffect } from 'react'
import { useAuth } from '@/stores/auth'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadUser } = useAuth()

  useEffect(() => {
    // Вызываем всегда: сессия может восстановиться из httpOnly-cookie,
    // даже если токена в памяти ещё нет (после перезагрузки). 401 обрабатывается внутри.
    loadUser()
  }, [])

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return <>{children}</>
}
