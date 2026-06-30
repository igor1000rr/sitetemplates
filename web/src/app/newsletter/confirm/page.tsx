'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type State =
  | { kind: 'loading' }
  | { kind: 'ok'; promo: string | null; message: string }
  | { kind: 'error'; message: string }

export default function NewsletterConfirmPage() {
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const email = params.get('email')
    const token = params.get('token')

    if (!email || !token) {
      setState({ kind: 'error', message: 'Ссылка подтверждения неполная.' })
      return
    }

    fetch('/api/newsletter/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          setState({ kind: 'ok', promo: data.promo_code ?? null, message: data.message ?? 'Подписка подтверждена!' })
        } else {
          setState({ kind: 'error', message: data.message ?? 'Не удалось подтвердить подписку.' })
        }
      })
      .catch(() => setState({ kind: 'error', message: 'Не удалось подтвердить подписку. Попробуйте позже.' }))
  }, [])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-[480px] w-full bg-bg-card border border-white/[0.06] rounded-2xl shadow-2xl p-8 text-center">
        {state.kind === 'loading' && (
          <p className="text-white/50 text-sm">Подтверждаем подписку…</p>
        )}

        {state.kind === 'ok' && (
          <>
            <div className="text-3xl mb-3">🎉</div>
            <h1 className="text-white text-lg font-bold mb-2">{state.message}</h1>
            <p className="text-white/40 text-sm mb-4">Спасибо! Теперь вы будете получать подборки лучших шаблонов.</p>
            {state.promo && (
              <div className="bg-accent/[0.08] border border-accent/15 rounded-lg px-4 py-3 inline-block mb-5">
                <span className="text-white/40 text-[11px] block">Ваш промокод на скидку 10%:</span>
                <span className="text-accent-light font-bold text-base tracking-wider">{state.promo}</span>
              </div>
            )}
            <div>
              <Link href="/templates" className="inline-block bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
                Выбрать шаблон
              </Link>
            </div>
          </>
        )}

        {state.kind === 'error' && (
          <>
            <div className="text-3xl mb-3">⚠️</div>
            <h1 className="text-white text-lg font-bold mb-2">Не получилось</h1>
            <p className="text-white/40 text-sm mb-5">{state.message}</p>
            <Link href="/" className="inline-block bg-white/[0.06] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-white/[0.1] transition">
              На главную
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
