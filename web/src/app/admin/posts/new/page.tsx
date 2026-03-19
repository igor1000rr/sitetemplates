'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'

export default function AdminNewPost() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', cover_image: '',
    category_id: '', tags: '', status: 'draft',
    meta_title: '', meta_desc: '',
  })

  useEffect(() => {
    adminApi.postCategories().then(({ data }) => setCategories(data.data || [])).catch(() => {})
  }, [])

  const save = async (status?: string) => {
    if (!form.title || !form.content) { setError('Заполните название и контент'); return }
    setSaving(true); setError('')
    try {
      await adminApi.postCreate({
        ...form,
        status: status || form.status,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      })
      router.push('/admin/posts')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка')
    } finally { setSaving(false) }
  }

  const handleImageUpload = async (file: File) => {
    try {
      const { data } = await adminApi.upload(file, 'blog')
      setForm(f => ({ ...f, cover_image: data.path || data.url }))
    } catch { setError('Ошибка загрузки') }
  }

  const inputCls = 'w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15'

  return (
    <div className="max-w-[800px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Новая статья</h2>
        <div className="flex gap-2">
          <button onClick={() => save('draft')} disabled={saving}
            className="bg-white/[0.05] text-white/50 px-4 py-2 rounded-xl text-sm hover:bg-white/[0.08] transition disabled:opacity-50">Сохранить черновик</button>
          <button onClick={() => save('published')} disabled={saving}
            className="bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-accent-dark transition disabled:opacity-50">Опубликовать</button>
        </div>
      </div>

      {error && <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">{error}</div>}

      <div className="space-y-5">
        <div>
          <input className={`${inputCls} !text-lg !font-bold !py-3`} value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Заголовок статьи" />
        </div>

        <div>
          <input className={inputCls} value={form.excerpt}
            onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Краткое описание (для каталога и SEO)" maxLength={500} />
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-white/30 text-xs mb-1.5">Обложка</label>
          {form.cover_image ? (
            <div className="relative aspect-[16/9] max-w-sm rounded-xl overflow-hidden bg-bg-surface group">
              <img src={form.cover_image} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setForm(f => ({ ...f, cover_image: '' }))}
                className="absolute top-2 right-2 bg-black/60 text-white w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs">✕</button>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div className="px-4 py-8 bg-white/[0.02] border border-dashed border-white/[0.08] rounded-xl text-center hover:border-accent/20 transition">
                <p className="text-white/20 text-sm">Загрузить обложку</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
            </label>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/30 text-xs mb-1.5">Категория</label>
            <select className={inputCls} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
              <option value="">Без категории</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-white/30 text-xs mb-1.5">Теги (через запятую)</label>
            <input className={inputCls} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="SEO, WordPress, дизайн" />
          </div>
        </div>

        {/* Content editor */}
        <div>
          <label className="block text-white/30 text-xs mb-1.5">Контент (HTML)</label>
          <textarea
            className={`${inputCls} min-h-[400px] font-mono text-[13px]`}
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="<h2>Заголовок</h2><p>Текст статьи...</p>"
          />
          <p className="text-white/10 text-[10px] mt-1">Поддерживается HTML. Используйте h2, h3, p, ul, ol, blockquote, pre, code, img.</p>
        </div>

        {/* SEO */}
        <div className="pt-4 border-t border-white/[0.05]">
          <h3 className="text-sm font-bold mb-3">SEO</h3>
          <div className="space-y-3">
            <input className={inputCls} value={form.meta_title}
              onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} placeholder="Meta title (по умолчанию = заголовок)" />
            <textarea className={`${inputCls} min-h-[60px]`} value={form.meta_desc}
              onChange={e => setForm(f => ({ ...f, meta_desc: e.target.value }))} placeholder="Meta description (по умолчанию = excerpt)" maxLength={500} />
          </div>
        </div>
      </div>
    </div>
  )
}
