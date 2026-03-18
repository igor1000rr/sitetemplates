import type { Metadata } from 'next'
import Image from 'next/image'
import AddToCartButton from '@/components/templates/AddToCartButton'
import ServiceSelector from '@/components/templates/ServiceSelector'
import ReviewForm from '@/components/templates/ReviewForm'
import TemplateActions from '@/components/templates/TemplateActions'
import TemplateGallery from '@/components/templates/TemplateGallery'
import ShareButtons from '@/components/shared/ShareButtons'
import TrackView from '@/components/shared/TrackView'
import RecentlyViewed from '@/components/shared/RecentlyViewed'
import { ProductSchema, BreadcrumbSchema } from '@/components/seo/JsonLd'
import CountdownTimer from '@/components/shared/CountdownTimer'

const API_URL = process.env.API_URL || 'http://localhost:8000'

interface Props { params: { slug: string } }

async function getTemplate(slug: string) {
  const res = await fetch(`${API_URL}/api/templates/${slug}`, { next: { revalidate: 60 } })
  if (!res.ok) return null
  return await res.json()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getTemplate(params.slug)
  const t = data?.template
  if (!t) return { title: 'Шаблон не найден' }
  return {
    title: t.meta_title || t.title,
    description: t.meta_desc || t.short_desc,
    openGraph: { title: t.title, description: t.short_desc, images: t.images?.[0]?.path ? [t.images[0].path] : [] },
  }
}

