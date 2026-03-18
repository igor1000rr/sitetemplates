'use client'

import { useState, useEffect, useRef } from 'react'
import { deployApi } from '@/lib/api'

interface Props {
  templateId: number
  templateTitle: string
  onClose: () => void
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'В очереди...', color: 'text-yellow-400' },
  deploying: { label: 'Установка...', color: 'text-blue-400' },
  completed: { label: 'Установлен ✓', color: 'text-green-400' },
  failed: { label: 'Ошибка', color: 'text-red-400' },
}

export default function DeployModal({ templateId, templateTitle, onClose }: Props) {
  const [step, setStep] = useState<'form' | 'progress'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deployment, setDeployment] = useState<any>(null)
  const pollRef = useRef<NodeJS.Timeout>()

  const [form, setForm] = useState({
    method: 'ftp',
    host: '',
    port: '',
    username: '',
    password: '',
    remote_path: '/public_html',
  })

  // Polling for status
  useEffect(() => {
    if (deployment && ['pending', 'deploying'].includes(deployment.status)) {
      pollRef.current = setInterval(async () => {
        try {
          const { data } = await deployApi.status(deployment.id)
          setDeployment(data.deployment)
          if (['completed', 'failed'].includes(data.deployment.status)) {
            clearInterval(pollRef.current!)
          }
        } catch {}
      }, 3000)
    }
    return () => clearInterval(pollRef.current!)
  }, [deployment?.id, deployment?.status])

  const handleDeploy = async () => {
    if (!form.host || !form.username || !form.password) {
      setError('Заполните все обязательные поля')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await deployApi.create({
        template_id: templateId,
        method: form.method,
        host: form.host,
        port: form.port ? parseInt(form.port) : undefined,
        username: form.username,
        password: form.password,
        remote_path: form.remote_path || '/public_html',
      })
      setDeployment(data.deployment)
      setStep('progress')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка запуска деплоя')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15'
  const st = deployment ? statusLabels[deployment.status] || {} : {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[480px] bg-bg-card border border-white/[0.05] rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/20 hover:text-white/50 transition">✕</button>

        <h2 className="font-display text-lg font-bold mb-1">Установить на хостинг</h2>
        <p className="text-white/25 text-sm mb-5">{templateTitle}</p>

        {step === 'form' ? (
          <div className="space-y-4">
            {error && <div className="bg-red-500/10 text-red-400 px-3 py-2 rounded-lg text-sm">{error}</div>}

            <div>
              <label className="block text-white/30 text-xs mb-1">Протокол</label>
              <div className="flex gap-2">
                {['ftp', 'sftp'].map(m => (
                  <button key={m} onClick={() => setForm(f => ({ ...f, method: m, port: '' }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${form.method === m ? 'bg-accent/15 text-accent-pale' : 'bg-white/[0.03] text-white/30'}`}>
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-white/30 text-xs mb-1">Хост *</label>
                <input className={inputCls} value={form.host}
                  onChange={e => setForm(f => ({ ...f, host: e.target.value }))}
                  placeholder="ftp.example.com" />
              </div>
              <div>
                <label className="block text-white/30 text-xs mb-1">Порт</label>
                <input className={inputCls} value={form.port}
                  onChange={e => setForm(f => ({ ...f, port: e.target.value }))}
                  placeholder={form.method === 'sftp' ? '22' : '21'} />
              </div>
            </div>

            <div>
              <label className="block text-white/30 text-xs mb-1">Логин *</label>
              <input className={inputCls} value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="ftp_user" />
            </div>

            <div>
              <label className="block text-white/30 text-xs mb-1">Пароль *</label>
              <input type="password" className={inputCls} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••" />
            </div>

            <div>
              <label className="block text-white/30 text-xs mb-1">Путь на сервере</label>
              <input className={inputCls} value={form.remote_path}
                onChange={e => setForm(f => ({ ...f, remote_path: e.target.value }))}
                placeholder="/public_html" />
            </div>

            <p className="text-white/10 text-[10px]">
              Данные зашифрованы и удаляются после деплоя. Мы не храним пароли.
            </p>

            <button onClick={handleDeploy} disabled={loading}
              className="w-full py-3 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent-dark transition disabled:opacity-50">
              {loading ? 'Запуск...' : 'Установить шаблон →'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-xl">
              {['pending', 'deploying'].includes(deployment?.status) && (
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              )}
              {deployment?.status === 'completed' && (
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✓</div>
              )}
              {deployment?.status === 'failed' && (
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs">✕</div>
              )}
              <div>
                <div className={`text-sm font-bold ${st.color || ''}`}>{st.label || deployment?.status}</div>
                <div className="text-white/15 text-xs">{deployment?.host} → {deployment?.remote_path}</div>
              </div>
            </div>

            {/* Log */}
            {deployment?.log && (
              <div className="bg-black/30 rounded-xl p-3 max-h-[200px] overflow-y-auto">
                <pre className="text-[11px] text-white/30 font-mono whitespace-pre-wrap">{deployment.log}</pre>
              </div>
            )}

            {/* Error */}
            {deployment?.error && (
              <div className="bg-red-500/10 text-red-400 px-3 py-2 rounded-lg text-sm">{deployment.error}</div>
            )}

            {deployment?.status === 'completed' && (
              <div className="text-center">
                <p className="text-green-400/60 text-sm mb-3">Шаблон успешно установлен!</p>
                <a href={`http://${deployment.host}`} target="_blank" rel="noopener"
                  className="text-accent-light hover:text-accent-pale transition text-sm">
                  Открыть сайт ↗
                </a>
              </div>
            )}

            <button onClick={onClose}
              className="w-full py-2.5 bg-white/[0.05] text-white/50 rounded-xl text-sm hover:bg-white/[0.08] transition">
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
