export default function Loading() {
  return (
    <main className="min-h-screen pt-[100px] pb-16">
      <article className="max-w-[760px] mx-auto px-8 animate-pulse">
        <div className="h-3 w-40 bg-white/[0.03] rounded mb-8" />
        <div className="h-10 w-3/4 bg-white/[0.05] rounded-lg mb-4" />
        <div className="h-4 w-48 bg-white/[0.03] rounded mb-8" />
        <div className="aspect-[16/9] bg-white/[0.03] rounded-2xl mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-3 bg-white/[0.03] rounded" style={{width: `${70 + Math.random() * 30}%`}} />
          ))}
        </div>
      </article>
    </main>
  )
}
