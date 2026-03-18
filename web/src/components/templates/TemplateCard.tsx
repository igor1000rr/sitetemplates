import type { TemplateListItem } from '@/types'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  template: TemplateListItem
  priority?: boolean
}

export default function TemplateCard({ template: t, priority }: Props) {
  const isNew = t.published_at ? (Date.now() - new Date(t.published_at).getTime()) < 14 * 24 * 60 * 60 * 1000 : false
  const isHot = t.sales_count >= 50

  return (
    <Link
      href={`/templates/${t.slug}`}
      className="group bg-bg-card rounded-[20px] overflow-hidden border border-white/[0.05] hover:border-accent/15 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] bg-bg-surface overflow-hidden">
        {t.image ? (
          <Image
            src={t.image}
            alt={t.title}
            width={640}
            height={400}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Badges — top right */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {t.discount_percent && (
            <span className="bg-accent/90 text-white px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-sm">
              -{t.discount_percent}%
            </span>
          )}
          {isNew && !t.discount_percent && (
            <span className="bg-emerald-500/90 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-bold backdrop-blur-sm">
              Новинка
            </span>
          )}
          {isHot && (
            <span className="bg-orange-500/90 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-bold backdrop-blur-sm">
              🔥 Хит
            </span>
          )}
        </div>

        {/* Subscription badge */}
        <div className="absolute top-3 left-3 bg-black/40 text-white/60 px-2 py-0.5 rounded-md text-[9px] font-medium backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">
          Доступен по подписке
        </div>

        {/* MacBook frame overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-[6px] bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Preview overlay */}
        {t.demo_url && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
            <span
              role="link"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/preview/${t.slug}` }}
              className="flex items-center gap-2 bg-white/15 backdrop-blur-md text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-white/25 transition border border-white/10 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              Live Preview
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 pb-6">
        {/* Tags */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-accent/[0.08] text-accent-light px-3 py-1 rounded-md text-[11px] font-semibold">
            {t.platform?.name || 'WordPress'}
          </span>
          <span className="text-white/25 text-[11px] capitalize">{t.template_type}</span>
          {t.rating > 0 && (
            <span className="ml-auto flex items-center gap-1 text-white/25 text-[11px]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#a78bfa">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
              </svg>
              {t.rating}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-white text-[16px] font-bold leading-snug mb-3 tracking-tight line-clamp-2 group-hover:text-accent-pale transition-colors">
          {t.title}
        </h3>

        {/* Features */}
        {t.features?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {t.features.slice(0, 3).map((f) => (
              <span key={f} className="bg-white/[0.03] text-white/30 px-2.5 py-1 rounded-md text-[11px]">
                {f}
              </span>
            ))}
            {t.features.length > 3 && (
              <span className="text-white/15 text-[11px] px-1">+{t.features.length - 3}</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            {t.old_price_rub && (
              <span className="text-white/20 text-sm line-through">
                {t.old_price_rub.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>
          <span className="text-accent-pale text-[26px] font-extrabold tracking-tight">
            {t.price_rub.toLocaleString('ru-RU')}
            <span className="text-[15px] font-medium ml-0.5">₽</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
