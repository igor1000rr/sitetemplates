export default function Loading() {
  return (
    <main className="min-h-screen pt-[140px] flex items-start justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p className="text-white/20 text-sm">Загрузка...</p>
      </div>
    </main>
  )
}
