import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { apiFetch } from '@/lib/server-fetch'

interface Props { params: { slug: string } }

async function getAuthor(slug: string) {
  const data = await apiFetch<any>(`/api/authors/${slug}`, null)
  if (!data) return null
  return data.data || data || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getAuthor(params.slug)
  if (!data) return { title: 'Автор не найден' }
  return {
    title: `${data.author.display_name} — Автор шаблонов`,
    description: data.author.bio || `Шаблоны от ${data.author.display_name}`,
  }
}

export default async function AuthorPublicProfile({ params }: Props) {
  const data = await getAuthor(params.slug)

  if (!data) {
    return (
      <main className="min-h-screen pt-[120px] text-center">
        <h1 className="text-xl font-bold mb-3">Автор не найден</h1>
        <Link href="/templates" className="text-accent-light text-sm">← Каталог</Link>
      </main>
    )
  }

  const { author, templates } = data
  const tList = templates?.data || templates || []

  return (
    <main className="min-h-screen pt-[100px] pb-16">
      <div className="max-w-[1100px] mx-auto px-8">
        {/* Author header */}
        <div className="flex items-start gap-6 mb-10">
          <div className="w-20 h-20 rounded-2xl bg-accent/15 flex items-center justify-center text-accent-pale font-bold text-2xl shrink-0">
            {author.avatar ? (
              <Image src={author.avatar} alt={author.display_name} width={160} height={160} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              author.display_name?.[0]?.toUpperCase()
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
              {author.display_name}
              {author.is_verified && <span className="text-green-400 text-sm">✓</span>}
            </h1>
            {author.specialization && (
              <div className="text-accent-light/60 text-sm mt-1">{author.specialization}</div>
            )}
            {author.bio && <p className="text-white/35 text-sm mt-2 max-w-lg">{author.bio}</p>}
            <div className="flex items-center gap-4 mt-3 text-white/20 text-xs">
              <span>{author.templates_count} шаблонов</span>
              <span>{author.total_sales} продаж</span>
              {author.website && (
                <a href={author.website} target="_blank" rel="noopener" className="text-accent-light/50 hover:text-accent-light transition">
                  {author.website.replace(/https?:\/\//, '').replace(/\/$/, '')}
                </a>
              )}
            </div>
            {author.social_links && (
              <div className="flex gap-3 mt-2">
                {author.social_links.telegram && (
                  <a href={`https://t.me/${author.social_links.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-white/15 hover:text-white/40 transition text-xs">Telegram</a>
                )}
                {author.social_links.vk && (
                  <a href={author.social_links.vk} target="_blank" rel="noopener noreferrer" className="text-white/15 hover:text-white/40 transition text-xs">VK</a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Templates */}
        <h2 className="text-lg font-bold mb-5">Шаблоны автора</h2>
        {tList.length === 0 ? (
          <div className="text-white/15 text-sm text-center py-12">Пока нет опубликованных шаблонов</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {tList.map((t: any) => (
              <Link key={t.id} href={`/templates/${t.slug}`}
                className="group bg-bg-card rounded-[20px] overflow-hidden border border-white/[0.05] hover:border-accent/15 transition-all hover:-translate-y-1">
                <div className="relative aspect-[16/10] bg-bg-surface overflow-hidden">
                  {t.image && <Image src={t.image} alt={t.title} width={480} height={300} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-accent/[0.08] text-accent-light px-2.5 py-0.5 rounded-md text-[11px] font-semibold">{t.platform?.name}</span>
                    <span className="text-white/20 text-[11px]">{t.category?.name}</span>
                  </div>
                  <h3 className="text-[15px] font-bold leading-snug mb-2 group-hover:text-accent-pale transition">{t.title}</h3>
                  <div className="flex items-baseline justify-between">
                    {t.old_price_rub && <span className="text-white/15 text-sm line-through">{t.old_price_rub.toLocaleString('ru-RU')} ₽</span>}
                    <span className="text-accent-pale text-xl font-extrabold ml-auto">{t.price_rub.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
