'use client'

import { useState } from 'react'
import { useAuth } from '@/stores/auth'
import { reviewsApi } from '@/lib/api'

interface Props {
  templateId: number
  onSubmitted?: () => void
}

export default function ReviewForm({ templateId, onSubmitted }: Props) {
  const { isAuthenticated } = useAuth()
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isAuthenticated) {
    return (
      <div className="bg-bg-surface rounded-xl border border-white/[0.04] p-5 text-center">
        <p className="text-white/30 text-sm">
          <a href="/auth/login" className="text-accent-light hover:text-accent-pale transition">Войдите</a>, чтобы оставить отзыв
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-5 text-center">
        <p className="text-green-400 text-sm font-medium">✓ Отзыв отправлен на модерацию</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    setError('')
    try {
      await reviewsApi.create({ template_id: templateId, rating, text })
      setSuccess(true)
      onSubmitted?.()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bg-surface rounded-xl border border-white/[0.04] p-5">
      <h4 className="text-sm font-bold mb-4">Оставить отзыв</h4>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(s)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <svg width="20" height="20" viewBox="0 0 24 24"
              fill={(hover || rating) >= s ? '#a78bfa' : 'rgba(255,255,255,0.08)'}
              className="transition-colors"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
            </svg>
          </button>
        ))}
        <span className="text-white/20 text-xs ml-2">{rating} из 5</span>
      </div>

      {/* Text */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        required
        placeholder="Расскажите о вашем опыте использования шаблона..."
        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/12 resize-y mb-3"
      />

      <button
        type="submit"
        disabled={loading || !text.trim()}
        className="bg-accent hover:bg-accent-dark text-white px-6 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
      >
        {loading ? 'Отправляем...' : 'Отправить отзыв'}
      </button>
    </form>
  )
}
