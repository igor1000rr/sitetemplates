'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Минимум 8 символов'); return }
    if (password !== confirm) { setError('Пароли не совпадают'); return }

    setLoading(true)
    try {
      await authApi.resetPassword({ email, token, password, password_confirmation: confirm })
      setDone(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка. Возможно, ссылка устарела.')
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <main className="min-h-screen pt-[130px] text-center">
        <h1 className="font-display text-xl font-bold mb-3">Недействительная ссылка</h1>
        <p className="text-white/30 text-sm mb-5">Запросите сброс пароля заново.</p>
        <Link href="/auth/forgot-password" className="text-accent-light text-sm">Забыли пароль? →</Link>
      </main>
    )
  }

  if (done) {
    return (
      <main className="min-h-screen pt-[130px] text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="font-display text-xl font-bold mb-2">Пароль изменён</h1>
        <p className="text-white/30 text-sm mb-5">Теперь войдите с новым паролем.</p>
        <Link href="/auth/login" className="inline-flex bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
          Войти
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-[130px] pb-16 flex items-start justify-center">
      <div className="w-full max-w-[400px] mx-4">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight mb-2">Новый пароль</h1>
          <p className="text-white/30 text-sm">Придумайте новый пароль для <span className="text-white/50">{email}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-card rounded-2xl border border-white/[0.05] p-7">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          <div className="mb-4">
            <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">Новый пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition"
              placeholder="Минимум 8 символов" />
          </div>

          <div className="mb-6">
            <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">Повторите пароль</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition"
              placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-accent hover:bg-accent-dark text-white py-3.5 rounded-xl text-sm font-bold transition disabled:opacity-50">
            {loading ? 'Сохраняем...' : 'Сохранить пароль'}
          </button>
        </form>
      </div>
    </main>
  )
}
