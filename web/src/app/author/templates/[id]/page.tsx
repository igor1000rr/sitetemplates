'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { authorApi, catalogApi } from '@/lib/api'

export default function AuthorEditTemplate() {
  const router = useRouter()
  const params = useParams()
  const id = parseInt(params.id as string)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [platforms, setPlatforms] = useState<any[]>([])
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      authorApi.templateShow(id),
      catalogApi.categories(),
      catalogApi.platforms(),
    ]).then(([tRes, cRes, pRes]) => {
      const t = tRes.data.data || tRes.data
      setForm({
        title: t.title, description: t.description || '', short_desc: t.short_desc || '',
        price: String(t.price / 100), old_price: t.old_price ? String(t.old_price / 100) : '',
        category_id: String(t.category?.id || ''), platform_id: String(t.platform?.id || ''),
        template_type: t.template_type, demo_url: t.demo_url || '',
        features: (t.features || []).join(', '), tags: (t.tags || []).join(', '),
        zip_path: t.zip_path || '', images: t.images || [], status: t.status,
      })
      setCategories(cRes.data.data || cRes.data || [])
      setPlatforms(pRes.data.data || pRes.data || [])
      setLoading(false)
    })
  }, [id])

  const handleFileUpload = async (file: File, type: 'zip' | 'image') => {
    try {
      const { data } = await authorApi.upload(file, type === 'zip' ? 'templates' : 'images')
      if (type === 'zip') {
        setForm((f: any) => ({ ...f, zip_path: data.path }))
      } else {
        setForm((f: any) => ({ ...f, images: [...f.images, { path: data.path || data.url, alt: '' }] }))
      }
    } catch { setError('Ошибка загрузки') }
  }

  const save = async () => {
    setError('')
    setSaving(true)
    try {
      await authorApi.templateUpdate(id, {
        ...form,
        price: Math.round(parseFloat(form.price) * 100),
        old_price: form.old_price ? Math.round(parseFloat(form.old_price) * 100) : null,
        category_id: parseInt(form.category_id),
        platform_id: parseInt(form.platform_id),
        features: form.features ? form.features.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        images: form.images.map((img: any) => ({ path: img.path, alt: img.alt || '' })),
      })
      router.push('/author/templates')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сохранения')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Удалить шаблон?')) return
    try {
      await authorApi.templateDelete(id)
      router.push('/author/templates')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка удаления')
    }
  }

  if (loading || !form) return <div className="animate-pulse text-white/20">Загрузка...</div>

  const inputCls = 'w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15'

  return (
    <div className="max-w-[700px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Редактировать шаблон</h2>
        <button onClick={handleDelete} className="text-red-400/50 hover:text-red-400 text-xs transition">Удалить</button>
      </div>

      {error && <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">{error}</div>}

      <div className="space-y-5">
        <div><label className="block text-white/40 text-xs mb-1.5">Название</label>
          <input className={inputCls} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>

        <div><label className="block text-white/40 text-xs mb-1.5">Краткое описание</label>
          <input className={inputCls} value={form.short_desc} onChange={e => setForm({ ...form, short_desc: e.target.value })} /></div>

        <div><label className="block text-white/40 text-xs mb-1.5">Описание</label>
          <textarea className={`${inputCls} min-h-[120px]`} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-white/40 text-xs mb-1.5">Цена (₽)</label>
            <input type="number" className={inputCls} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
          <div><label className="block text-white/40 text-xs mb-1.5">Старая цена (₽)</label>
            <input type="number" className={inputCls} value={form.old_price} onChange={e => setForm({ ...form, old_price: e.target.value })} /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-white/40 text-xs mb-1.5">Категория</label>
            <select className={inputCls} value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div><label className="block text-white/40 text-xs mb-1.5">Платформа</label>
            <select className={inputCls} value={form.platform_id} onChange={e => setForm({ ...form, platform_id: e.target.value })}>
              {platforms.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-white/40 text-xs mb-1.5">Тип</label>
            <select className={inputCls} value={form.template_type} onChange={e => setForm({ ...form, template_type: e.target.value })}>
              <option value="landing">Лендинг</option><option value="multipage">Многостраничный</option>
              <option value="shop">Интернет-магазин</option><option value="quiz">Квиз</option>
            </select></div>
          <div><label className="block text-white/40 text-xs mb-1.5">Demo URL</label>
            <input className={inputCls} value={form.demo_url} onChange={e => setForm({ ...form, demo_url: e.target.value })} /></div>
        </div>

        <div><label className="block text-white/40 text-xs mb-1.5">Фичи (через запятую)</label>
          <input className={inputCls} value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} /></div>

        <div><label className="block text-white/40 text-xs mb-1.5">Теги (через запятую)</label>
          <input className={inputCls} value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>

        {/* Images */}
        <div>
          <label className="block text-white/40 text-xs mb-1.5">Скриншоты</label>
          <div className="flex flex-wrap gap-2">
            {form.images.map((img: any, i: number) => (
              <div key={i} className="relative w-24 h-16 rounded-lg overflow-hidden bg-bg-surface group">
                <img src={img.path} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setForm({ ...form, images: form.images.filter((_: any, j: number) => j !== i) })}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">✕</button>
              </div>
            ))}
            {form.images.length < 8 && (
              <label className="w-24 h-16 rounded-lg border border-dashed border-white/[0.08] flex items-center justify-center cursor-pointer hover:border-accent/20 transition">
                <span className="text-white/15 text-lg">+</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')} />
              </label>
            )}
          </div>
        </div>

        <button onClick={save} disabled={saving}
          className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent-dark transition disabled:opacity-50">
          {saving ? 'Сохраняем...' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}
