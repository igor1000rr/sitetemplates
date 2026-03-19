'use client'

import { useState } from 'react'
import { useAuth } from '@/stores/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      router.push('/account')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка авторизации')
    }
  }

  return (
    <main className="min-h-screen pt-[130px] pb-16 flex items-start justify-center">
      <div className="w-full max-w-[400px] mx-4">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight mb-2">Вход</h1>
          <p className="text-white/30 text-sm">Войдите в аккаунт для доступа к покупкам</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-card rounded-2xl border border-white/[0.05] p-7">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="login-email" className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15"
              placeholder="email@example.com"
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="login-password" className="text-white/30 text-xs font-semibold uppercase tracking-wider">Пароль</label>
              <Link href="/auth/forgot-password" className="text-accent-light/60 text-[11px] hover:text-accent-light transition">
                Забыли пароль?
              </Link>
            </div>
            <input
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent-dark text-white py-3.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
          >
            {isLoading ? 'Входим...' : 'Войти'}
          </button>

          <SocialAuthButtons />
        </form>

        <p className="text-center text-white/25 text-sm mt-5">
          Нет аккаунта?{' '}
          <Link href="/auth/register" className="text-accent-light hover:text-accent-pale transition">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </main>
  )
}
