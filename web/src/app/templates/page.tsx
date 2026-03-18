import type { Metadata } from 'next'
import type { TemplateListItem, Category, Platform } from '@/types'
import TemplateCard from '@/components/templates/TemplateCard'
import CatalogFilters from '@/components/templates/CatalogFilters'
import Breadcrumbs from '@/components/shared/Breadcrumbs'
import { BreadcrumbSchema } from '@/components/seo/JsonLd'

export const dynamic = 'force-dynamic'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export const metadata: Metadata = {
  title: 'Каталог шаблонов — WordPress и Tilda',
  description: 'Все шаблоны сайтов для бизнеса. WordPress, Tilda. Лендинги, многостраничники, интернет-магазины.',
}

interface Props {
  searchParams: Record<string, string | undefined>
}

async function getTemplates(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v) })
  try {
    const res = await fetch(`${API_URL}/api/templates?${sp}`, { next: { revalidate: 30 } })
    return await res.json()
  } catch { return { data: [], meta: {} } }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, { next: { revalidate: 300 } })
    return await res.json()
  } catch { return [] }
}

async function getPlatforms(): Promise<Platform[]> {
  try {
    const res = await fetch(`${API_URL}/api/platforms`, { next: { revalidate: 300 } })
    return await res.json()
  } catch { return [] }
}

export default async function TemplatesPage({ searchParams }: Props) {
  const [data, categories, platforms] = await Promise.all([
    getTemplates(searchParams),
    getCategories(),
    getPlatforms(),
  ])

  const templates: TemplateListItem[] = data.data || []
  const meta = data.meta || {}
  const currentPage = meta.current_page || 1
  const lastPage = meta.last_page || 1

  return (
    <main className="min-h-screen pt-[20px] pb-16">
      <BreadcrumbSchema items={[
        { name: 'Главная', url: '/' },
        { name: 'Каталог', url: '/templates' },
      ]} />
      <div className="max-w-[1300px] mx-auto px-8">
        <Breadcrumbs items={[{ label: 'Каталог' }]} />
        {/* Header */}
        <div className="mb-8">
          <p className="text-accent-light text-[11px] font-bold tracking-[2px] uppercase mb-2">Каталог</p>
          <h1 className="font-display text-[32px] font-bold tracking-tight">
            Шаблоны сайтов
            {searchParams.category && categories.find(c => c.slug === searchParams.category) && (
              <span className="text-accent-pale"> · {categories.find(c => c.slug === searchParams.category)?.name}</span>
            )}
          </h1>
          {searchParams.search && (
            <p className="text-white/30 text-sm mt-1">
              Результаты поиска: «{searchParams.search}»
            </p>
          )}
        </div>

        <div className="flex gap-8 flex-wrap lg:flex-nowrap">
          {/* Sidebar Filters */}
          <CatalogFilters
            categories={categories}
            platforms={platforms}
            current={searchParams}
          />

          {/* Templates grid */}
          <div className="flex-1 min-w-0">
            {templates.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-white/10 text-[60px] mb-4">∅</div>
                <h2 className="font-display text-lg font-bold mb-2">Ничего не найдено</h2>
                <p className="text-white/25 text-sm">Попробуйте изменить фильтры или поисковый запрос</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {templates.map((t, i) => (
                    <TemplateCard key={t.id} template={t} priority={i < 3} />
                  ))}
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {currentPage > 1 && (
                      <PaginationLink page={currentPage - 1} params={searchParams} label="←" />
                    )}
                    {Array.from({ length: lastPage }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 2)
                      .map((p, i, arr) => {
                        const prev = arr[i - 1]
                        const showGap = prev && p - prev > 1
                        return (
                          <span key={p} className="contents">
                            {showGap && <span className="w-8 h-8 flex items-center justify-center text-white/15">…</span>}
                            <PaginationLink page={p} params={searchParams} current={p === currentPage} />
                          </span>
                        )
                      })}
                    {currentPage < lastPage && (
                      <PaginationLink page={currentPage + 1} params={searchParams} label="→" />
                    )}
                  </div>
                )}

                {/* Count */}
                <p className="text-center text-white/15 text-xs mt-4">
                  Показано {templates.length} из {meta.total || templates.length} шаблонов
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function PaginationLink({ page, params, current, label }: {
  page: number; params: Record<string, string | undefined>; current?: boolean; label?: string
}) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v && k !== 'page') sp.set(k, v) })
  sp.set('page', String(page))

  return (
    <a
      href={`/templates?${sp}`}
      className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition ${
        current
          ? 'bg-accent text-white'
          : 'bg-white/[0.03] text-white/30 hover:text-white/60 hover:bg-white/[0.06]'
      }`}
    >
      {label || page}
    </a>
  )
}
