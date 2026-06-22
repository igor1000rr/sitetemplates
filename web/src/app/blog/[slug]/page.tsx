import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ArticleSchema, BreadcrumbSchema } from '@/components/seo/JsonLd'
import { apiFetch } from '@/lib/server-fetch'
import { sanitizeHtml } from '@/lib/sanitize'
import { safeJsonLd } from '@/lib/jsonld'

interface Props { params: { slug: string } }

async function getPost(slug: string) {
  const data = await apiFetch<any>(`/api/blog/${slug}`, null)
  if (!data) return null
  return data.data || data || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getPost(params.slug)
  if (!data?.post) return { title: 'Статья не найдена' }
  const p = data.post
  return {
    title: p.meta_title || p.title,
    description: p.meta_desc || p.excerpt,
    openGraph: {
      title: p.title,
      description: p.excerpt || '',
      images: p.cover_image ? [p.cover_image] : [],
      type: 'article',
      publishedTime: p.published_at,
    },
  }
}

export default async function BlogArticle({ params }: Props) {
  const data = await getPost(params.slug)

  if (!data?.post) {
    return (
      <main className="min-h-screen pt-[120px] text-center">
        <h1 className="text-xl font-bold mb-3">Статья не найдена</h1>
        <Link href="/blog" className="text-accent-light text-sm">← Вернуться в блог</Link>
      </main>
    )
  }

  const post = data.post
  const related = data.related || []
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitempl.ru'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: post.cover_image || undefined,
    datePublished: post.published_at,
    author: { '@type': 'Person', name: post.author?.name || 'AITempl' },
    publisher: {
      '@type': 'Organization',
      name: 'AITempl',
      url: siteUrl,
    },
    mainEntityOfPage: `${siteUrl}/blog/${params.slug}`,
    wordCount: post.reading_time * 200,
  }

  return (
    <main className="min-h-screen pt-[100px] pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <BreadcrumbSchema items={[
        { name: 'Главная', url: '/' },
        { name: 'Блог', url: '/blog' },
        ...(post.category ? [{ name: post.category.name, url: `/blog?category=${post.category.slug}` }] : []),
        { name: post.title },
      ]} />
      <article className="max-w-[760px] mx-auto px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[12px] text-white/20 mb-8">
          <Link href="/" className="hover:text-white/50 transition">Главная</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-white/50 transition">Блог</Link>
          {post.category && (
            <>
              <span>/</span>
              <Link href={`/blog?category=${post.category.slug}`} className="hover:text-white/50 transition">{post.category.name}</Link>
            </>
          )}
        </div>

        {/* Header */}
        <header className="mb-8">
          {post.category && (
            <Link href={`/blog?category=${post.category.slug}`}
              className="inline-block text-accent-light/60 bg-accent/[0.06] px-3 py-1 rounded-lg text-[11px] font-medium mb-4 hover:bg-accent/[0.1] transition">
              {post.category.name}
            </Link>
          )}
          <h1 className="font-display text-[32px] md:text-[38px] font-bold tracking-tight leading-[1.15] mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-white/35 text-lg leading-relaxed">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-4 mt-5 text-white/20 text-[13px]">
            {post.author && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-accent-light text-xs font-bold">
                  {post.author.name?.[0]}
                </div>
                <span>{post.author.name}</span>
              </div>
            )}
            <span>{post.published_at}</span>
            <span>{post.reading_time} мин чтения</span>
            {post.views_count > 0 && <span>{post.views_count} просм.</span>}
          </div>
        </header>

        {/* Cover image */}
        {post.cover_image && (
          <div className="rounded-2xl overflow-hidden mb-10 aspect-[16/9] bg-bg-surface">
            <Image src={post.cover_image} alt={post.title} width={1200} height={675} priority className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-display prose-headings:tracking-tight
            prose-h2:text-[22px] prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-[18px] prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-white/50 prose-p:leading-relaxed prose-p:text-[15px]
            prose-a:text-accent-light prose-a:no-underline hover:prose-a:text-accent-pale
            prose-strong:text-white/70
            prose-li:text-white/50 prose-li:text-[15px]
            prose-blockquote:border-accent/30 prose-blockquote:text-white/40
            prose-code:bg-white/[0.05] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-accent-pale prose-code:text-[13px]
            prose-pre:bg-bg-surface prose-pre:border prose-pre:border-white/[0.05] prose-pre:rounded-xl
            prose-img:rounded-xl
          "
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-white/[0.05]">
            {post.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="text-[12px] text-white/20 bg-white/[0.03] px-3 py-1.5 rounded-lg hover:text-white/50 hover:bg-white/[0.06] transition"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 p-6 bg-gradient-to-r from-accent/[0.06] to-purple-600/[0.04] rounded-2xl border border-accent/10 text-center">
          <h3 className="font-display text-lg font-bold mb-2">Ищете шаблон для сайта?</h3>
          <p className="text-white/30 text-sm mb-4">Более 100 готовых шаблонов для любого бизнеса</p>
          <Link href="/templates" className="inline-block bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-dark transition">
            Каталог шаблонов →
          </Link>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="max-w-[1100px] mx-auto px-8 mt-16">
          <h2 className="font-display text-xl font-bold mb-6">Похожие статьи</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {related.map((r: any) => (
              <Link key={r.id} href={`/blog/${r.slug}`}
                className="group bg-bg-card rounded-xl overflow-hidden border border-white/[0.05] hover:border-accent/10 transition">
                <div className="aspect-[16/9] bg-bg-surface overflow-hidden">
                  {r.cover_image ? (
                    <Image src={r.cover_image} alt={r.title} width={480} height={270} sizes="(max-width: 768px) 100vw, 33vw" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/[0.04]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-[14px] font-bold leading-snug group-hover:text-accent-pale transition line-clamp-2">{r.title}</h3>
                  <div className="text-white/15 text-[11px] mt-2">{r.published_at} · {r.reading_time} мин</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
