export default function Loading() {
  return (
    <main className="min-h-screen pt-[110px] pb-16 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-white/20 text-xs">Загрузка...</p>
      </div>
    </main>
  )
}
