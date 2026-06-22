'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/stores/auth'
import { authApi } from '@/lib/api'

export default function AuthCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setToken, loadUser } = useAuth()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      router.push(`/auth/login?error=${error}`)
      return
    }

    if (!code) {
      router.push('/auth/login')
      return
    }

    // Меняем одноразовый код на токен (токен больше не передаётся через URL)
    authApi.socialExchange(code)
      .then(({ data }) => {
        setToken(data.token)
        return loadUser()
      })
      .then(() => router.push('/account'))
      .catch(() => router.push('/auth/login?error=auth_failed'))
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
