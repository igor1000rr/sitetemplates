export default function TemplateDetailLoading() {
  return (
    <main className="min-h-screen pt-[20px] pb-16">
      <div className="max-w-[1200px] mx-auto px-8">
        {/* Breadcrumbs skeleton */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-3 w-16 bg-white/[0.03] rounded animate-pulse" />
          ))}
        </div>

        <div className="flex gap-10 flex-wrap lg:flex-nowrap">
          {/* Gallery skeleton */}
          <div className="flex-1 min-w-[300px]">
            <div className="rounded-2xl aspect-[16/10] bg-white/[0.03] animate-pulse mb-4" />
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-20 h-14 rounded-lg bg-white/[0.02] animate-pulse" />
              ))}
            </div>
            <div className="mt-8 space-y-3">
              <div className="h-6 w-32 bg-white/[0.04] rounded animate-pulse" />
              <div className="h-4 w-full bg-white/[0.03] rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-white/[0.03] rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-white/[0.03] rounded animate-pulse" />
            </div>
          </div>

          {/* Sidebar skeleton */}
          <aside className="w-full lg:w-[360px] shrink-0">
            <div className="bg-bg-card rounded-2xl border border-white/[0.05] p-6">
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-20 bg-white/[0.04] rounded-md animate-pulse" />
                <div className="h-6 w-16 bg-white/[0.03] rounded-md animate-pulse" />
              </div>
              <div className="h-7 w-48 bg-white/[0.05] rounded animate-pulse mb-4" />
              <div className="h-5 w-32 bg-white/[0.03] rounded animate-pulse mb-5" />
              <div className="h-10 w-40 bg-white/[0.06] rounded animate-pulse mb-6" />
              <div className="h-12 bg-accent/20 rounded-xl animate-pulse mb-3" />
              <div className="h-10 bg-white/[0.03] rounded-xl animate-pulse" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
