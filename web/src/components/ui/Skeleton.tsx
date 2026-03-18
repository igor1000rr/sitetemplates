export function TemplateCardSkeleton() {
  return (
    <div className="bg-bg-card rounded-[20px] overflow-hidden border border-white/[0.05] animate-pulse">
      <div className="aspect-[16/10] bg-white/[0.03]" />
      <div className="p-5 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-16 h-5 bg-white/[0.04] rounded-md" />
          <div className="w-12 h-4 bg-white/[0.03] rounded" />
        </div>
        <div className="h-5 bg-white/[0.04] rounded mb-2 w-3/4" />
        <div className="h-4 bg-white/[0.03] rounded mb-4 w-1/2" />
        <div className="flex gap-1.5 mb-4">
          <div className="w-16 h-5 bg-white/[0.03] rounded-md" />
          <div className="w-14 h-5 bg-white/[0.03] rounded-md" />
          <div className="w-12 h-5 bg-white/[0.03] rounded-md" />
        </div>
        <div className="flex justify-end">
          <div className="w-20 h-8 bg-white/[0.04] rounded" />
        </div>
      </div>
    </div>
  )
}

export function TemplateGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <TemplateCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function TemplateDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex gap-10 flex-wrap lg:flex-nowrap">
        <div className="flex-1 min-w-[300px]">
          <div className="rounded-2xl bg-white/[0.03] aspect-[16/10] mb-4" />
          <div className="flex gap-2 mb-8">
            {[1,2,3,4].map(i => <div key={i} className="w-20 h-14 rounded-lg bg-white/[0.03]" />)}
          </div>
          <div className="space-y-3">
            <div className="h-5 bg-white/[0.04] rounded w-1/3" />
            <div className="h-3 bg-white/[0.03] rounded w-full" />
            <div className="h-3 bg-white/[0.03] rounded w-5/6" />
            <div className="h-3 bg-white/[0.03] rounded w-4/6" />
          </div>
        </div>
        <div className="w-full lg:w-[360px] shrink-0">
          <div className="bg-bg-card rounded-2xl border border-white/[0.05] p-6">
            <div className="h-4 bg-white/[0.04] rounded w-1/3 mb-4" />
            <div className="h-6 bg-white/[0.04] rounded w-2/3 mb-4" />
            <div className="h-4 bg-white/[0.03] rounded w-1/4 mb-6" />
            <div className="h-10 bg-white/[0.05] rounded-xl mb-3 w-24" />
            <div className="h-12 bg-accent/20 rounded-xl mb-3" />
            <div className="h-10 bg-white/[0.04] rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function BlogCardSkeleton() {
  return (
    <div className="bg-bg-card rounded-xl overflow-hidden border border-white/[0.05] animate-pulse">
      <div className="aspect-[16/9] bg-white/[0.03]" />
      <div className="p-5">
        <div className="h-3 bg-white/[0.04] rounded w-16 mb-3" />
        <div className="h-5 bg-white/[0.04] rounded w-3/4 mb-2" />
        <div className="h-3 bg-white/[0.03] rounded w-full" />
      </div>
    </div>
  )
}

export function TextSkeleton({ lines = 3, widths }: { lines?: number; widths?: string[] }) {
  const defaultWidths = ['100%', '85%', '70%', '90%', '60%']
  return (
    <div className="space-y-2.5 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-white/[0.04] rounded" style={{ width: widths?.[i] || defaultWidths[i % defaultWidths.length] }} />
      ))}
    </div>
  )
}
