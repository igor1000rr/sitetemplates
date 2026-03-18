'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authorApi, catalogApi } from '@/lib/api'

export default function AuthorNewTemplate() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [platforms, setPlatforms] = useState<any[]>([])

  const [form, setForm] = useState({
    title: '', description: '', short_desc: '', price: '',
    old_price: '', category_id: '', platform_id: '',
    template_type: 'landing', demo_url: '', features: '',
    tags: '', zip_path: '', images: [] as { path: string; alt: string }[],
  })

  useEffect(() => {
    catalogApi.categories().then(({ data }) => setCategories(data.data || data || []))
    catalogApi.platforms().then(({ data }) => setPlatforms(data.data || data || []))
  }, [])

  const handleFileUpload = async (file: File, type: 'zip' | 'image') => {
    try {
      const { data } = await authorApi.upload(file, type === 'zip' ? 'templates' : 'images')
      if (type === 'zip') {
        setForm(f => ({ ...f, zip_path: data.path }))
      } else {
        setForm(f => ({ ...f, images: [...f.images, { path: data.path || data.url, alt: '' }] }))
      }
    } catch { setError('Ошибка загрузки файла') }
  }

  const submit = async () => {
    setError('')
    if (!form.title || !form.price || !form.category_id || !form.platform_id || !form.zip_path) {
      setError('Заполните обязательные поля: название, цена, категория, платформа, ZIP-архив')
      return
    }
    setLoading(true)
    try {
      await authorApi.templateCreate({
        ...form,
        price: Math.round(parseFloat(form.price) * 100),
        old_price: form.old_price ? Math.round(parseFloat(form.old_price) * 100) : null,
        category_id: parseInt(form.category_id),
        platform_id: parseInt(form.platform_id),
        features: form.features ? form.features.split(',').map(s => s.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      })
      router.push('/author/templates')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка создания шаблона')
    } finally { setLoading(false) }
  }

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="block text-white/40 text-xs font-medium mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )

  const inputCls = 'w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm outline-none focus:border-accent/30 transition placeholder:text-white/15'

  return (
    <div className="max-w-[700px]">
      <h2 className="text-lg font-bold mb-6">Загрузить шаблон</h2>

      {error && <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">{error}</div>}

      <div className="space-y-5">
        <Field label="Название" required>
          <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Стоматология — сайт клиники" />
        </Field>

        <Field label="Краткое описание">
          <input className={inputCls} value={form.short_desc} onChange={e => setForm(f => ({ ...f, short_desc: e.target.value }))} placeholder="Современный шаблон для стоматологии" maxLength={300} />
        </Field>

        <Field label="Полное описание">
          <textarea className={`${inputCls} min-h-[120px]`} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Подробное описание шаблона..." />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Цена (₽)" required>
            <input type="number" className={inputCls} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="4990" min="99" />
          </Field>
          <Field label="Старая цена (₽)">
            <input type="number" className={inputCls} value={form.old_price} onChange={e => setForm(f => ({ ...f, old_price: e.target.value }))} placeholder="15000" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Категория" required>
            <select className={inputCls} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
              <option value="">Выберите</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Платформа" required>
            <select className={inputCls} value={form.platform_id} onChange={e => setForm(f => ({ ...f, platform_id: e.target.value }))}>
              <option value="">Выберите</option>
              {platforms.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Тип">
            <select className={inputCls} value={form.template_type} onChange={e => setForm(f => ({ ...f, template_type: e.target.value }))}>
              <option value="landing">Лендинг</option>
              <option value="multipage">Многостраничный</option>
              <option value="shop">Интернет-магазин</option>
              <option value="quiz">Квиз</option>
            </select>
          </Field>
          <Field label="Demo URL">
            <input className={inputCls} value={form.demo_url} onChange={e => setForm(f => ({ ...f, demo_url: e.target.value }))} placeholder="https://demo.example.com" />
          </Field>
        </div>

        <Field label="Фичи (через запятую)">
          <input className={inputCls} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder="WooCommerce, Квиз, Адаптив, SEO" />
        </Field>

        <Field label="Теги (через запятую)">
          <input className={inputCls} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="стоматология, клиника, медицина" />
        </Field>

        {/* ZIP upload */}
        <Field label="ZIP-архив шаблона" required>
          {form.zip_path ? (
            <div className="flex items-center gap-3 px-4 py-3 bg-green-500/[0.06] border border-green-500/15 rounded-xl">
              <span className="text-green-400 text-sm">✓ Файл загружен</span>
              <button onClick={() => setForm(f => ({ ...f, zip_path: '' }))} className="text-white/20 text-xs hover:text-white/50 ml-auto">Удалить</button>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div className="px-4 py-6 bg-white/[0.02] border border-dashed border-white/[0.08] rounded-xl text-center hover:border-accent/20 transition">
                <p className="text-white/25 text-sm">Нажмите для загрузки ZIP</p>
                <p className="text-white/10 text-xs mt-1">.zip до 100MB</p>
              </div>
              <input type="file" accept=".zip" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'zip')} />
            </label>
          )}
        </Field>

        {/* Image upload */}
        <Field label="Скриншоты (до 8)">
          <div className="flex flex-wrap gap-2">
            {form.images.map((img, i) => (
              <div key={i} className="relative w-24 h-16 rounded-lg overflow-hidden bg-bg-surface group">
                <img src={img.path} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
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
        </Field>

        <div className="pt-4">
          <button onClick={submit} disabled={loading}
            className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent-dark transition disabled:opacity-50">
            {loading ? 'Отправляем...' : 'Отправить на модерацию'}
          </button>
          <p className="text-white/15 text-xs text-center mt-2">После проверки шаблон будет опубликован в каталоге</p>
        </div>
      </div>
    </div>
  )
}
