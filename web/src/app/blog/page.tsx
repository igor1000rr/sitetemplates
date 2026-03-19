import Link from 'next/link'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import { BreadcrumbSchema } from '@/components/seo/JsonLd'
import { apiFetchPaginated, apiFetchData } from '@/lib/server-fetch'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Блог — Полезные статьи о создании сайтов',
  description: 'Советы по выбору шаблона, настройке сайта, SEO-продвижению и веб-разработке.',
}

interface Props { searchParams: Record<string, string> }

export default async function BlogPage({ searchParams }: Props) {
  const sp = new URLSearchParams(searchParams)
  const [postsData, categories] = await Promise.all([
    apiFetchPaginated(`/api/blog?${sp}`),
    apiFetchData('/api/blog/categories'),
  ])

  const posts = postsData.data || []
  const meta = postsData.meta || {}
  const activeCategory = searchParams.category || ''

  return (
    <main className="min-h-screen pt-[100px] pb-16">
      <BreadcrumbSchema items={[
        { name: 'Главная', url: '/' },
        { name: 'Блог', url: '/blog' },
      ]} />
      <div className="max-w-[1100px] mx-auto px-8">
        <Breadcrumbs items={[{ label: 'Блог' }]} />
        {/* Header */}
        <div className="mb-10">
          <p className="text-accent-light text-[11px] font-bold tracking-[2px] uppercase mb-2">Блог</p>
          <h1 className="font-display text-[32px] font-bold tracking-tight">Полезные статьи</h1>
          <p className="text-white/30 text-sm mt-2 max-w-lg">Советы по выбору шаблона, настройке сайта и продвижению бизнеса в интернете</p>
        </div>

        {/* Categories filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-xl text-sm transition ${!activeCategory ? 'bg-accent/15 text-accent-pale font-semibold' : 'bg-white/[0.03] text-white/30 hover:text-white/60'}`}
            >
              Все
            </Link>
            {categories.map((cat: any) => (
              <Link
                key={cat.slug}
                href={`/blog?category=${cat.slug}`}
                className={`px-4 py-2 rounded-xl text-sm transition ${activeCategory === cat.slug ? 'bg-accent/15 text-accent-pale font-semibold' : 'bg-white/[0.03] text-white/30 hover:text-white/60'}`}
              >
                {cat.name}
                <span className="text-white/15 ml-1.5">{cat.posts_count}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/15 text-lg mb-2">Статей пока нет</p>
            <p className="text-white/10 text-sm">Скоро здесь появятся полезные материалы</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {posts.map((post: any, i: number) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-bg-card rounded-2xl overflow-hidden border border-white/[0.05] hover:border-accent/10 transition-all hover:-translate-y-1"
              >
                {/* Cover */}
                <div className="aspect-[16/9] bg-bg-surface overflow-hidden">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      loading={i < 3 ? 'eager' : 'lazy'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/[0.04]">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3 text-[11px]">
                    {post.category && (
                      <span className="text-accent-light/60 bg-accent/[0.06] px-2 py-0.5 rounded">{post.category.name}</span>
                    )}
                    <span className="text-white/15">{post.reading_time} мин чтения</span>
                  </div>

                  <h2 className="text-[15px] font-bold leading-snug mb-2 group-hover:text-accent-pale transition line-clamp-2">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-white/25 text-[13px] leading-relaxed line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-white/15">
                    <span>{post.published_at}</span>
                    <span>{post.views_count > 0 && `${post.views_count} просм.`}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/blog?${new URLSearchParams({ ...searchParams, page: String(p) })}`}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition ${
                  p === meta.current_page
                    ? 'bg-accent text-white font-bold'
                    : 'bg-white/[0.03] text-white/30 hover:text-white/60'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
