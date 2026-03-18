'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/stores/auth'

export default function AuthCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setToken, loadUser } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      router.push(`/auth/login?error=${error}`)
      return
    }

    if (token) {
      setToken(token)
      loadUser().then(() => {
        router.push('/account')
      }).catch(() => {
        router.push('/auth/login?error=auth_failed')
      })
    } else {
      router.push('/auth/login')
    }
  }, [searchParams])

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/30 text-sm">Авторизация...</p>
      </div>
    </main>
  )
}