export default async function TemplatePage({ params }: Props) {
  const data = await getTemplate(params.slug)

  if (!data?.template) {
    return (
      <main className="min-h-screen pt-[80px] text-center">
        <h1 className="text-2xl font-bold mb-4">Шаблон не найден</h1>
        <a href="/templates" className="text-accent-light">← Вернуться в каталог</a>
      </main>
    )
  }

  const t = data.template
  const similar = data.similar || []

  const cartItem = {
    id: t.id,
    title: t.title,
    slug: t.slug,
    price: t.price,
    price_rub: t.price_rub,
    old_price_rub: t.old_price_rub,
    image: t.images?.[0]?.path || null,
    platform: t.platform.name,
  }

  return (
    <main className="min-h-screen pt-[20px] pb-16">
      <ProductSchema
        name={t.title}
        description={t.short_desc || t.description?.slice(0, 200) || ''}
        image={t.images?.[0]?.path}
        price={t.price_rub}
        rating={t.reviews_count > 0 ? t.rating : undefined}
        reviewCount={t.reviews_count > 0 ? t.reviews_count : undefined}
        url={`https://templatename.ru/templates/${t.slug}`}
        category={t.category?.name}
        brand={t.platform?.name}
      />
      <BreadcrumbSchema items={[
        { name: 'Главная', url: 'https://templatename.ru' },
        { name: 'Каталог', url: 'https://templatename.ru/templates' },
        { name: t.category?.name, url: `https://templatename.ru/templates?category=${t.category?.slug}` },
        { name: t.title, url: `https://templatename.ru/templates/${t.slug}` },
      ]} />

      {/* Track view */}
      <TrackView template={{
        id: t.id, title: t.title, slug: t.slug,
        image: t.images?.[0]?.path, price_rub: t.price_rub, platform: t.platform.name,
      }} />

      <div className="max-w-[1200px] mx-auto px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-white/25 mb-8">
          <a href="/" className="hover:text-white/50 transition">Главная</a>
          <span>/</span>
          <a href="/templates" className="hover:text-white/50 transition">Каталог</a>
          <span>/</span>
          <a href={`/templates?category=${t.category.slug}`} className="hover:text-white/50 transition">{t.category.name}</a>
          <span>/</span>
          <span className="text-white/40">{t.title}</span>
        </div>

        <div className="flex gap-10 flex-wrap lg:flex-nowrap">
          {/* Gallery */}
          <div className="flex-1 min-w-[300px]">
            <TemplateGallery images={t.images || []} title={t.title} />

            {/* Share */}
            <div className="mt-4">
              <ShareButtons url={`/templates/${t.slug}`} title={t.title} description={t.short_desc} />
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="font-display text-lg font-bold mb-4">Описание</h2>
              <div className="text-white/40 text-sm leading-relaxed whitespace-pre-line">{t.description}</div>
            </div>

            {/* Tech specs */}
            {Object.keys(t.tech_specs || {}).length > 0 && (
              <div className="mt-8">
                <h2 className="font-display text-lg font-bold mb-4">Технические требования</h2>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(t.tech_specs).map(([k, v]) => (
                    <div key={k} className="bg-bg-surface rounded-lg px-4 py-3 border border-white/[0.04]">
                      <div className="text-white/20 text-[10px] uppercase tracking-wider">{k}</div>
                      <div className="text-white/60 text-sm font-medium">{v as string}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="mt-10">
              <h2 className="font-display text-lg font-bold mb-4">
                Отзывы <span className="text-white/20 text-sm font-normal">({t.reviews_count})</span>
              </h2>

              {/* Review Form */}
              <div className="mb-6">
                <ReviewForm templateId={t.id} />
              </div>

              {t.reviews?.length > 0 && (
                <div className="flex flex-col gap-3">
                  {t.reviews.map((r: any) => (
                    <div key={r.id} className="bg-bg-surface rounded-xl p-5 border border-white/[0.05]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= r.rating ? '#a78bfa' : 'rgba(255,255,255,0.1)'}>
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                            </svg>
                          ))}
                        </div>
                        <span className="text-white/60 text-sm font-semibold">{r.user}</span>
                        <span className="text-white/15 text-xs">{r.created_at}</span>
                      </div>
                      <p className="text-white/40 text-sm">{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-[360px] shrink-0">
            <div className="sticky top-[110px]">
              <div className="bg-bg-card rounded-2xl border border-white/[0.05] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-accent/[0.08] text-accent-light px-3 py-1 rounded-md text-xs font-semibold">{t.platform.name}</span>
                  <span className="text-white/25 text-xs">{t.template_type}</span>
                  <span className="text-white/25 text-xs">v{t.version}</span>
                </div>

                <h1 className="font-display text-xl font-bold tracking-tight mb-4">{t.title}</h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= Math.round(t.rating) ? '#a78bfa' : 'rgba(255,255,255,0.1)'}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-white/30 text-xs">{t.rating} ({t.reviews_count} отзывов)</span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {t.old_price_rub && (
                    <span className="text-white/20 text-sm line-through mr-3">{t.old_price_rub.toLocaleString('ru-RU')} ₽</span>
                  )}
                  <span className="text-accent-pale text-3xl font-extrabold tracking-tight">
                    {t.price_rub.toLocaleString('ru-RU')}<span className="text-lg font-medium ml-0.5">₽</span>
                  </span>
                  {t.discount_percent && (
                    <span className="ml-2 bg-accent/20 text-accent-pale px-2 py-0.5 rounded text-xs font-bold">-{t.discount_percent}%</span>
                  )}
                </div>

                {/* Urgency timer for discounted items */}
                {t.discount_percent && (
                  <div className="mb-4">
                    <CountdownTimer label={`Скидка ${t.discount_percent}% — успейте`} />
                  </div>
                )}

                {/* Add to cart */}
                <div className="mb-3">
                  <AddToCartButton item={cartItem} />
                </div>

                {/* Доп. услуги */}
                <ServiceSelector templateId={t.id} />

                {t.demo_url && (
                  <a href={`/preview/${t.slug}`}
                    className="w-full bg-white/[0.04] border border-white/[0.06] text-white/60 py-3 rounded-xl text-sm font-semibold hover:text-white/80 hover:border-accent/15 transition flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    Live Preview
                  </a>
                )}

                {/* Subscription / Deploy / Wishlist / Compare */}
                <div className="mt-3">
                  <TemplateActions
                    templateId={t.id}
                    templateTitle={t.title}
                    templateSlug={t.slug}
                    previewImage={t.images?.[0]?.path}
                  />
                </div>}

                {/* Features */}
                <div className="mt-6 pt-5 border-t border-white/[0.05]">
                  <h4 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3">Включено</h4>
                  <div className="flex flex-col gap-2">
                    {t.features?.map((f: string) => (
                      <div key={f} className="flex items-center gap-2 text-white/50 text-sm">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-5 pt-5 border-t border-white/[0.05] flex gap-6">
                  <div>
                    <div className="text-white/15 text-[10px] uppercase tracking-wider">Продажи</div>
                    <div className="text-white/60 text-sm font-semibold">{t.sales_count}</div>
                  </div>
                  <div>
                    <div className="text-white/15 text-[10px] uppercase tracking-wider">Просмотры</div>
                    <div className="text-white/60 text-sm font-semibold">{t.views_count}</div>
                  </div>
                </div>

                {/* Share */}
                <div className="mt-5 pt-5 border-t border-white/[0.05]">
                  <ShareButtons url={`/templates/${t.slug}`} title={t.title} description={t.short_desc} />
                </div>

                {/* Trust badges */}
                <div className="mt-5 pt-5 border-t border-white/[0.05] space-y-2">
                  {[
                    { icon: '🔒', text: 'Безопасная оплата через ЮKassa' },
                    { icon: '↩️', text: 'Возврат в течение 14 дней' },
                    { icon: '📦', text: 'Мгновенный доступ после оплаты' },
                    { icon: '🔄', text: 'Бесплатные обновления' },
                  ].map((b) => (
                    <div key={b.text} className="flex items-center gap-2">
                      <span className="text-xs">{b.icon}</span>
                      <span className="text-white/20 text-[11px]">{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-xl font-bold mb-6">Похожие шаблоны</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {similar.map((s: any) => (
                <a key={s.id} href={`/templates/${s.slug}`} className="group bg-bg-card rounded-xl overflow-hidden border border-white/[0.05] hover:border-accent/15 transition">
                  <div className="aspect-[16/10] bg-bg-surface overflow-hidden">
                    {s.image && <Image src={s.image} alt={s.title} width={480} height={300} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold leading-snug mb-2 line-clamp-2">{s.title}</h3>
                    <span className="text-accent-pale text-lg font-bold">{s.price_rub?.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Recently viewed */}
        <RecentlyViewed excludeId={t.id} />
      </div>
    </main>
  )
}
