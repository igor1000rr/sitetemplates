export default function TemplatesLoading() {
  return (
    <main className="min-h-screen pt-[20px] pb-16">
      <div className="max-w-[1300px] mx-auto px-8">
        <div className="mb-8">
          <div className="h-3 w-16 bg-white/[0.03] rounded mb-3 animate-pulse" />
          <div className="h-9 w-64 bg-white/[0.04] rounded-lg animate-pulse" />
        </div>

        <div className="flex gap-8 flex-wrap lg:flex-nowrap">
          {/* Sidebar skeleton */}
          <aside className="w-full lg:w-[220px] shrink-0">
            <div className="space-y-6">
              <div>
                <div className="h-2 w-12 bg-white/[0.03] rounded mb-3 animate-pulse" />
                <div className="h-9 bg-white/[0.04] rounded-lg animate-pulse" />
              </div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-7 bg-white/[0.03] rounded-lg animate-pulse" style={{ width: `${60 + i * 8}%` }} />
              ))}
            </div>
          </aside>

          {/* Grid skeleton */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-bg-card rounded-[20px] overflow-hidden border border-white/[0.05]">
                  <div className="aspect-[16/10] bg-white/[0.02] animate-pulse" />
                  <div className="p-5 pb-6">
                    <div className="flex gap-2 mb-3">
                      <div className="h-5 w-16 bg-white/[0.03] rounded-md animate-pulse" />
                      <div className="h-5 w-12 bg-white/[0.02] rounded-md animate-pulse" />
                    </div>
                    <div className="h-5 w-3/4 bg-white/[0.04] rounded animate-pulse mb-2" />
                    <div className="h-4 w-1/2 bg-white/[0.03] rounded animate-pulse mb-4" />
                    <div className="flex justify-end">
                      <div className="h-8 w-24 bg-white/[0.04] rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
