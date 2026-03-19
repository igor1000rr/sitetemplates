'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h1 className="font-display text-xl font-bold mb-2">Что-то пошло не так</h1>
        <p className="text-white/30 text-sm mb-6 max-w-md">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset}
            className="bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
            Попробовать снова
          </button>
          <Link href="/"
            className="bg-white/[0.04] border border-white/[0.06] text-white/50 px-6 py-2.5 rounded-xl text-sm font-semibold hover:text-white/80 transition">
            На главную
          </a>
        </div>
      </div>
    </main>
  )
}
