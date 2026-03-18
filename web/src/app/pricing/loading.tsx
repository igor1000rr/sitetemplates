export default function Loading() {
  return (
    <main className="min-h-screen pt-[100px] pb-16">
      <div className="max-w-[1100px] mx-auto px-8">
        <div className="text-center mb-12 animate-pulse">
          <div className="h-3 w-16 bg-white/[0.04] rounded mx-auto mb-3" />
          <div className="h-10 w-72 bg-white/[0.04] rounded-lg mx-auto mb-4" />
          <div className="h-4 w-80 bg-white/[0.03] rounded mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[900px] mx-auto">
          {[1,2,3].map(i => (
            <div key={i} className="bg-bg-card rounded-2xl border border-white/[0.05] p-8 animate-pulse">
              <div className="h-5 w-20 bg-white/[0.04] rounded mb-4" />
              <div className="h-8 w-32 bg-white/[0.05] rounded mb-2" />
              <div className="h-3 w-24 bg-white/[0.03] rounded mb-6" />
              <div className="space-y-3">
                {[1,2,3,4].map(j => <div key={j} className="h-3 bg-white/[0.03] rounded" style={{width:`${60+j*10}%`}} />)}
              </div>
              <div className="h-12 bg-white/[0.05] rounded-xl mt-8" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
