'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/stores/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const { register, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Минимум 8 символов'); return }
    if (!consent) { setError('Необходимо согласие на обработку персональных данных'); return }
    try {
      await register(name, email, password, refCode)
      router.push('/account')
    } catch (err: any) {
      const msgs = err.response?.data?.errors
      if (msgs) {
        setError(Object.values(msgs).flat().join('. '))
      } else {
        setError(err.response?.data?.message || 'Ошибка регистрации')
      }
    }
  }

  return (
    <main className="min-h-screen pt-[130px] pb-16 flex items-start justify-center">
      <div className="w-full max-w-[400px] mx-4">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight mb-2">Регистрация</h1>
          <p className="text-white/30 text-sm">Создайте аккаунт и начните покупать шаблоны</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-card rounded-2xl border border-white/[0.05] p-7">
          {refCode && (
            <div className="mb-4 p-3 bg-accent/[0.06] border border-accent/10 rounded-xl flex items-center gap-2">
              <span className="text-sm">🎁</span>
              <span className="text-accent-pale/80 text-xs">Вас пригласили! Зарегистрируйтесь и получите бонусы</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="reg-name">Имя</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15"
              placeholder="Ваше имя"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="reg-email">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15"
              placeholder="email@example.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="reg-password">Пароль</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15"
              placeholder="Минимум 8 символов"
            />
          </div>

          <label className="flex items-start gap-2.5 mb-6 cursor-pointer group">
            <input
              type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border border-white/[0.12] bg-white/[0.03] accent-accent flex-shrink-0"
            />
            <span className="text-white/30 text-xs leading-relaxed group-hover:text-white/40 transition">
              Я соглашаюсь с{' '}
              <Link href="/legal/terms" target="_blank" className="text-accent-light/60 hover:text-accent-light">публичной офертой</Link>{' '}
              и{' '}
              <Link href="/legal/privacy" target="_blank" className="text-accent-light/60 hover:text-accent-light">политикой конфиденциальности</Link>,
              {' '}даю согласие на обработку персональных данных
            </span>
          </label>

          <button type="submit" disabled={isLoading || !consent}
            className="w-full bg-accent hover:bg-accent-dark text-white py-3.5 rounded-xl text-sm font-bold transition disabled:opacity-50">
            {isLoading ? 'Создаём...' : 'Создать аккаунт'}
          </button>

          <SocialAuthButtons />
        </form>

        <p className="text-center text-white/25 text-sm mt-5">
          Уже есть аккаунт?{' '}
          <Link href="/auth/login" className="text-accent-light hover:text-accent-pale transition">Войти</Link>
        </p>
      </div>
    </main>
  )
}
