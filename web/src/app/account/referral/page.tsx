'use client'

import { useState, useEffect } from 'react'
import { referralApi } from '@/lib/api'

export default function AccountReferral() {
  const [stats, setStats] = useState<any>(null)
  const [rewards, setRewards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    Promise.all([referralApi.stats(), referralApi.rewards()])
      .then(([s, r]) => {
        setStats(s.data)
        setRewards(r.data.data || [])
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [])

  const generateCode = async () => {
    const { data } = await referralApi.generate()
    setStats((s: any) => ({ ...s, ...data }))
  }

  const copyLink = () => {
    if (!stats?.referral_url) return
    navigator.clipboard.writeText(stats.referral_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="animate-pulse text-white/20">Загрузка...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Реферальная программа</h2>

      {/* How it works */}
      <div className="p-5 bg-gradient-to-r from-accent/[0.06] to-purple-600/[0.04] rounded-2xl border border-accent/10">
        <h3 className="font-bold mb-2">Как это работает</h3>
        <div className="text-white/30 text-sm space-y-1.5">
          <p>1. Поделитесь реферальной ссылкой с друзьями</p>
          <p>2. Друг регистрируется и совершает покупку</p>
          <p>3. Вы получаете <strong className="text-accent-pale">{stats?.commission_percent || 10}%</strong> от каждого заказа</p>
        </div>
      </div>

      {/* Referral link */}
      <div className="p-5 bg-bg-card rounded-2xl border border-white/[0.05]">
        <div className="text-white/30 text-xs uppercase tracking-wider mb-2">Ваша ссылка</div>
        {stats?.referral_code ? (
          <div className="flex items-center gap-3">
            <input
              readOnly
              value={stats.referral_url}
              className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm font-mono"
            />
            <button onClick={copyLink}
              className="px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent-dark transition shrink-0">
              {copied ? '✓ Скопировано' : 'Копировать'}
            </button>
          </div>
        ) : (
          <button onClick={generateCode}
            className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
            Получить реферальную ссылку
          </button>
        )}
        {stats?.referral_code && (
          <div className="text-white/15 text-xs mt-2">Код: <span className="font-mono text-accent-pale/60">{stats.referral_code}</span></div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Рефералов', value: stats?.referrals_count || 0 },
          { label: 'Начислений', value: stats?.rewards_count || 0 },
          { label: 'Заработано', value: `${(stats?.total_earned_rub || 0).toLocaleString('ru-RU')} ₽` },
          { label: 'Баланс', value: `${(stats?.balance_rub || 0).toLocaleString('ru-RU')} ₽`, accent: true },
        ].map((s, i) => (
          <div key={i} className="p-4 bg-bg-card rounded-xl border border-white/[0.05]">
            <div className="text-white/20 text-[10px] uppercase tracking-wider mb-1">{s.label}</div>
            <div className={`text-xl font-bold ${s.accent ? 'text-accent-pale' : ''}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Rewards history */}
      <div>
        <h3 className="text-sm font-bold mb-3">История начислений</h3>
        {rewards.length === 0 ? (
          <div className="text-white/15 text-sm text-center py-8 bg-bg-card rounded-xl border border-white/[0.05]">
            Пока нет начислений. Поделитесь ссылкой!
          </div>
        ) : (
          <div className="space-y-2">
            {rewards.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-bg-card rounded-xl border border-white/[0.05]">
                <div>
                  <div className="text-sm">{r.description}</div>
                  <div className="text-white/15 text-xs">{r.referred_name} · {r.created_at}</div>
                </div>
                <div className="text-accent-pale font-bold text-sm">+{r.amount_rub} ₽</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
