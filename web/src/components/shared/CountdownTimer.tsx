'use client'

import { useState, useEffect } from 'react'

interface Props {
  /** End date ISO string or "daily" for daily reset at midnight */
  deadline?: string | 'daily'
  /** Label text */
  label?: string
  /** Compact mode for inline usage */
  compact?: boolean
}

function getTimeLeft(target: Date): { h: number; m: number; s: number; expired: boolean } {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true }
  return {
    h: Math.floor(diff / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    expired: false,
  }
}

function getEndOfDay(): Date {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

export default function CountdownTimer({ deadline = 'daily', label = 'Скидка действует', compact }: Props) {
  const [target] = useState(() => deadline === 'daily' ? getEndOfDay() : new Date(deadline))
  const [time, setTime] = useState(getTimeLeft(target))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeLeft(target))
    }, 1000)
    return () => clearInterval(interval)
  }, [target])

  if (time.expired) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
      </span>
    )
  }

  return (
    <div className="bg-amber-500/[0.06] border border-amber-500/15 rounded-xl px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-sm">🔥</span>
          <span className="text-amber-400/80 text-xs font-semibold">{label}</span>
        </div>
        <div className="flex items-center gap-1 font-mono">
          <span className="bg-amber-500/10 text-amber-300 px-2 py-1 rounded text-sm font-bold min-w-[32px] text-center">{pad(time.h)}</span>
          <span className="text-amber-500/40 text-xs">:</span>
          <span className="bg-amber-500/10 text-amber-300 px-2 py-1 rounded text-sm font-bold min-w-[32px] text-center">{pad(time.m)}</span>
          <span className="text-amber-500/40 text-xs">:</span>
          <span className="bg-amber-500/10 text-amber-300 px-2 py-1 rounded text-sm font-bold min-w-[32px] text-center">{pad(time.s)}</span>
        </div>
      </div>
    </div>
  )
}
