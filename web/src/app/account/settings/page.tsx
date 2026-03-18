'use client'

import { useState } from 'react'
import { useAuth } from '@/stores/auth'
import { authApi } from '@/lib/api'

export default function SettingsPage() {
  const { user, loadUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Password
  const [curPass, setCurPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passSaving, setPassSaving] = useState(false)
  const [passSaved, setPassSaved] = useState(false)
  const [passError, setPassError] = useState('')

  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  const handleDelete = async () => {
    if (deleteConfirm !== 'УДАЛИТЬ') return
    setDeleting(true)
    try {
      await authApi.deleteAccount()
      window.location.href = '/'
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка удаления')
      setDeleting(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    try {
      await authApi.updateProfile({ name, phone })
      await loadUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сохранения')
    } finally { setSaving(false) }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassError(''); setPassSaved(false)
    if (newPass.length < 8) { setPassError('Минимум 8 символов'); return }
    if (newPass !== confirmPass) { setPassError('Пароли не совпадают'); return }

    setPassSaving(true)
    try {
      await authApi.changePassword({
        current_password: curPass,
        password: newPass,
        password_confirmation: confirmPass,
      })
      setPassSaved(true)
      setCurPass(''); setNewPass(''); setConfirmPass('')
      setTimeout(() => setPassSaved(false), 3000)
    } catch (err: any) {
      setPassError(err.response?.data?.message || 'Ошибка смены пароля')
    } finally { setPassSaving(false) }
  }

  return (
    <div>
      <h2 className="font-display text-lg font-bold mb-6">Настройки профиля</h2>

      {/* Profile form */}
      <form onSubmit={handleSave} className="bg-bg-card rounded-xl border border-white/[0.05] p-6 max-w-[500px] mb-8">
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
        {saved && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">Сохранено</div>}

        <div className="mb-4">
          <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
          <input type="email" value={user?.email || ''} disabled
            className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-white/30 text-sm cursor-not-allowed" />
        </div>

        <div className="mb-4">
          <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">Имя</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition" />
        </div>

        <div className="mb-6">
          <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">Телефон</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (999) 123-45-67"
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/12" />
        </div>

        <button type="submit" disabled={saving}
          className="bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50">
          {saving ? 'Сохраняем...' : 'Сохранить'}
        </button>
      </form>

      {/* Password change */}
      <h3 className="font-display text-base font-bold mb-4">Изменить пароль</h3>
      <form onSubmit={handlePasswordChange} className="bg-bg-card rounded-xl border border-white/[0.05] p-6 max-w-[500px]">
        {passError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{passError}</div>}
        {passSaved && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">Пароль изменён</div>}

        <div className="mb-4">
          <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">Текущий пароль</label>
          <input type="password" value={curPass} onChange={e => setCurPass(e.target.value)} required
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition"
            placeholder="••••••••" />
        </div>

        <div className="mb-4">
          <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">Новый пароль</label>
          <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required minLength={8}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition"
            placeholder="Минимум 8 символов" />
        </div>

        <div className="mb-6">
          <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">Повторите пароль</label>
          <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition"
            placeholder="••••••••" />
        </div>

        <button type="submit" disabled={passSaving}
          className="bg-white/[0.05] border border-white/[0.06] text-white/60 px-8 py-3 rounded-xl text-sm font-bold hover:text-white/80 transition disabled:opacity-50">
          {passSaving ? 'Меняем...' : 'Изменить пароль'}
        </button>
      </form>

      {/* Delete account */}
      <div className="mt-12 pt-8 border-t border-white/[0.04]">
        <h3 className="text-red-400 text-base font-bold mb-2">Опасная зона</h3>
        <p className="text-white/25 text-sm mb-4">
          Удаление аккаунта необратимо. Все ваши заказы, подписки и данные будут удалены навсегда.
        </p>
        <div className="bg-red-500/[0.04] border border-red-500/10 rounded-xl p-5 max-w-[500px]">
          <label className="block text-white/30 text-xs font-semibold uppercase tracking-wider mb-2">
            Введите УДАЛИТЬ для подтверждения
          </label>
          <input
            type="text"
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
            placeholder="УДАЛИТЬ"
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-red-500/30 transition placeholder:text-white/10 mb-4"
          />
          <button
            onClick={handleDelete}
            disabled={deleteConfirm !== 'УДАЛИТЬ' || deleting}
            className="bg-red-500/15 border border-red-500/20 text-red-400 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-500/25 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {deleting ? 'Удаляем...' : 'Удалить аккаунт навсегда'}
          </button>
        </div>
      </div>
    </div>
  )
}
