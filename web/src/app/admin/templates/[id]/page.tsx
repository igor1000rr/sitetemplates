'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import FileUpload from '@/components/ui/FileUpload'

export default function AdminTemplateEditorPage() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'new'
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [platforms, setPlatforms] = useState<any[]>([])

  const [form, setForm] = useState({
    title: '', slug: '', description: '', short_desc: '',
    price: '', old_price: '',
    category_id: '', platform_id: '',
    template_type: 'landing',
    demo_url: '', zip_path: '',
    features: '',
    tags: '',
    meta_title: '', meta_desc: '',
    status: 'draft',
    is_featured: false,
  })
  const [images, setImages] = useState<{ path: string; alt: string; is_main: boolean }[]>([])

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/platforms'),
    ]).then(([cats, plats]) => {
      setCategories(cats.data)
      setPlatforms(plats.data)
    })

    if (!isNew) {
      api.get(`/admin/templates/${params.id}`).then(({ data }) => {
        const t = data.data || data.template || data
        setForm({
          title: t.title || '',
          slug: t.slug || '',
          description: t.description || '',
          short_desc: t.short_desc || '',
          price: t.price ? String(t.price / 100) : '',
          old_price: t.old_price ? String(t.old_price / 100) : '',
          category_id: String(t.category?.id || t.category_id || ''),
          platform_id: String(t.platform?.id || t.platform_id || ''),
          template_type: t.template_type || 'landing',
          demo_url: t.demo_url || '',
          zip_path: t.zip_path || '',
          features: (t.features || []).join(', '),
          tags: (t.tags || []).join(', '),
          meta_title: t.meta_title || '',
          meta_desc: t.meta_desc || '',
          status: t.status || 'draft',
          is_featured: t.is_featured || false,
        })
        if (t.images?.length) {
          setImages(t.images.map((img: any) => ({
            path: img.path, alt: img.alt || '', is_main: img.is_main || false,
          })))
        }
        setLoading(false)
      }).catch(() => router.push('/admin/templates'))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Math.round(parseFloat(form.price) * 100),
        old_price: form.old_price ? Math.round(parseFloat(form.old_price) * 100) : null,
        category_id: parseInt(form.category_id),
        platform_id: parseInt(form.platform_id),
        features: form.features.split(',').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        images: images.length > 0 ? images : undefined,
      }

      if (isNew) {
        await api.post('/admin/templates', payload)
      } else {
        await api.put(`/admin/templates/${params.id}`, payload)
      }
      router.push('/admin/templates')
    } catch (err: any) {
      const msgs = err.response?.data?.errors
      if (msgs) alert(Object.values(msgs).flat().join('\n'))
      else alert(err.response?.data?.message || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }))

  if (loading) return <div className="animate-pulse h-40 bg-bg-card rounded-xl border border-white/[0.05]" />

  return (
    <div>
      <h2 className="font-display text-lg font-bold mb-6">
        {isNew ? 'Новый шаблон' : 'Редактирование шаблона'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-[800px]">
        {/* Title + Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Название" required>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              className="input" placeholder="Мебель и кухни на заказ" />
          </Field>
          <Field label="Slug (URL)">
            <input value={form.slug} onChange={e => set('slug', e.target.value)}
              className="input" placeholder="mebel-kuhni (авто из названия)" />
          </Field>
        </div>

        {/* Short desc */}
        <Field label="Краткое описание">
          <input value={form.short_desc} onChange={e => set('short_desc', e.target.value)}
            className="input" placeholder="Для карточки в каталоге" />
        </Field>

        {/* Description */}
        <Field label="Полное описание">
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={5} className="input resize-y" placeholder="Подробное описание шаблона..." />
        </Field>

        {/* Price */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Цена (₽)" required>
            <input type="number" value={form.price} onChange={e => set('price', e.target.value)} required
              className="input" placeholder="4990" />
          </Field>
          <Field label="Старая цена (₽)">
            <input type="number" value={form.old_price} onChange={e => set('old_price', e.target.value)}
              className="input" placeholder="15000" />
          </Field>
          <Field label="Категория" required>
            <select value={form.category_id} onChange={e => set('category_id', e.target.value)} required className="input">
              <option value="">—</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Платформа" required>
            <select value={form.platform_id} onChange={e => set('platform_id', e.target.value)} required className="input">
              <option value="">—</option>
              {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
        </div>

        {/* Type + Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Тип">
            <select value={form.template_type} onChange={e => set('template_type', e.target.value)} className="input">
              <option value="landing">Лендинг</option>
              <option value="multipage">Многостраничный</option>
              <option value="shop">Магазин</option>
              <option value="quiz">Квиз</option>
            </select>
          </Field>
          <Field label="Статус">
            <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
              <option value="draft">Черновик</option>
              <option value="published">Опубликован</option>
              <option value="archived">Архив</option>
            </select>
          </Field>
          <Field label="Демо URL">
            <input value={form.demo_url} onChange={e => set('demo_url', e.target.value)}
              className="input" placeholder="https://demo.site.ru" />
          </Field>
          <Field label="ZIP путь (S3)">
            <input value={form.zip_path} onChange={e => set('zip_path', e.target.value)}
              className="input" placeholder="templates/zips/xxx.zip" />
          </Field>
        </div>

        {/* Features + Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Фичи (через запятую)">
            <input value={form.features} onChange={e => set('features', e.target.value)}
              className="input" placeholder="WooCommerce, Квиз, Каталог" />
          </Field>
          <Field label="Теги (через запятую)">
            <input value={form.tags} onChange={e => set('tags', e.target.value)}
              className="input" placeholder="мебель, кухни, магазин" />
          </Field>
        </div>

        {/* Images */}
        <div>
          <label className="block text-white/30 text-[11px] font-semibold uppercase tracking-wider mb-2">Изображения</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative w-[120px] h-[80px] rounded-lg overflow-hidden border border-white/[0.06] group">
                <img src={img.path} alt={img.alt} className="w-full h-full object-cover" />
                {img.is_main && (
                  <span className="absolute top-1 left-1 bg-accent/80 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">MAIN</span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                  <button type="button" onClick={() => {
                    setImages(prev => prev.map((img, j) => ({ ...img, is_main: j === i })))
                  }} className="text-white/80 text-[10px] bg-white/10 px-2 py-1 rounded">★</button>
                  <button type="button" onClick={() => {
                    setImages(prev => prev.filter((_, j) => j !== i))
                  }} className="text-red-400 text-[10px] bg-white/10 px-2 py-1 rounded">✕</button>
                </div>
              </div>
            ))}
          </div>
          <FileUpload
            type="image"
            label=""
            onUploaded={(result) => {
              setImages(prev => [...prev, {
                path: result.url || result.path,
                alt: form.title,
                is_main: prev.length === 0,
              }])
            }}
          />
        </div>

        {/* ZIP upload */}
        <FileUpload
          type="zip"
          label="ZIP файл шаблона"
          onUploaded={(result) => set('zip_path', result.path)}
        />
        {form.zip_path && (
          <p className="text-accent-light text-xs -mt-4">Загружен: {form.zip_path}</p>
        )}

        {/* SEO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Meta Title">
            <input value={form.meta_title} onChange={e => set('meta_title', e.target.value)}
              className="input" placeholder="SEO заголовок" />
          </Field>
          <Field label="Meta Description">
            <input value={form.meta_desc} onChange={e => set('meta_desc', e.target.value)}
              className="input" placeholder="SEO описание" />
          </Field>
        </div>

        {/* Featured */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)}
            className="w-4 h-4 rounded border-white/10 bg-white/[0.03] text-accent" />
          <span className="text-white/50 text-sm">Показывать на главной (featured)</span>
        </label>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50">
            {saving ? 'Сохраняем...' : isNew ? 'Создать' : 'Сохранить'}
          </button>
          <button type="button" onClick={() => router.push('/admin/templates')}
            className="bg-white/[0.04] border border-white/[0.06] text-white/40 px-6 py-3 rounded-xl text-sm font-semibold hover:text-white/70 transition">
            Отмена
          </button>
        </div>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          padding: 10px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .input:focus { border-color: rgba(139,92,246,0.3); }
        .input::placeholder { color: rgba(255,255,255,0.12); }
        select.input { appearance: auto; }
      `}</style>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/30 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {children}
    </div>
  )
}
