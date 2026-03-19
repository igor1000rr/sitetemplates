'use client'

import { useState } from 'react'
import { authApi } from '@/lib/api'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen pt-[130px] pb-16 flex items-start justify-center">
        <div className="w-full max-w-[400px] mx-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h1 className="font-display text-xl font-bold mb-2">Проверьте почту</h1>
          <p className="text-white/30 text-sm mb-6">
            Мы отправили ссылку для сброса пароля на <span className="text-white/50">{email}</span>. Ссылка действительна 60 минут.
          </p>
          <Link href="/auth/login" className="text-accent-light text-sm hover:text-accent-pale transition">
            ← Вернуться к входу
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-[130px] pb-16 flex items-start justify-center">
      <div className="w-full max-w-[400px] mx-4">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight mb-2">Забыли пароль?</h1>
          <p className="text-white/30 text-sm">Введите email — мы отправим ссылку для сброса</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-card rounded-2xl border border-white/[0.05] p-7">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          <div className="mb-6">
            <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="forgot-email">Email</label>
            <input type="email" id="forgot-email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15"
              placeholder="email@example.com" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-accent hover:bg-accent-dark text-white py-3.5 rounded-xl text-sm font-bold transition disabled:opacity-50">
            {loading ? 'Отправляем...' : 'Отправить ссылку'}
          </button>
        </form>

        <p className="text-center text-white/25 text-sm mt-5">
          <Link href="/auth/login" className="text-accent-light hover:text-accent-pale transition">← Вернуться к входу</Link>
        </p>
      </div>
    </main>
  )
}
