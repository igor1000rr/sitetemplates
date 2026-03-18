export default function Loading() {
  return (
    <main className="min-h-screen pt-[100px] pb-16">
      <div className="max-w-[1100px] mx-auto px-8">
        <div className="text-center mb-12 animate-pulse">
          <div className="h-3 w-16 bg-white/[0.04] rounded mx-auto mb-3" />
          <div className="h-9 w-48 bg-white/[0.04] rounded-lg mx-auto mb-3" />
          <div className="h-4 w-64 bg-white/[0.03] rounded mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-bg-card rounded-xl overflow-hidden border border-white/[0.05] animate-pulse">
              <div className="aspect-[16/9] bg-white/[0.03]" />
              <div className="p-5">
                <div className="h-3 w-16 bg-white/[0.04] rounded mb-3" />
                <div className="h-5 w-3/4 bg-white/[0.04] rounded mb-2" />
                <div className="h-3 w-full bg-white/[0.03] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
