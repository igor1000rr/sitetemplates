'use client'

import { useEffect } from 'react'
import { useAuth } from '@/stores/auth'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadUser, token } = useAuth()

  useEffect(() => {
    if (token) loadUser()
  }, [])

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return <>{children}</>
}
